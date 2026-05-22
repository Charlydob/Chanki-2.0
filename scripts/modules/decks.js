import { getDecks, saveDecks, getCards, saveCards, saveSelectedDeckId } from '../storage.local.js';

const uid = () => crypto.randomUUID();

export const renderDecks = (root) => {
  const renderList = () => {
    root.innerHTML = `<div class="view-grid"><div class="row"><input id="new-deck" class="input" placeholder="Nombre del mazo"><button id="create-deck" class="btn btn-mini">Crear</button></div><div id="deck-list" class="deck-list"></div></div>`;
    const list = root.querySelector('#deck-list');
    const decks = getDecks();
    const cards = getCards();
    list.innerHTML = decks.length
      ? decks.map((d) => `<article class="card deck-item"><div class="row"><strong>${d.name}</strong><span>${cards.filter((c) => c.deckId === d.id).length} tarjetas</span></div><div class="row row-compact"><button class="btn btn-mini" data-enter="${d.id}">Abrir</button><button class="btn-icon btn-mini" data-edit="${d.id}">✏</button><button class="btn-icon btn-mini" data-delete="${d.id}">🗑</button></div></article>`).join('')
      : '<article class="card">Aún no tienes mazos</article>';

    root.querySelector('#create-deck').onclick = () => {
      const input = root.querySelector('#new-deck');
      const name = input.value.trim();
      if (!name) return;
      const deck = { id: uid(), name };
      saveDecks([...getDecks(), deck]);
      saveSelectedDeckId(deck.id);
      renderList();
    };

    list.onclick = (e) => {
      const id = e.target.dataset.enter || e.target.dataset.edit || e.target.dataset.delete;
      if (!id) return;
      if (e.target.dataset.enter) return renderDetail(id);
      if (e.target.dataset.edit) {
        const next = prompt('Nuevo nombre del mazo');
        if (next?.trim()) saveDecks(getDecks().map((d) => d.id === id ? { ...d, name: next.trim() } : d));
      }
      if (e.target.dataset.delete) {
        saveDecks(getDecks().filter((d) => d.id !== id));
        saveCards(getCards().filter((c) => c.deckId !== id));
      }
      renderList();
    };
  };

  const renderDetail = (id) => {
    const deck = getDecks().find((d) => d.id === id);
    if (!deck) return renderList();
    saveSelectedDeckId(id);
    const cards = getCards().filter((c) => c.deckId === id);
    root.innerHTML = `<div class="view-grid"><div class="row row-compact"><button id="back" class="btn-chip btn-mini">←</button><h2>${deck.name}</h2></div><div class="row row-compact"><span class="small">${cards.length} tarjetas</span><button id="open-cards" class="btn btn-mini">+ Tarjeta</button></div><div id="deck-cards">${cards.length ? cards.map((c) => `<article class="card card-row"><span>${c.text} · ${c.translation}</span><div class="row row-compact"><button class="btn-icon btn-mini edit" data-id="${c.id}">✏</button><button class="btn-icon btn-mini del" data-id="${c.id}">🗑</button></div></article>`).join('') : '<article class="card"><p class="small">Sin tarjetas.</p></article>'}</div></div>`;
    root.querySelector('#back').onclick = renderList;
    root.querySelector('#open-cards').onclick = () => location.hash = '#/cards';
    root.querySelector('#deck-cards').onclick = (e) => {
      const cardId = e.target.dataset.id;
      if (!cardId) return;
      if (e.target.classList.contains('del')) {
        saveCards(getCards().filter((c) => c.id !== cardId));
        return renderDetail(id);
      }
      if (e.target.classList.contains('edit')) location.hash = '#/cards';
    };
  };

  renderList();
};
