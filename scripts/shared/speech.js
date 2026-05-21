export const speak = (text, lang = 'de-DE') => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text); u.lang = lang; window.speechSynthesis.speak(u);
};
