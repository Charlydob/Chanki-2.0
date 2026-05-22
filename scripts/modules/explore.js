import { fetchDictionaryEntries } from '../dictionary.service.js';
import { translateText } from '../translate.service.js';
import { getDecks, saveDecks, getCards, saveCards, getExploreState, saveExploreState, getSelectedDeckId } from '../storage.local.js';
import { speakText } from '../shared/speech.js';

const uid = () => crypto.randomUUID();
const reviewedDeckName = 'Explorar · revisadas';
let activeRequestId = 0;

const ensureReviewedDeck = () => {
  const decks = getDecks();
  let deck = decks.find((d) => d.name === reviewedDeckName);
  if (!deck) { deck = { id: uid(), name: reviewedDeckName }; saveDecks([...decks, deck]); }
  return deck;
};

const excluded = ['known', 'unknown', 'saved', 'skipped'];
const reviewedIds = () => new Set(getCards().filter((c) => c.source === 'explore' && c.sourceItemId).map((c) => c.sourceItemId));
const currentRoute = () => (location.hash || '').replace('#/', '');

const withTimeout = (promise, ms = 8000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

export const renderExplore = async (root) => {
  const requestId = ++activeRequestId;
  root.innerHTML = '<div class="view-grid"><article class="card">Cargando palabras…</article></div>';

  let entries;
  try {
    entries = await withTimeout(fetchDictionaryEntries(), 8000);
  } catch {
    if (requestId !== activeRequestId || currentRoute() !== 'explore') return;
    root.innerHTML = '<div class="view-grid"><article class="card"><p>Error al cargar palabras.</p><button id="retry" class="btn">Reintentar</button></article></div>';
    root.querySelector('#retry').onclick = () => renderExplore(root);
    return;
  }

  if (requestId !== activeRequestId || currentRoute() !== 'explore') return;
  const state = getExploreState();
  const available = entries.filter((entry) => !excluded.includes(state[entry.id]?.status) && !reviewedIds().has(entry.id));
  if (!available.length) return void (root.innerHTML = '<div class="view-grid"><article class="card">No quedan palabras nuevas en Explorar.</article></div>');

  const entry = available[Math.floor(Math.random() * available.length)];
  state[entry.id] = { ...(state[entry.id] || {}), views: (state[entry.id]?.views || 0) + 1, status: 'seen' };
  saveExploreState(state);

  let translation = entry.translation || await translateText({ text: entry.text, from: 'de', to: 'es' });
  const failed = !translation;

  root.innerHTML = `<div class="view-grid"><article class="card"><div class="row row-compact"><h3>${entry.text}</h3><button id="play" class="btn-icon btn-mini">▶</button></div>${failed ? '<p>No se pudo traducir</p>' : `<p>${translation}</p>`}<div class="row row-compact"><button id="save" class="btn btn-mini">Guardar</button><button id="skip" class="btn-ghost btn-mini">Pasar</button><button id="known" class="btn-ghost btn-mini">Ya me la sé</button></div></article></div>`;
  root.querySelector('#play').onclick = () => speakText(entry.text, 'de-DE');

  const mark = (status) => {
    const reviewedDeck = ensureReviewedDeck();
    const destinationId = status === 'saved' ? ((getDecks().find((d) => d.id === getSelectedDeckId()) || getDecks().find((d) => d.name !== reviewedDeckName) || reviewedDeck).id) : reviewedDeck.id;
    saveCards([...getCards(), { id: uid(), deckId: reviewedDeck.id, text: entry.text, translation: translation || '', source: 'explore', sourceItemId: entry.id, exploreStatus: status, inputLang: 'de' }]);
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status, reviewedDeckId: destinationId } });
    renderExplore(root);
  };
  root.querySelector('#save').onclick = () => mark('saved');
  root.querySelector('#skip').onclick = () => mark('unknown');
  root.querySelector('#known').onclick = () => mark('known');
};
