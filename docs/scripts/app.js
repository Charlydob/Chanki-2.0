import { createRouter } from './router.js';
import { initDebug } from './debug.js';
import { hardReset } from './hard-reset.js';

console.log('[boot:start]');
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[boot:dom-ready]');
  const app = document.getElementById('app-shell');
  const fallback = document.getElementById('boot-fallback');
  const debugPanel = document.getElementById('debug-panel');
  const debug = initDebug(debugPanel, hardReset);
  console.log('[boot:debug-ready]');
  const router = createRouter({ root: document.getElementById('app-view'), title: document.getElementById('view-title'), nav: document.getElementById('bottom-nav'), diag: debug.diag, hardReset });
  console.log('[boot:router-ready]');
  document.getElementById('debug-toggle').onclick = () => debug.open();
  router.start();
  fallback.classList.add('is-hidden'); app.classList.remove('is-hidden');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
  console.log('[boot:app-ready]');
});
