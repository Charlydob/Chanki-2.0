import { fetchDictionaryEntries } from '../dictionary.service.js';
import { translateText } from '../translate.service.js';
import { getDecks, saveDecks, getCards, saveCards, getExploreState, saveExploreState, getSelectedDeckId } from '../storage.local.js';
import { speakText } from '../shared/speech.js';

const uid = () => crypto.randomUUID();
const reviewedDeckName = 'Explorar · revisadas';
const CURRENT_ITEM_ID_KEY = 'cardshell.explore.currentItemId';
const CURRENT_ITEM_KEY = 'cardshell.explore.currentItem';

const ensureReviewedDeck = () => {
  const decks = getDecks();
  let deck = decks.find((d) => d.name === reviewedDeckName);
  if (!deck) { deck = { id: uid(), name: reviewedDeckName }; saveDecks([...decks, deck]); }
  return deck;
};

const reviewedStatuses = ['known', 'unknown', 'saved', 'skipped'];
const isExcluded = (stateItem) => reviewedStatuses.includes(stateItem?.status);

const getReviewedIdsFromDeck = () => {
  const deck = getDecks().find((d) => d.name === reviewedDeckName);
  if (!deck) return new Set();
  return new Set(getCards().filter((c) => c.deckId === deck.id && c.source === 'explore' && c.sourceItemId).map((c) => c.sourceItemId));
};

const keepCurrent = (item) => {
  localStorage.setItem(CURRENT_ITEM_ID_KEY, item.id);
  localStorage.setItem(CURRENT_ITEM_KEY, JSON.stringify(item));
};

const clearCurrent = () => {
  localStorage.removeItem(CURRENT_ITEM_ID_KEY);
  localStorage.removeItem(CURRENT_ITEM_KEY);
};

const resolveTranslation = async (entry) => {
  if (entry.translation?.trim()) return entry.translation.trim();
  console.info('[explore:translation:start]', entry.id);
  const translated = await translateText({ text: entry.text, from: 'de', to: 'es' });
  if (translated?.trim()) {
    console.info('[explore:translation:ready]', entry.id);
    return translated.trim();
  }
  throw new Error('translation-failed');
};

export const renderExplore = async (root) => {
  root.innerHTML = '<div class="view-grid"><article class="card">Cargando palabras…</article></div>';
  const entries = await fetchDictionaryEntries();
  const state = getExploreState();
  const reviewedIds = getReviewedIdsFromDeck();
  const available = entries.filter((entry) => !isExcluded(state[entry.id]) && !reviewedIds.has(entry.id));

  if (!available.length) {
    clearCurrent();
    root.innerHTML = '<div class="view-grid"><article class="card">No quedan palabras nuevas en Explorar.</article></div>';
    return;
  }

  const currentId = localStorage.getItem(CURRENT_ITEM_ID_KEY);
  const rawCurrent = localStorage.getItem(CURRENT_ITEM_KEY);
  const parsedCurrent = rawCurrent ? JSON.parse(rawCurrent) : null;
  let entry = parsedCurrent && parsedCurrent.id === currentId ? parsedCurrent : null;

  if (entry && available.some((candidate) => candidate.id === entry.id)) {
    console.info('[explore:item:kept-current]', entry.id);
  } else {
    entry = available[Math.floor(Math.random() * available.length)];
    keepCurrent(entry);
    console.info('[explore:item:loaded]', entry.id);
  }

  state[entry.id] = { ...(state[entry.id] || {}), views: (state[entry.id]?.views || 0) + 1, status: 'seen' };
  saveExploreState(state);

  let translation = '';
  let translationError = false;
  try {
    translation = await resolveTranslation(entry);
    keepCurrent({ ...entry, translation });
  } catch {
    translationError = true;
  }

  const translationBlock = translationError
    ? '<p>No se pudo traducir</p><button id="retry-translation" class="btn-ghost">Reintentar</button>'
    : `<p>${translation}</p>`;

  root.innerHTML = `<div class="view-grid"><article class="card"><div class="row row-compact"><h3>${entry.text}</h3><button id="play" class="btn-icon" title="Audio">▶</button></div>${translationBlock}<div class="row row-compact"><button id="save" class="btn">Guardar</button><button id="skip" class="btn-ghost">Pasar</button><button id="known" class="btn-ghost">Ya me la sé</button></div></article></div>`;

  root.querySelector('#play').onclick = () => speakText(entry.text, 'de-DE');
  if (translationError) root.querySelector('#retry-translation').onclick = () => renderExplore(root);

  const markReviewed = (status, targetDeckId) => {
    const baseCard = {
      id: uid(),
      deckId: targetDeckId,
      text: entry.text,
      translation,
      article: entry.article || '',
      source: 'explore',
      sourceItemId: entry.id,
      exploreStatus: status,
      createdAt: Date.now(),
      inputLang: 'de'
    };
    saveCards([...getCards(), baseCard]);
    saveExploreState({ ...getExploreState(), [entry.id]: { ...(getExploreState()[entry.id] || {}), status, reviewedDeckId: targetDeckId } });
    console.info('[explore:reviewed:saved]', entry.id, status);
    clearCurrent();
    renderExplore(root);
  };

  root.querySelector('#save').onclick = () => {
    const decks = getDecks().filter((d) => d.name !== reviewedDeckName);
    if (!decks.length) return alert('Crea un mazo primero.');
    const selectedId = getSelectedDeckId();
    const defaultDeck = decks.find((d) => d.id === selectedId) || decks[0];
    const options = decks.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const idx = Number(prompt(`Elige mazo:\n${options}`, String(decks.indexOf(defaultDeck) + 1 || 1))) - 1;
    const deck = decks[idx] || defaultDeck;
    markReviewed('saved', deck.id);
  };
  root.querySelector('#skip').onclick = () => markReviewed('unknown', ensureReviewedDeck().id);
  root.querySelector('#known').onclick = () => markReviewed('known', ensureReviewedDeck().id);
};
