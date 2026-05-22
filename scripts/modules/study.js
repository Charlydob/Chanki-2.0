import { getCards, getProgress, saveProgress } from '../storage.local.js';
import { validateGermanAnswer } from '../shared/validator.js';
import { speakText } from '../shared/speech.js';

const phraseFallback = [
  { id: 'p1', es: 'Hoy hace buen tiempo.', de: 'Heute ist gutes Wetter.' },
  { id: 'p2', es: 'Quiero practicar alemán.', de: 'Ich möchte Deutsch üben.' },
  { id: 'p3', es: 'Mañana estudio una hora.', de: 'Morgen lerne ich eine Stunde.' }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const reviewedPhrasesKey = 'cardshell.phrases.reviewed';
const getReviewedPhrases = () => JSON.parse(localStorage.getItem(reviewedPhrasesKey) || '{}');
const saveReviewedPhrases = (v) => localStorage.setItem(reviewedPhrasesKey, JSON.stringify(v));

const buildStudyPool = () => getCards().map((card) => ({ ...card, source: card.source || 'card' }));

export const renderStudy = async (root) => {
  const cards = buildStudyPool();
  if (!cards.length) return void (root.innerHTML = '<div class="view-grid"><article class="card">No hay contenido pendiente para estudiar.</article></div>');

  let current = pick(cards); let showingBack = false; let direction = Math.random() > 0.5 ? 'ES→DE' : 'DE→ES';
  let phrase = phraseFallback.find((p) => !getReviewedPhrases()[p.id]) || pick(phraseFallback);

  root.innerHTML = `<div class="view-grid"><select id="study-mode" class="input compact"><option>Cabeza</option><option>Escritura</option><option>Frase aleatoria</option></select><article class="card flip-card" id="flash"><div class="row row-compact"><p id="dir"></p><button id="play" class="btn-icon">▶︎</button></div><h3 id="study-face"></h3><div class="row row-compact grade-row"><button data-grade="known" class="btn grade-known">La sabía</button><button data-grade="doubt" class="btn grade-doubt">Dudosa</button><button data-grade="fail" class="btn grade-fail">No la sabía</button></div><div id="write" class="view-grid is-hidden"><input id="ans" class="input compact" placeholder="Tu respuesta"><button id="check" class="btn">Validar</button><p id="result"></p></div></article><article id="phrase" class="card is-hidden"><h3>Frase aleatoria</h3><p>${phrase.es}</p><button id="show-de" class="btn-ghost">Mostrar traducción</button><p id="phrase-de" class="is-hidden">${phrase.de}</p><div class="row row-compact"><button data-phrase="known" class="btn-ghost">La sabía</button><button data-phrase="doubt" class="btn-ghost">Dudosa</button><button data-phrase="fail" class="btn-ghost">No la sabía</button><button id="speak-de" class="btn-icon">▶︎</button></div></article></div>`;

  const paint = () => { root.querySelector('#dir').textContent = `${direction} · ${current.source || 'card'}`; root.querySelector('#study-face').textContent = showingBack ? (direction === 'ES→DE' ? current.translation : current.text) : (direction === 'ES→DE' ? current.text : current.translation); };
  const next = () => { current = pick(cards); showingBack = false; direction = Math.random() > 0.5 ? 'ES→DE' : 'DE→ES'; paint(); };
  paint();
  root.querySelector('#flash').onclick = (e) => { if (e.target.closest('button') || e.target.closest('input')) return; showingBack = !showingBack; root.querySelector('#flash').classList.toggle('is-flipped', showingBack); paint(); };

  root.querySelector('#play').onclick = () => speakText(direction === 'ES→DE' ? current.translation : current.text, direction === 'ES→DE' ? 'de-DE' : 'es-ES');
  root.querySelector('#study-mode').onchange = (e) => { const isPhrase = e.target.value === 'Frase aleatoria'; root.querySelector('#flash').classList.toggle('is-hidden', isPhrase); root.querySelector('#phrase').classList.toggle('is-hidden', !isPhrase); root.querySelector('#write').classList.toggle('is-hidden', e.target.value !== 'Escritura'); };
  
  root.querySelectorAll('[data-grade]').forEach((btn) => btn.onclick = () => { saveProgress([...getProgress(), { cardId: current.id, grade: btn.dataset.grade, at: Date.now(), source: current.source }]); next(); });
  root.querySelector('#check').onclick = () => { const output = validateGermanAnswer({ answer: root.querySelector('#ans').value, expected: direction === 'ES→DE' ? `${current.article ? `${current.article} ` : ''}${current.translation}`.trim() : current.text, requiresArticle: !!current.requiresArticle && direction === 'ES→DE' }); const node = root.querySelector('#result'); node.textContent = output.message; node.className = output.result === 'correct' ? 'status-ok' : output.result === 'warning' ? 'status-warn' : 'status-bad'; };
  root.querySelector('#show-de').onclick = () => root.querySelector('#phrase-de').classList.remove('is-hidden');
  root.querySelector('#speak-de').onclick = () => speakText(phrase.de, 'de-DE');
  root.querySelectorAll('[data-phrase]').forEach((btn) => btn.onclick = () => {
    const reviewed = getReviewedPhrases();
    reviewed[phrase.id] = btn.dataset.phrase;
    saveReviewedPhrases(reviewed);
    saveProgress([...getProgress(), { cardId: `phrase-${phrase.id}`, grade: btn.dataset.phrase === 'fail' ? 'fail' : btn.dataset.phrase === 'known' ? 'known' : 'doubt', at: Date.now(), source: 'phrase' }]);
  });
};
