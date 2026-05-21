import { getDecks, getCards, getProgress, getExploreState } from '../storage.local.js';
export const renderStats = (root) => {
  const decks = getDecks(); const cards = getCards(); const progress = getProgress(); const explore = Object.values(getExploreState());
  const known = progress.filter((p) => p.grade === 'known').length;
  const doubt = progress.filter((p) => p.grade === 'doubt').length;
  const fail = progress.filter((p) => p.grade === 'fail').length;
  const viewed = explore.length;
  root.innerHTML = `<div class="view-grid"><h3>Mis tarjetas</h3><div class="stats-grid">${[['mazos',decks.length],['tarjetas',cards.length],['la sabía',known],['dudosa',doubt],['no la sabía',fail],['pendientes',Math.max(cards.length-known-doubt-fail,0)]].map(([k,v])=>`<article class="card stat"><p>${v}</p><small>${k}</small></article>`).join('')}</div><h3>Explorar</h3><div class="stats-grid">${[['vistas',viewed],['guardadas',explore.filter(e=>e.status==='saved').length],['ya conocidas',explore.filter(e=>e.status==='known').length],['pasadas',explore.filter(e=>e.status==='skipped').length],['pendientes de revisar',explore.filter(e=>e.nextReviewAt>Date.now()).length]].map(([k,v])=>`<article class="card stat"><p>${v}</p><small>${k}</small></article>`).join('')}</div></div>`;
};
