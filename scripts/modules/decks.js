import { getDecks, saveDecks, getCards, saveCards, saveSelectedDeckId } from '../storage.local.js';

const uid = () => crypto.randomUUID();

export const renderDecks = (root, go) => {
  root.innerHTML = `<div class="view-grid"><div class="row"><input id="new-deck" class="input" placeholder="Nombre del mazo"><button id="create-deck" class="btn">Crear</button></div><div id="deck-list"></div><section id="deck-detail"></section></div>`;
  const list = root.querySelector('#deck-list');

  const paint = () => {
    const decks = getDecks();
    const cards = getCards();
    if (!decks.length) return void(list.innerHTML = '<article class="card">Aún no tienes mazos</article>');
    list.innerHTML = decks.map((d) => `<article class="card"><div class="row"><strong>${d.name}</strong><span>${cards.filter((c)=>c.deckId===d.id).length} tarjetas</span></div><div class="row"><button class="btn" data-enter="${d.id}">Abrir</button><button class="btn-ghost" data-edit="${d.id}">✏️</button><button class="btn-ghost" data-delete="${d.id}">🗑️</button></div></article>`).join('');
  };
  paint();

  root.querySelector('#create-deck').onclick = () => {
    const input = root.querySelector('#new-deck');
    const name = input.value.trim(); if (!name) return;
    const deck = { id: uid(), name }; saveDecks([...getDecks(), deck]); saveSelectedDeckId(deck.id); input.value = ''; paint();
  };

  list.onclick = (e) => {
    const id = e.target.dataset.enter || e.target.dataset.edit || e.target.dataset.delete; if (!id) return;
    if (e.target.dataset.enter) return saveSelectedDeckId(id), renderDetail(id);
    if (e.target.dataset.edit) { const next = prompt('Nuevo nombre del mazo'); if (next?.trim()) saveDecks(getDecks().map((d) => d.id === id ? { ...d, name: next.trim() } : d)); }
    if (e.target.dataset.delete) { saveDecks(getDecks().filter((d) => d.id !== id)); saveCards(getCards().filter((c) => c.deckId !== id)); }
    paint();
  };
};


const renderDetail = (id) => { const root=document.getElementById('app-view'); const deck=getDecks().find(d=>d.id===id); if(!deck) return; const cards=getCards().filter(c=>c.deckId===id); const detail=root.querySelector('#deck-detail'); detail.innerHTML=`<article class="card view-grid"><h3>${deck.name}</h3><div class="row"><input id="new-card-text" class="input compact" placeholder="Nueva tarjeta"><input id="new-card-tr" class="input compact" placeholder="Traducción"><button id="add-card-inline" class="btn">Guardar</button></div>${cards.map(c=>`<p>${c.text} · ${c.translation}</p>`).join('')||'<p class="small">Sin tarjetas.</p>'}</article>`; detail.querySelector('#add-card-inline').onclick=()=>{const text=detail.querySelector('#new-card-text').value.trim(); const translation=detail.querySelector('#new-card-tr').value.trim(); if(!text||!translation)return; saveCards([...getCards(),{id:uid(),deckId:id,inputLang:'de',text,translation}]); renderDetail(id); paint();}; };