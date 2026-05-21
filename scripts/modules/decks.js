import { getDecks, saveDecks, getCards, saveCards, saveSelectedDeckId } from '../storage.local.js';

const uid = () => crypto.randomUUID();

export const renderDecks = (root, go) => {
  root.innerHTML = `<div class="view-grid"><div class="row"><input id="new-deck" class="input" placeholder="Nombre del mazo"><button id="create-deck" class="btn">Crear</button></div><div id="deck-list"></div></div>`;
  const list = root.querySelector('#deck-list');

  const paint = () => {
    const decks = getDecks();
    const cards = getCards();
    if (!decks.length) return void(list.innerHTML = '<article class="card">Aún no tienes mazos</article>');
    list.innerHTML = decks.map((d) => `<article class="card"><div class="row"><strong>${d.name}</strong><span>${cards.filter((c)=>c.deckId===d.id).length} tarjetas</span></div><div class="row"><button class="btn" data-enter="${d.id}">Entrar</button><button class="btn-ghost" data-edit="${d.id}">✏️</button><button class="btn-ghost" data-delete="${d.id}">🗑️</button></div></article>`).join('');
  };
  paint();

  root.querySelector('#create-deck').onclick = () => {
    const input = root.querySelector('#new-deck');
    const name = input.value.trim(); if (!name) return;
    const deck = { id: uid(), name }; saveDecks([...getDecks(), deck]); saveSelectedDeckId(deck.id); input.value = ''; paint();
  };

  list.onclick = (e) => {
    const id = e.target.dataset.enter || e.target.dataset.edit || e.target.dataset.delete; if (!id) return;
    if (e.target.dataset.enter) return saveSelectedDeckId(id), go('cards');
    if (e.target.dataset.edit) { const next = prompt('Nuevo nombre del mazo'); if (next?.trim()) saveDecks(getDecks().map((d) => d.id === id ? { ...d, name: next.trim() } : d)); }
    if (e.target.dataset.delete) { saveDecks(getDecks().filter((d) => d.id !== id)); saveCards(getCards().filter((c) => c.deckId !== id)); }
    paint();
  };
};
