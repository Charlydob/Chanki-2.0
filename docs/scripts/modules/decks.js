import { getDecks, saveDecks, getCards, saveCards, saveSelectedDeckId } from '../storage.local.js';
import { translateText } from '../translate.service.js';

const uid = () => crypto.randomUUID();
const emptyDraft = (deckId) => ({ id: '', deckId, inputLang: 'de', text: '', translation: '', article: '', plural: '', conjugation: '', example: '', notes: '', tags: [] });

export const renderDecks = (root) => {
  let debounceTimer = null;
  let draft = emptyDraft('');
  let editId = null;

  const renderList = () => {
    root.innerHTML = `<div class="view-grid"><div class="row"><input id="new-deck" class="input" placeholder="Nombre del mazo"><button id="create-deck" class="btn btn-mini">Crear</button></div><div id="deck-list" class="deck-list"></div></div>`;
    const list = root.querySelector('#deck-list');
    const decks = getDecks();
    const cards = getCards();
    list.innerHTML = decks.length
      ? decks.map((d) => `<article class="card deck-item"><div class="row"><strong>${d.name}</strong><span>${cards.filter((c) => c.deckId === d.id).length} tarjetas</span></div><div class="row row-compact"><button class="btn btn-mini" data-enter="${d.id}">Abrir</button><button class="btn-icon btn-mini" data-edit="${d.id}">✏</button><button class="btn-icon btn-mini" data-delete="${d.id}">🗑</button></div></article>`).join('')
      : '<article class="card">Aún no tienes mazos</article>';

    root.querySelector('#create-deck').onclick = () => {
      const input = root.querySelector('#new-deck');
      const name = input.value.trim();
      if (!name) return;
      const deck = { id: uid(), name };
      saveDecks([...getDecks(), deck]);
      saveSelectedDeckId(deck.id);
      renderList();
    };

    list.onclick = (e) => {
      const id = e.target.dataset.enter || e.target.dataset.edit || e.target.dataset.delete;
      if (!id) return;
      if (e.target.dataset.enter) return renderDetail(id);
      if (e.target.dataset.edit) {
        const next = prompt('Nuevo nombre del mazo');
        if (next?.trim()) saveDecks(getDecks().map((d) => d.id === id ? { ...d, name: next.trim() } : d));
      }
      if (e.target.dataset.delete) {
        saveDecks(getDecks().filter((d) => d.id !== id));
        saveCards(getCards().filter((c) => c.deckId !== id));
      }
      renderList();
    };
  };

  const renderDetail = (id) => {
    const deck = getDecks().find((d) => d.id === id);
    if (!deck) return renderList();
    saveSelectedDeckId(id);
    const cards = getCards().filter((c) => c.deckId === id);
    root.innerHTML = `<div class="view-grid"><button id="back" class="btn-chip btn-mini back-tiny">← Volver</button><div><h2>${deck.name}</h2><p class="small">${cards.length} tarjetas</p></div><button id="open-cards" class="btn">+ Tarjeta</button><div id="deck-cards" class="deck-cards-list">${cards.length ? cards.map((c) => `<article class="card card-row"><span>${c.text} · ${c.translation || '—'}</span><div class="row row-compact"><button class="btn-mini icon-plain edit" data-id="${c.id}">✏</button><button class="btn-mini icon-plain del" data-id="${c.id}">🗑</button></div></article>`).join('') : '<article class="card"><p class="small">Sin tarjetas.</p></article>'}</div></div><div id="card-modal" class="modal is-hidden"></div>`;

    const modal = root.querySelector('#card-modal');
    const sync = () => {
      draft.text = modal.querySelector('#text').value.trim();
      draft.translation = modal.querySelector('#translation').value.trim();
      draft.inputLang = modal.querySelector('button.lang.active')?.dataset.lang || draft.inputLang;
      draft.article = modal.querySelector('#article').value;
      draft.plural = modal.querySelector('#plural').value.trim();
      draft.conjugation = modal.querySelector('#conjugation').value.trim();
      draft.example = modal.querySelector('#example').value.trim();
      draft.notes = modal.querySelector('#notes').value.trim();
      draft.tags = modal.querySelector('#tags').value.split(',').map((t) => t.trim()).filter(Boolean);
    };

    const renderModal = (error = '') => {
      modal.innerHTML = `<div class="modal-card card view-grid"><div class="row row-compact"><button class="btn-ghost lang ${draft.inputLang === 'es' ? 'active' : ''}" data-lang="es">Español</button><button class="btn-ghost lang ${draft.inputLang === 'de' ? 'active' : ''}" data-lang="de">Alemán</button></div><input id="text" class="input compact" placeholder="Texto inicial" value="${draft.text}"><input id="translation" class="input compact" placeholder="Traducción automática editable" value="${draft.translation}"><div class="row"><select id="article" class="input compact"><option value="">—</option><option value="der" ${draft.article === 'der' ? 'selected' : ''}>der</option><option value="die" ${draft.article === 'die' ? 'selected' : ''}>die</option><option value="das" ${draft.article === 'das' ? 'selected' : ''}>das</option></select><input id="plural" class="input compact" placeholder="Plural" value="${draft.plural}"></div><input id="conjugation" class="input compact" placeholder="Conjugación" value="${draft.conjugation}"><input id="example" class="input compact" placeholder="Ejemplo" value="${draft.example}"><textarea id="notes" class="input compact" placeholder="Notas">${draft.notes}</textarea><input id="tags" class="input compact" placeholder="Tags" value="${draft.tags.join(', ')}">${error ? `<p class="status-bad">${error}</p>` : ''}<div class="row row-compact"><button id="translate-btn" class="btn-ghost btn-mini">Traducir</button><button id="save-card" class="btn btn-mini">Guardar</button><button id="cancel-modal" class="btn-ghost btn-mini">Cancelar</button></div></div>`;
      modal.classList.remove('is-hidden');
      modal.querySelectorAll('.lang').forEach((btn) => btn.onclick = () => { draft.inputLang = btn.dataset.lang; renderModal(); });
      modal.querySelector('#text').oninput = () => {
        sync();
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          if (!draft.text || draft.translation) return;
          const translated = await translateText({ text: draft.text, from: draft.inputLang, to: draft.inputLang === 'de' ? 'es' : 'de' });
          if (!translated) return renderModal('No se pudo traducir');
          draft.translation = translated; renderModal();
        }, 700);
      };
      modal.querySelector('#translate-btn').onclick = async () => { sync(); const translated = await translateText({ text: draft.text, from: draft.inputLang, to: draft.inputLang === 'de' ? 'es' : 'de' }); if (!translated) return renderModal('No se pudo traducir'); draft.translation = translated; renderModal(); };
      modal.querySelector('#save-card').onclick = () => { sync(); if (!draft.text || !draft.translation) return; const payload = { ...draft, id: editId || uid(), deckId: id }; const all = getCards(); saveCards(editId ? all.map((c) => c.id === editId ? payload : c) : [...all, payload]); modal.classList.add('is-hidden'); draft = emptyDraft(id); editId = null; renderDetail(id); };
      modal.querySelector('#cancel-modal').onclick = () => { modal.classList.add('is-hidden'); draft = emptyDraft(id); editId = null; };
    };

    root.querySelector('#back').onclick = renderList;
    root.querySelector('#open-cards').onclick = () => { draft = emptyDraft(id); editId = null; renderModal(); };
    root.querySelector('#deck-cards').onclick = (e) => {
      const cardId = e.target.dataset.id;
      if (!cardId) return;
      if (e.target.classList.contains('del')) { saveCards(getCards().filter((c) => c.id !== cardId)); return renderDetail(id); }
      if (e.target.classList.contains('edit')) { const found = getCards().find((c) => c.id === cardId); if (!found) return; draft = { ...emptyDraft(id), ...found, tags: found.tags || [] }; editId = cardId; renderModal(); }
    };
  };

  renderList();
};
