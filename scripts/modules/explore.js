import { getDictionaryEntries } from '../dictionary.service.js';
import { getDecks, getCards, saveCards, getExploreState, saveExploreState } from '../storage.local.js';

const uid = () => crypto.randomUUID();
const cooldown = 1000 * 60 * 60 * 24 * 30;

export const renderExplore = (root) => {
  const state = getExploreState();
  const decks = getDecks();
  const entries = getDictionaryEntries().filter((item) => {
    const s = state[item.id];
    return !s || (s.nextReviewAt && s.nextReviewAt < Date.now());
  });
  if (!entries.length) {
    root.innerHTML = '<div class="view-grid"><article class="card">No hay sugerencias por ahora.</article></div>';
    return;
  }
  const current = entries[Math.floor(Math.random() * entries.length)];
  root.innerHTML = `<div class="view-grid"><article class="card"><h3>${current.text}</h3><p>${current.translation}</p><p>${current.article || '-'} · ${current.type}</p><select id="explore-deck" class="input"><option value="">Elegir mazo</option>${decks.map((d)=>`<option value="${d.id}">${d.name}</option>`).join('')}</select><div class="row"><button id="save" class="btn">Guardar</button><button id="skip" class="btn-ghost">Pasar</button><button id="known" class="btn-ghost">Ya me la sé</button></div></article></div>`;

  root.querySelector('#save').onclick = () => {
    const deckId = root.querySelector('#explore-deck').value;
    if (!deckId) return alert('Elige mazo para guardar');
    saveCards([...getCards(), { ...current, id: uid(), deckId, sourceLang: 'de', targetLang: 'es', inputLang: 'de', notes: '' }]);
    state[current.id] = { status: 'saved', nextReviewAt: Date.now() + 1000 };
    saveExploreState(state);
    renderExplore(root);
  };
  root.querySelector('#skip').onclick = () => { state[current.id] = { status: 'skipped', nextReviewAt: Date.now() + cooldown }; saveExploreState(state); renderExplore(root); };
  root.querySelector('#known').onclick = () => { state[current.id] = { status: 'known', nextReviewAt: Date.now() + cooldown * 4 }; saveExploreState(state); renderExplore(root); };
};
