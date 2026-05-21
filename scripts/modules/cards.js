import { getCards, saveCards, getDecks, getSelectedDeckId, saveSelectedDeckId } from '../storage.local.js';
import { translateText } from '../translate.service.js';
import { lookupGermanNoun, articleColorClass } from '../german-lookup.service.js';

const uid = () => crypto.randomUUID();
let timer;

export const renderCards = (root, go) => {
  const decks = getDecks();
  const selectedId = getSelectedDeckId() || decks[0]?.id;
  const deck = decks.find((d) => d.id === selectedId);
  if (!deck) {
    go('decks');
    return;
  }
  saveSelectedDeckId(deck.id);

  root.innerHTML = `<div class="view-grid"><div class="row"><button id="back" class="btn-ghost">Volver</button><h2>${deck.name}</h2></div><button id="toggle-form" class="btn">Crear tarjeta</button><article id="card-form" class="card view-grid is-hidden"><div class="row"><button class="btn-ghost lang active" data-lang="de">Alemán</button><button class="btn-ghost lang" data-lang="es">Español</button></div><input id="text" class="input" placeholder="Texto principal"><input id="translation" class="input" placeholder="Traducción autocompletada"><input id="article" class="input" placeholder="Artículo"><div id="article-pill" class="small"></div><input id="plural" class="input" placeholder="Plural"><input id="example" class="input" placeholder="Ejemplos"><textarea id="notes" class="input" placeholder="Notas"></textarea><input id="tags" class="input" placeholder="Tags libres (coma separada)"><button id="enrich" class="btn-ghost">Autocompletar</button><button id="save-card" class="btn">Guardar tarjeta</button></article><div id="card-list"></div></div>`;

  let inputLang = 'de';
  const list = root.querySelector('#card-list');
  const paint = () => {
    const cards = getCards().filter((c) => c.deckId === deck.id);
    list.innerHTML = cards.length ? cards.map((c) => `<article class="card"><strong>${c.article ? `${c.article} ` : ''}${c.text}</strong><p>${c.translation}</p></article>`).join('') : '<article class="card">No hay tarjetas en este mazo.</article>';
  };
  paint();

  root.querySelector('#back').onclick = () => go('decks');
  root.querySelector('#toggle-form').onclick = () => root.querySelector('#card-form').classList.toggle('is-hidden');
  root.querySelectorAll('.lang').forEach((b) => b.onclick = () => { inputLang = b.dataset.lang; root.querySelectorAll('.lang').forEach((x) => x.classList.toggle('active', x === b)); });

  root.querySelector('#text').oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const text = root.querySelector('#text').value.trim();
      const translated = await translateText({ text, from: inputLang, to: inputLang === 'de' ? 'es' : 'de' });
      root.querySelector('#translation').value = translated;
    }, 600);
  };

  root.querySelector('#enrich').onclick = async () => {
    if (inputLang !== 'de') return;
    const text = root.querySelector('#text').value.trim();
    const data = await lookupGermanNoun(text);
    root.querySelector('#article').value = data.article;
    if (!root.querySelector('#plural').value.trim()) root.querySelector('#plural').value = data.plural || '';
    const pill = root.querySelector('#article-pill');
    pill.className = `small ${articleColorClass(data.article)}`;
    pill.textContent = data.article ? `Artículo detectado: ${data.article}` : 'Sin artículo detectado (editable manualmente).';
  };

  root.querySelector('#save-card').onclick = () => {
    const text = root.querySelector('#text').value.trim();
    const translation = root.querySelector('#translation').value.trim();
    if (!text || !translation) return;
    const article = root.querySelector('#article').value.trim().toLowerCase();
    const payload = {
      id: uid(),
      deckId: deck.id,
      inputLang,
      text,
      translation,
      article,
      plural: root.querySelector('#plural').value.trim(),
      example: root.querySelector('#example').value.trim(),
      notes: root.querySelector('#notes').value.trim(),
      tags: root.querySelector('#tags').value.split(',').map((t) => t.trim()).filter(Boolean)
    };
    saveCards([...getCards(), payload]);
    paint();
  };
};
