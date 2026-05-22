import { fetchDictionaryEntries } from '../dictionary.service.js';
import { translateText } from '../translate.service.js';
import { getDecks, saveDecks, getCards, saveCards, getExploreState, saveExploreState, getSelectedDeckId } from '../storage.local.js';
import { speakText } from '../shared/speech.js';

const uid = () => crypto.randomUUID();
const reviewedDeckName = 'Explorar · revisadas';
const CURRENT_KEY = 'cardshell.currentExploreItem';

const ensureReviewedDeck = () => {
  const decks = getDecks();
  let deck = decks.find((d) => d.name === reviewedDeckName);
  if (!deck) { deck = { id: uid(), name: reviewedDeckName }; saveDecks([...decks, deck]); }
  return deck;
};

const reviewedIds = () => new Set(getCards().filter((c) => c.source === 'explore' && c.sourceItemId).map((c) => c.sourceItemId));

const pickEntry = (entries) => {
  const state = getExploreState();
  const eligible = entries.filter((item) => !reviewedIds().has(item.id) && state[item.id]?.status !== 'known' && state[item.id]?.status !== 'unknown' && state[item.id]?.status !== 'saved');
  if (!eligible.length) return null;
  const current = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  if (current && eligible.some((i) => i.id === current.id)) return current;
  const next = eligible[Math.floor(Math.random() * eligible.length)];
  localStorage.setItem(CURRENT_KEY, JSON.stringify(next));
  return next;
};

export const renderExplore = async (root) => {
  root.innerHTML = '<div class="view-grid"><article class="card">Cargando palabras…</article></div>';
  let entries = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    entries = await fetchDictionaryEntries({ excludeIds: [...reviewedIds()] });
    if (entries.length) break;
  }
  if (!entries.length) return void (root.innerHTML = '<div class="view-grid"><article class="card">Error al cargar palabras.</article></div>');

  const entry = pickEntry(entries);
  if (!entry) return void (root.innerHTML = '<div class="view-grid"><article class="card">No quedan palabras nuevas tras varios intentos.</article></div>');

  const translation = entry.translation || await translateText({ text: entry.text, from: 'de', to: 'es' });
  root.innerHTML = `<div class="view-grid"><article class="card"><div class="row row-compact"><h3>${entry.text}</h3><button id="play" class="btn-mini icon-plain">▶</button></div><p>${translation || 'No se pudo traducir'}</p><div class="row row-compact"><button id="save" class="btn btn-mini">Guardar</button><button id="skip" class="btn-ghost btn-mini">Pasar</button><button id="known" class="btn-ghost btn-mini">Ya me la sé</button></div></article></div>`;
  root.querySelector('#play').onclick = () => speakText(entry.text, 'de-DE');

  const mark = (status) => {
    const reviewedDeck = ensureReviewedDeck();
    const selectedDeckId = getSelectedDeckId();
    const saveDeckId = (status === 'saved' && getDecks().some((d) => d.id === selectedDeckId)) ? selectedDeckId : reviewedDeck.id;
    saveCards([...getCards(), { id: uid(), deckId: saveDeckId, text: entry.text, translation: translation || '', source: 'explore', sourceItemId: entry.id, exploreStatus: status, inputLang: 'de' }]);
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status } });
    localStorage.removeItem(CURRENT_KEY);
    renderExplore(root);
  };
  root.querySelector('#save').onclick = () => mark('saved');
  root.querySelector('#skip').onclick = () => mark('unknown');
  root.querySelector('#known').onclick = () => mark('known');
};
