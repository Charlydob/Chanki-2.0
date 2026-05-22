const CACHE_KEY = 'cardshell.translate.cache.v1';

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
};

const writeCache = (cache) => localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

export const translateText = async ({ text, from, to }) => {
  const query = (text || '').trim();
  if (!query) return '';

  const key = `${from}|${to}|${query.toLowerCase()}`;
  const cache = readCache();
  if (cache[key]) return cache[key];

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${encodeURIComponent(`${from}|${to}`)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const translated = data?.responseData?.translatedText?.trim();
    if (!translated) throw new Error('empty translation');
    cache[key] = translated;
    writeCache(cache);
    return translated;
  } catch {
    return '';
  }
};
