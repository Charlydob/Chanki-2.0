import { mockStats } from '../shared/mock-data.js';
export const renderStats=(root)=>root.innerHTML=`<div class="view-grid"><h2>Stats</h2>${Object.entries(mockStats).map(([k,v])=>`<article class="card"><strong>${k}</strong><p>${v}</p></article>`).join('')}</div>`;
