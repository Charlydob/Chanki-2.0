import { getCards, saveCards, getDecks, getSelectedDeckId, saveSelectedDeckId } from '../storage.local.js';
import { translateText } from '../translate.service.js';
import { lookupGermanNoun, articleColorClass } from '../german-lookup.service.js';
import { speakText, getSpeechLangForCard } from '../shared/speech.js';

const uid = () => crypto.randomUUID();

export const renderCards = (root, go) => {
  const deck = getDecks().find((d) => d.id === (getSelectedDeckId() || getDecks()[0]?.id));
  if (!deck) return void go('decks');
  saveSelectedDeckId(deck.id);

  root.innerHTML = `<div class="view-grid"><div class="row"><button id="back" class="btn-chip">←</button><h2>${deck.name}</h2><span class="small" id="counter"></span><button id="toggle-form" class="btn-chip">+ Tarjeta</button></div><article id="card-form" class="card view-grid is-hidden"><div class="row"><button class="btn-ghost lang active" data-lang="de">Alemán</button><button class="btn-ghost lang" data-lang="es">Español</button></div><input id="text" class="input compact" placeholder="Texto principal"><div class="row"><input id="translation" class="input compact" placeholder="Traducción editable"><button id="translate-btn" class="btn-ghost">Traducir</button></div><div class="row"><select id="article" class="input compact"><option value="">manual</option><option value="der">der</option><option value="die">die</option><option value="das">das</option></select><div id="article-pill" class="small"></div></div><input id="plural" class="input compact" placeholder="Plural"><input id="example" class="input compact" placeholder="Ejemplo"><textarea id="notes" class="input compact" placeholder="Notas"></textarea><input id="tags" class="input compact" placeholder="Tags libres (coma separada)"><button id="lookup" class="btn-ghost">Lookup artículo/plural</button><button id="save-card" class="btn">Guardar</button></article><div id="card-list"></div></div>`;
  let inputLang='de'; const list=root.querySelector('#card-list');
  const paint=()=>{const cards=getCards().filter((c)=>c.deckId===deck.id);root.querySelector('#counter').textContent=`${cards.length} tarjetas`; list.innerHTML=cards.length?cards.map((c)=>`<article class="card"><div class="row"><strong>${c.article?`${c.article} `:''}${c.text}</strong><button class="btn-ghost play" data-text="${c.text}">🔊</button></div><p>${c.translation}</p></article>`).join(''):'<article class="card">No hay tarjetas.</article>';};
  paint();
  root.querySelector('#back').onclick=()=>go('decks'); root.querySelector('#toggle-form').onclick=()=>root.querySelector('#card-form').classList.toggle('is-hidden');
  root.querySelectorAll('.lang').forEach((b)=>b.onclick=()=>{inputLang=b.dataset.lang; root.querySelectorAll('.lang').forEach((x)=>x.classList.toggle('active',x===b));});
  root.querySelector('#translate-btn').onclick=async()=>{const text=root.querySelector('#text').value.trim();const translated=await translateText({text,from:inputLang,to:inputLang==='de'?'es':'de'});console.info('[translate] source=manual-button result=',translated);if(translated)root.querySelector('#translation').value=translated;};
  root.querySelector('#lookup').onclick=async()=>{if(inputLang!=='de')return;const text=root.querySelector('#text').value.trim();const data=await lookupGermanNoun(text);console.info('[lookup] result=',data);if(data.article)root.querySelector('#article').value=data.article;if(data.plural&&!root.querySelector('#plural').value.trim())root.querySelector('#plural').value=data.plural;const v=root.querySelector('#article').value;const pill=root.querySelector('#article-pill');pill.className=`small ${articleColorClass(v)}`;pill.textContent=v?`Artículo: ${v}`:'Sin lookup fiable: usa manual';};
  list.onclick=(e)=>{const b=e.target.closest('.play'); if(!b) return; const card={inputLang:'de'}; const out=speakText(b.dataset.text,getSpeechLangForCard(card)); if(!out.ok&&out.reason==='unsupported') alert('Audio no disponible en este navegador.');};
  root.querySelector('#save-card').onclick=()=>{const text=root.querySelector('#text').value.trim();const translation=root.querySelector('#translation').value.trim();if(!text||!translation)return; saveCards([...getCards(),{id:uid(),deckId:deck.id,inputLang,text,translation,article:root.querySelector('#article').value,plural:root.querySelector('#plural').value.trim(),example:root.querySelector('#example').value.trim(),notes:root.querySelector('#notes').value.trim(),tags:root.querySelector('#tags').value.split(',').map(t=>t.trim()).filter(Boolean)}]); paint();};
};
