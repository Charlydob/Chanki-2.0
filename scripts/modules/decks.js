import { mockDecks } from '../shared/mock-data.js';
export const renderDecks = (root) => root.innerHTML = `<div class="view-grid"><h2>Mazos</h2><button class="btn">Crear mazo</button>${mockDecks.map(d=>`<article class="card">${d}</article>`).join('')}</div>`;
