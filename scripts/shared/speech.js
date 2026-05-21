export const speakText = (text, lang = 'de-DE') => {
  const value = (text || '').trim();
  if (!value) return { ok: false, reason: 'empty' };
  if (!('speechSynthesis' in window)) return { ok: false, reason: 'unsupported' };
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
  return { ok: true };
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export const getSpeechLangForCard = (card = {}) => {
  const lang = (card.inputLang || 'de').toLowerCase();
  return lang === 'es' ? 'es-ES' : 'de-DE';
};
