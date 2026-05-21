import { getDictionaryEntries } from '../dictionary.service.js';
import { getDecks, saveDecks, getCards, saveCards, getExploreState, saveExploreState } from '../storage.local.js';
import { speakText } from '../shared/speech.js';

const uid = () => crypto.randomUUID();
const reviewedDeckName = 'Explorar · revisadas';
const ensureReviewedDeck = () => {
  const decks = getDecks();
  let deck = decks.find((d) => d.name === reviewedDeckName);
  if (!deck) { deck = { id: uid(), name: reviewedDeckName }; saveDecks([...decks, deck]); }
  return deck;
};

export const renderExplore = (root) => {
  const state = getExploreState();
  const entry = getDictionaryEntries()[Math.floor(Math.random() * getDictionaryEntries().length)];
  if (!entry) return;
  state[entry.id] = state[entry.id] || { views: 0, status: 'seen', reviewCount: 0 };
  state[entry.id].views += 1;
  saveExploreState(state);
  root.innerHTML = `<div class="view-grid"><article class="card"><div class="row"><h3>${entry.text}</h3><button id="play" class="btn-ghost">🔊</button></div><p>${entry.translation}</p><div class="row"><button id="save" class="btn">Guardar</button><button id="skip" class="btn-ghost">Pasar</button><button id="known" class="btn-ghost">Ya me la sé</button></div></article></div>`;
  root.querySelector('#play').onclick=()=>speakText(entry.text,'de-DE');
  root.querySelector('#save').onclick = () => {
    const decks = getDecks(); if (!decks.length) return alert('Crea un mazo primero.');
    const options = decks.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const idx = Number(prompt(`Elige mazo:\n${options}`, '1')) - 1;
    const deck = decks[idx] || decks[0];
    saveCards([...getCards(), { ...entry, id: uid(), deckId: deck.id, inputLang: 'de' }]);
    state[entry.id] = { ...(state[entry.id] || {}), status: 'saved' }; saveExploreState(state); renderExplore(root);
  };
  root.querySelector('#skip').onclick = () => { state[entry.id] = { ...(state[entry.id] || {}), status: 'skipped', reviewCount: (state[entry.id]?.reviewCount || 0) + 1 }; saveExploreState(state); renderExplore(root); };
  root.querySelector('#known').onclick = () => { const deck = ensureReviewedDeck(); state[entry.id] = { ...(state[entry.id] || {}), status: 'known', reviewCount: 0, reviewedDeckId: deck.id }; saveExploreState(state); renderExplore(root); };
};
