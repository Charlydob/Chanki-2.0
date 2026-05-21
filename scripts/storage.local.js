const safeParse = (raw, fallback) => {
  try { return JSON.parse(raw) ?? fallback; } catch { return fallback; }
};
const read = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getDecks = () => read('cardshell.decks', []);
export const saveDecks = (decks) => write('cardshell.decks', decks);
export const getCards = () => read('cardshell.cards', []);
export const saveCards = (cards) => write('cardshell.cards', cards);
export const getProgress = () => read('cardshell.progress', []);
export const saveProgress = (progress) => write('cardshell.progress', progress);
export const getExploreState = () => read('cardshell.exploreState', {});
export const saveExploreState = (state) => write('cardshell.exploreState', state);
export const getSelectedDeckId = () => read('cardshell.selectedDeckId', '');
export const saveSelectedDeckId = (deckId) => write('cardshell.selectedDeckId', deckId);
