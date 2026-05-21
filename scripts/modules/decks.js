import { getDecks, saveDecks, getCards, saveCards } from '../storage.local.js';

const uid = () => crypto.randomUUID();

export const renderDecks = (root) => {
  const decks = getDecks();
  root.innerHTML = `<div class="view-grid"><div class="row"><input id="new-deck" class="input" placeholder="Nombre del mazo"><button id="create-deck" class="btn">Crear mazo</button></div><div id="deck-list"></div></div>`;
  const list = root.querySelector('#deck-list');

  const paint = () => {
    const current = getDecks();
    if (!current.length) {
      list.innerHTML = '<article class="card">Aún no tienes mazos</article>';
      return;
    }
    list.innerHTML = current.map((d) => `<article class="card"><div class="row"><strong>${d.name}</strong><span>${d.id}</span></div><div class="row"><button class="btn-ghost" data-edit="${d.id}">Editar</button><button class="btn-ghost" data-delete="${d.id}">Borrar</button></div></article>`).join('');
  };
  paint();

  root.querySelector('#create-deck').onclick = () => {
    const input = root.querySelector('#new-deck');
    const name = input.value.trim();
    if (!name) return;
    saveDecks([...getDecks(), { id: uid(), name }]);
    input.value = '';
    paint();
  };

  list.onclick = (e) => {
    const editId = e.target.dataset.edit;
    const deleteId = e.target.dataset.delete;
    if (editId) {
      const next = prompt('Nuevo nombre del mazo');
      if (!next?.trim()) return;
      saveDecks(getDecks().map((d) => (d.id === editId ? { ...d, name: next.trim() } : d)));
      paint();
    }
    if (deleteId) {
      const deleteCards = confirm('¿Borrar también tarjetas asociadas?');
      saveDecks(getDecks().filter((d) => d.id !== deleteId));
      if (deleteCards) saveCards(getCards().filter((c) => c.deckId !== deleteId));
      paint();
    }
  };
};
