const FALLBACK = [
  { id: 'p1', es: 'Hoy hace buen tiempo.', de: 'Heute ist gutes Wetter.' },
  { id: 'p2', es: 'Quiero practicar alemán.', de: 'Ich möchte Deutsch üben.' },
  { id: 'p3', es: 'Mañana estudio una hora.', de: 'Morgen lerne ich eine Stunde.' },
  { id: 'p4', es: 'Necesito más vocabulario.', de: 'Ich brauche mehr Wortschatz.' }
];
const KEY = 'cardshell.phrases.reviewed';

const getReviewed = () => JSON.parse(localStorage.getItem(KEY) || '{}');
const saveReviewed = (payload) => localStorage.setItem(KEY, JSON.stringify(payload));

export const getNextPhrase = () => {
  const reviewed = getReviewed();
  const pending = FALLBACK.filter((p) => !reviewed[p.id]);
  return pending.length ? pending[Math.floor(Math.random() * pending.length)] : FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
};

export const markPhraseReviewed = (id, status) => {
  const reviewed = getReviewed();
  reviewed[id] = status;
  saveReviewed(reviewed);
};
