import { getDictionaryEntries } from '../dictionary.service.js';
import { getDecks, getCards, saveCards, getExploreState, saveExploreState } from '../storage.local.js';
const uid = () => crypto.randomUUID();
const cooldown = 1000 * 60 * 10;
const reviewedDeckName = 'Revisadas de explorar';

export const renderExplore = (root) => {
  const state = getExploreState();
  const entries = getDictionaryEntries().filter((item) => !state[item.id] || state[item.id].nextReviewAt < Date.now());
  if (!entries.length) return void(root.innerHTML = '<div class="view-grid"><article class="card">No hay sugerencias por ahora.</article></div>');
  const current = entries[Math.floor(Math.random() * entries.length)];
  root.innerHTML = `<div class="view-grid"><article class="card"><h3>${current.text}</h3><p>${current.translation}</p><p>${current.article || '-'} · ${current.kind || 'entrada'}</p><div class="row"><button id="save" class="btn">Guardar</button><button id="skip" class="btn-ghost">Pasar</button><button id="known" class="btn-ghost">Ya me la sé</button></div></article></div>`;
  root.querySelector('#save').onclick = () => {
    const deckId = getDecks()[0]?.id;
    if (!deckId) return alert('Crea un mazo primero en Mazos');
    saveCards([...getCards(), { ...current, id: uid(), deckId, notes: '' }]);
    state[current.id] = { status: 'saved', nextReviewAt: Date.now() + 1000 };
    saveExploreState(state); renderExplore(root);
  };
  root.querySelector('#skip').onclick = () => { state[current.id] = { status: 'skipped', nextReviewAt: Date.now() + cooldown }; saveExploreState(state); renderExplore(root); };
  root.querySelector('#known').onclick = () => { state[current.id] = { status: 'known', bucket: reviewedDeckName, nextReviewAt: Date.now() + cooldown }; saveExploreState(state); renderExplore(root); };
};
