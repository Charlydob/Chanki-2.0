const DEBOUNCE_LOG_PREFIX = '[translate]';

export const translateText = async ({ text, from, to }) => {
  const query = (text || '').trim();
  if (!query) return '';

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${encodeURIComponent(`${from}|${to}`)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const translated = data?.responseData?.translatedText?.trim();
    if (translated) return translated;
    throw new Error('empty translation');
  } catch (error) {
    console.warn(`${DEBOUNCE_LOG_PREFIX} fallback local activo`, error);
    return '';
  }
};
