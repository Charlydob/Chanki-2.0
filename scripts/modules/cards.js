import { getCards, saveCards, getDecks } from '../storage.local.js';

const uid = () => crypto.randomUUID();
const emptyCard = { sourceLang: 'es', targetLang: 'de', inputLang: 'es', text: '', translation: '', type: 'palabra', article: '', plural: '', example: '', notes: '', requiresArticle: false };

export const renderCards = (root) => {
  const decks = getDecks();
  root.innerHTML = `<div class="view-grid"><div id="cards-empty"></div><div class="card view-grid"><select id="deckId" class="input">${decks.map((d)=>`<option value="${d.id}">${d.name}</option>`).join('')}</select>
  <input id="text" class="input" placeholder="Texto principal"><input id="translation" class="input" placeholder="Traducción"><input id="article" class="input" placeholder="Artículo (opcional)"><input id="plural" class="input" placeholder="Plural"><input id="example" class="input" placeholder="Ejemplo"><textarea id="notes" class="input" placeholder="Notas"></textarea>
  <select id="type" class="input"><option>palabra</option><option>frase</option><option>sustantivo</option><option>verbo</option><option>expresión</option></select><label><input type="checkbox" id="requiresArticle"> Requiere artículo</label>
  <button id="save-card" class="btn">Guardar tarjeta</button></div><div id="card-list"></div></div>`;
  const list = root.querySelector('#card-list');
  const empty = root.querySelector('#cards-empty');

  const paint = () => {
    const cards = getCards();
    empty.innerHTML = cards.length ? '' : '<article class="card">Crea tu primera tarjeta</article>';
    list.innerHTML = cards.map((c)=>`<article class="card"><strong>${c.text}</strong><p>${c.translation}</p><div class="row"><button class="btn-ghost" data-edit="${c.id}">Editar</button><button class="btn-ghost" data-delete="${c.id}">Borrar</button></div></article>`).join('');
  };
  paint();

  root.querySelector('#save-card').onclick = () => {
    const deckId = root.querySelector('#deckId')?.value;
    if (!deckId) return alert('Primero crea un mazo');
    const card = {
      ...emptyCard,
      id: uid(), deckId,
      text: root.querySelector('#text').value.trim(),
      translation: root.querySelector('#translation').value.trim(),
      article: root.querySelector('#article').value.trim(),
      plural: root.querySelector('#plural').value.trim(),
      example: root.querySelector('#example').value.trim(),
      notes: root.querySelector('#notes').value.trim(),
      type: root.querySelector('#type').value,
      requiresArticle: root.querySelector('#requiresArticle').checked
    };
    if (!card.text || !card.translation) return;
    saveCards([...getCards(), card]);
    paint();
  };

  list.onclick = (e) => {
    const id = e.target.dataset.delete || e.target.dataset.edit;
    if (!id) return;
    const cards = getCards();
    const card = cards.find((c) => c.id === id);
    if (e.target.dataset.delete) {
      saveCards(cards.filter((c) => c.id !== id));
      paint();
    } else if (card) {
      const text = prompt('Texto', card.text) ?? card.text;
      const translation = prompt('Traducción', card.translation) ?? card.translation;
      saveCards(cards.map((c) => (c.id === id ? { ...c, text: text.trim(), translation: translation.trim() } : c)));
      paint();
    }
  };
};
