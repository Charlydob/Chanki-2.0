import { renderAuth } from './modules/auth.js';
import { renderDecks } from './modules/decks.js';
import { renderCards } from './modules/cards.js';
import { renderStudy } from './modules/study.js';
import { renderExplore } from './modules/explore.js';
import { renderStats } from './modules/stats.js';
import { renderSettings } from './modules/settings.js';
import { authMock } from './auth.mock.js';

export const createRouter=({root,title,nav,diag,hardReset})=>{const routes={login:'Cardshell',decks:'Mazos',cards:'Mazo',study:'Estudiar',explore:'Explorar',stats:'Stats',settings:'Ajustes'};
const render=(r)=>{title.textContent=routes[r]||'Cardshell'; nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.route===r));
if(r==='login') return renderAuth(root,go);
if(!authMock.user()) return go('login');
if(r==='decks') renderDecks(root,go); if(r==='cards') renderCards(root,go); if(r==='study') renderStudy(root); if(r==='explore') renderExplore(root); if(r==='stats') renderStats(root); if(r==='settings') renderSettings(root,go,diag,hardReset);
};
const go=(r)=>{history.replaceState({},'',`#${r}`);render(r);};
nav.onclick=(e)=>{const b=e.target.closest('button[data-route]'); if(!b) return; go(b.dataset.route);};
return {start(){go(authMock.user()?'decks':'login');},go};};
