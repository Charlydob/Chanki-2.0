import { getCards, getProgress, saveProgress } from '../storage.local.js';
import { validateGermanAnswer } from '../shared/validator.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const renderStudy = (root) => {
  const cards = getCards();
  if (!cards.length) {
    root.innerHTML = '<div class="view-grid"><article class="card">No hay tarjetas para estudiar</article></div>';
    return;
  }
  let current = pick(cards);
  let showingBack = false;
  let direction = Math.random() > 0.5 ? 'ES→DE' : 'DE→ES';
  root.innerHTML = `<div class="view-grid"><select id="study-mode" class="input"><option>Cabeza</option><option>Escritura</option></select><article class="card"><p id="dir"></p><h3 id="study-face"></h3><div class="row"><button id="flip" class="btn-ghost">Girar</button><button data-grade="known" class="btn-ghost">La sabía</button><button data-grade="doubt" class="btn-ghost">Dudosa</button><button data-grade="fail" class="btn-ghost">No la sabía</button></div><div id="write" class="view-grid is-hidden"><input id="ans" class="input" placeholder="Tu respuesta"><button id="check" class="btn">Validar</button><p id="result"></p></div></article></div>`;

  const paint = () => {
    root.querySelector('#dir').textContent = direction;
    root.querySelector('#study-face').textContent = showingBack ? (direction === 'ES→DE' ? current.translation : current.text) : (direction === 'ES→DE' ? current.text : current.translation);
  };
  const next = () => { current = pick(cards); showingBack = false; direction = Math.random() > 0.5 ? 'ES→DE' : 'DE→ES'; paint(); };
  paint();

  root.querySelector('#study-mode').onchange = (e) => root.querySelector('#write').classList.toggle('is-hidden', e.target.value !== 'Escritura');
  root.querySelector('#flip').onclick = () => { showingBack = !showingBack; paint(); };

  root.querySelectorAll('[data-grade]').forEach((btn) => btn.onclick = () => {
    const progress = getProgress();
    progress.push({ cardId: current.id, grade: btn.dataset.grade, at: Date.now() });
    saveProgress(progress);
    next();
  });

  root.querySelector('#check').onclick = () => {
    const answer = root.querySelector('#ans').value;
    const expected = direction === 'ES→DE' ? `${current.article ? `${current.article} ` : ''}${current.translation}`.trim() : current.text;
    const output = validateGermanAnswer({ answer, expected, requiresArticle: !!current.requiresArticle && direction === 'ES→DE' });
    const node = root.querySelector('#result');
    node.textContent = output.message;
    node.className = output.result === 'correct' ? 'status-ok' : output.result === 'warning' ? 'status-warn' : 'status-bad';
  };
};
