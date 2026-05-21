import { getDecks, getCards, getProgress } from '../storage.local.js';

export const renderStats = (root) => {
  const decks = getDecks();
  const cards = getCards();
  const progress = getProgress();
  const known = progress.filter((p) => p.grade === 'known').length;
  const doubt = progress.filter((p) => p.grade === 'doubt').length;
  const fail = progress.filter((p) => p.grade === 'fail').length;
  root.innerHTML = `<div class="view-grid">${[
    ['mazos', decks.length], ['tarjetas', cards.length], ['la sabía', known], ['dudosa', doubt], ['no la sabía', fail]
  ].map(([k,v])=>`<article class="card"><strong>${k}</strong><p>${v}</p></article>`).join('')}</div>`;
};
