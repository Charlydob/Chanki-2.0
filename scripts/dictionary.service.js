const localFallback = [
  { id: 'local-w1', text: 'das Haus', translation: 'la casa', article: 'das', plural: 'die Häuser', example: 'Das Haus ist groß.' },
  { id: 'local-w2', text: 'lernen', translation: 'aprender', article: '', plural: '', example: 'Ich lerne Deutsch.' },
  { id: 'local-w3', text: 'Guten Morgen', translation: 'buenos días', article: '', plural: '', example: 'Guten Morgen, Anna.' },
  { id: 'local-w4', text: 'der Tisch', translation: 'la mesa', article: 'der', plural: 'die Tische', example: 'Der Tisch ist neu.' }
];

const API_URL = 'https://random-word-api.herokuapp.com/word?lang=de&number=20';

const mapWord = (word, index) => ({
  id: `api-${word}-${index}`,
  text: String(word || '').trim(),
  translation: '',
  article: '',
  plural: '',
  example: ''
});

export const fetchDictionaryEntries = async () => {
  try {
    const response = await fetch(API_URL, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const words = await response.json();
    const entries = Array.isArray(words) ? words.map(mapWord).filter((entry) => entry.text) : [];
    if (!entries.length) throw new Error('empty-api-result');
    return entries;
  } catch (error) {
    console.warn('[dictionary:fallback-local]', error?.message || error);
    return [...localFallback];
  }
};
