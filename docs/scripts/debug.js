const logs=[]; let lastError='N/A';
const push=(type,args)=>{logs.push(`[${new Date().toISOString()}] ${type} ${args.map(String).join(' ')}`); if(logs.length>200) logs.shift();};
export const initDebug=(panel,hardReset)=>{['log','warn','error'].forEach(k=>{const orig=console[k]; console[k]=(...a)=>{push(k,a); orig(...a);};});
window.onerror=(m,s,l,c,e)=>{lastError=`${m} @${s}:${l}:${c}`; push('onerror',[lastError,e?.stack||'']);};
window.onunhandledrejection=(e)=>{lastError=`Promise ${e.reason}`; push('unhandled',[e.reason]);};
const render=()=>panel.innerHTML=`<h3>Debug</h3><div class="debug-actions"><button id="copy-errors" class="btn-ghost">Copiar errores</button><button id="copy-all" class="btn-ghost">Copiar todo</button><button id="hard-reset" class="btn-ghost">Hard reset</button><button id="close-debug" class="btn">Cerrar</button></div><p>Último error: ${lastError}</p><pre class="debug-log">${logs.join('\n')}</pre>`;
render(); panel.onclick=(e)=>{const id=e.target.id; if(id==='close-debug') panel.classList.add('is-hidden'); if(id==='hard-reset') hardReset(); if(id==='copy-errors') navigator.clipboard.writeText(lastError); if(id==='copy-all') navigator.clipboard.writeText(logs.join('\n'));};
return {open(){render(); panel.classList.remove('is-hidden');},diag(){navigator.clipboard.writeText(`lastError=${lastError}\nlogs=${logs.join('\n')}`);}};};
