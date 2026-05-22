import { getCards, saveCards, getDecks, getSelectedDeckId, saveSelectedDeckId } from '../storage.local.js';
import { translateText } from '../translate.service.js';
import { speakText, getSpeechLangForCard } from '../shared/speech.js';

const uid = () => crypto.randomUUID();
const VERB_PATTERN = /en$/i;

const emptyDraft = (deckId, inputLang = 'de') => ({ id: '', deckId, inputLang, text: '', translation: '', article: '', plural: '', conjugation: '', example: '', notes: '', tags: [] });

export const renderCards = (root, go) => {
  const deck = getDecks().find((d) => d.id === (getSelectedDeckId() || getDecks()[0]?.id));
  if (!deck) return void go('decks');
  saveSelectedDeckId(deck.id);

  let draft = emptyDraft(deck.id);
  let editId = null;
  let debounceTimer = null;

  root.innerHTML = `<div class="view-grid cards-view"><div class="row row-compact cards-header"><button id="back" class="btn-chip btn-mini">←</button><h2>${deck.name}</h2><span class="small" id="counter"></span><button id="open-modal" class="btn btn-mini">+ Tarjeta</button></div><div id="card-list"></div></div><div id="card-modal" class="modal is-hidden"></div>`;

  const list = root.querySelector('#card-list');
  const modal = root.querySelector('#card-modal');

  const paint = () => {
    const cards = getCards().filter((c) => c.deckId === deck.id);
    root.querySelector('#counter').textContent = `${cards.length} tarjetas`;
    list.innerHTML = cards.length
      ? cards.map((c) => `<article class="card card-row"><div><strong>${c.text}</strong><p>${c.translation || '<span class="small">Sin traducción</span>'}</p></div><div class="row row-compact"><button class="btn-icon btn-mini play" data-text="${c.text}" title="Audio">▶</button><button class="btn-icon btn-mini edit" data-id="${c.id}" title="Editar">✏</button><button class="btn-icon btn-mini del" data-id="${c.id}" title="Eliminar">🗑</button></div></article>`).join('')
      : '<article class="card">No hay tarjetas.</article>';
  };

  const isGermanVerb = (text) => draft.inputLang === 'de' && VERB_PATTERN.test((text || '').trim());
  const conjugationLink = (text) => `https://konjugator.reverso.net/konjugation-deutsch-verb-${encodeURIComponent((text || '').trim())}.html`;

  const renderModal = (error = '') => {
    modal.innerHTML = `<div class="modal-card card view-grid"><div class="row row-compact"><button class="btn-ghost lang ${draft.inputLang === 'de' ? 'active' : ''}" data-lang="de">Alemán</button><button class="btn-ghost lang ${draft.inputLang === 'es' ? 'active' : ''}" data-lang="es">Español</button></div><input id="text" class="input compact" placeholder="Texto principal" value="${draft.text}"><input id="translation" class="input compact" placeholder="Traducción" value="${draft.translation}"><div class="row"><select id="article" class="input compact"><option value="">—</option><option value="der" ${draft.article === 'der' ? 'selected' : ''}>der</option><option value="die" ${draft.article === 'die' ? 'selected' : ''}>die</option><option value="das" ${draft.article === 'das' ? 'selected' : ''}>das</option></select><input id="plural" class="input compact" placeholder="Plural" value="${draft.plural}"></div><input id="conjugation" class="input compact" placeholder="Conjugación (si aplica)" value="${draft.conjugation}">${isGermanVerb(draft.text) ? `<a class="small" target="_blank" rel="noopener" href="${conjugationLink(draft.text)}">Conjugar verbo</a>` : ''}<input id="example" class="input compact" placeholder="Ejemplo" value="${draft.example}"><textarea id="notes" class="input compact" placeholder="Notas">${draft.notes}</textarea><input id="tags" class="input compact" placeholder="Tags libres" value="${draft.tags.join(', ')}">${error ? `<p class="status-bad">${error}</p>` : ''}<div class="row"><button id="translate-btn" class="btn-ghost btn-mini">Traducir</button><button id="save-card" class="btn btn-mini">Guardar</button><button id="cancel-modal" class="btn-ghost btn-mini">Cancelar</button></div></div>`;
    modal.classList.remove('is-hidden');

    modal.querySelectorAll('.lang').forEach((btn) => btn.onclick = () => { draft.inputLang = btn.dataset.lang; renderModal(); });

    const syncDraft = () => {
      draft.text = modal.querySelector('#text').value.trim();
      draft.translation = modal.querySelector('#translation').value.trim();
      draft.article = modal.querySelector('#article').value;
      draft.plural = modal.querySelector('#plural').value.trim();
      draft.conjugation = modal.querySelector('#conjugation').value.trim();
      draft.example = modal.querySelector('#example').value.trim();
      draft.notes = modal.querySelector('#notes').value.trim();
      draft.tags = modal.querySelector('#tags').value.split(',').map((t) => t.trim()).filter(Boolean);
    };

    const textInput = modal.querySelector('#text');
    textInput.oninput = () => {
      syncDraft();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (!draft.text || draft.translation) return;
        const translated = await translateText({ text: draft.text, from: draft.inputLang, to: draft.inputLang === 'de' ? 'es' : 'de' });
        if (!translated) return renderModal('No se pudo traducir');
        draft.translation = translated;
        renderModal();
      }, 700);
    };

    modal.querySelector('#translate-btn').onclick = async () => {
      syncDraft();
      const translated = await translateText({ text: draft.text, from: draft.inputLang, to: draft.inputLang === 'de' ? 'es' : 'de' });
      if (!translated) return renderModal('No se pudo traducir');
      draft.translation = translated;
      renderModal();
    };

    modal.querySelector('#save-card').onclick = () => {
      syncDraft();
      if (!draft.text || !draft.translation) return;
      const payload = { ...draft, id: editId || uid(), deckId: deck.id };
      const cards = getCards();
      saveCards(editId ? cards.map((c) => c.id === editId ? payload : c) : [...cards, payload]);
      modal.classList.add('is-hidden');
      draft = emptyDraft(deck.id);
      editId = null;
      paint();
    };
    modal.querySelector('#cancel-modal').onclick = () => { modal.classList.add('is-hidden'); draft = emptyDraft(deck.id); editId = null; };
  };

  paint();
  root.querySelector('#back').onclick = () => go('decks');
  root.querySelector('#open-modal').onclick = () => { editId = null; draft = emptyDraft(deck.id); renderModal(); };

  list.onclick = (e) => {
    const play = e.target.closest('.play');
    if (play) return void speakText(play.dataset.text, getSpeechLangForCard({ inputLang: 'de' }));
    const edit = e.target.closest('.edit');
    if (edit) {
      const found = getCards().find((c) => c.id === edit.dataset.id);
      if (!found) return;
      editId = found.id;
      draft = { ...emptyDraft(deck.id), ...found, tags: found.tags || [] };
      return renderModal();
    }
    const del = e.target.closest('.del');
    if (del) saveCards(getCards().filter((c) => c.id !== del.dataset.id)), paint();
  };
};
