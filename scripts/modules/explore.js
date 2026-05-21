import { fetchDictionaryEntries } from '../dictionary.service.js';
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

const isExcluded = (stateItem) => ['known', 'unknown', 'saved', 'skipped'].includes(stateItem?.status);

export const renderExplore = async (root) => {
  root.innerHTML = '<div class="view-grid"><article class="card">Cargando palabras…</article></div>';
  const entries = await fetchDictionaryEntries();
  const state = getExploreState();
  const available = entries.filter((entry) => !isExcluded(state[entry.id]));

  if (!available.length) {
    root.innerHTML = '<div class="view-grid"><article class="card">No quedan palabras nuevas en Explorar.</article></div>';
    return;
  }

  const entry = available[Math.floor(Math.random() * available.length)];
  state[entry.id] = { ...(state[entry.id] || {}), views: (state[entry.id]?.views || 0) + 1, status: 'seen' };
  saveExploreState(state);

  root.innerHTML = `<div class="view-grid"><article class="card"><div class="row row-compact"><h3>${entry.text}</h3><button id="play" class="btn-icon" title="Audio">▶︎</button></div><p>${entry.translation || '<span class="small">Sin traducción automática en origen</span>'}</p><div class="row row-compact"><button id="save" class="btn">Guardar</button><button id="skip" class="btn-ghost">Pasar</button><button id="known" class="btn-ghost">Ya me la sé</button></div></article></div>`;

  root.querySelector('#play').onclick = () => speakText(entry.text, 'de-DE');
  root.querySelector('#save').onclick = () => {
    const decks = getDecks().filter((d) => d.name !== reviewedDeckName);
    if (!decks.length) return alert('Crea un mazo primero.');
    const options = decks.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const idx = Number(prompt(`Elige mazo:\n${options}`, '1')) - 1;
    const deck = decks[idx] || decks[0];
    saveCards([...getCards(), { ...entry, id: uid(), deckId: deck.id, inputLang: 'de' }]);
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status: 'saved' } });
    renderExplore(root);
  };
  root.querySelector('#skip').onclick = () => {
    const deck = ensureReviewedDeck();
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status: 'unknown', reviewedDeckId: deck.id } });
    renderExplore(root);
  };
  root.querySelector('#known').onclick = () => {
    const deck = ensureReviewedDeck();
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status: 'known', reviewedDeckId: deck.id } });
    renderExplore(root);
  };
};
