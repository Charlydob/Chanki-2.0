export const hardReset = async () => {
  try { const keys = await caches.keys(); await Promise.all(keys.map((k)=>caches.delete(k))); } catch {}
  try { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map((r)=>r.unregister())); } catch {}
  sessionStorage.clear();
  location.href = `${location.pathname}?v=${Date.now()}`;
};
