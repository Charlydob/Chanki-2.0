const localFallback = [
  { id: 'local-w1', text: 'das Haus', translation: 'la casa', article: 'das', plural: 'die Häuser', example: 'Das Haus ist groß.' },
  { id: 'local-w2', text: 'lernen', translation: 'aprender', article: '', plural: '', example: 'Ich lerne Deutsch.' },
  { id: 'local-w3', text: 'Guten Morgen', translation: 'buenos días', article: '', plural: '', example: 'Guten Morgen, Anna.' },
  { id: 'local-w4', text: 'der Tisch', translation: 'la mesa', article: 'der', plural: 'die Tische', example: 'Der Tisch ist neu.' }
];

const API_URL = 'https://de.wiktionary.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=30&format=json&origin=*';

const normalize = (entry) => ({
  id: `wiktionary-${entry.id}`,
  text: String(entry.title || '').trim(),
  translation: '', article: '', plural: '', example: ''
});

export const fetchDictionaryEntries = async ({ excludeIds = [] } = {}) => {
  const excluded = new Set(excludeIds);
  try {
    const response = await fetch(API_URL, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const randomItems = data?.query?.random || [];
    const entries = randomItems
      .map(normalize)
      .filter((item) => item.text && !excluded.has(item.id));
    if (!entries.length) throw new Error('empty-api-result');
    return entries;
  } catch (error) {
    console.warn('[dictionary:fallback-local]', error?.message || error);
    return localFallback.filter((item) => !excluded.has(item.id));
  }
};
