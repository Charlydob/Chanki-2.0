export type DebugLevel = "log" | "warn" | "error";

export type DebugEntry = {
  ts: string;
  level: DebugLevel;
  message: string;
  details?: string;
  file?: string;
  line?: number;
  col?: number;
};

const STORAGE_KEY = "cardshell-debug-logs";
const MAX_LOGS = 200;
const logs: DebugEntry[] = [];
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

let bootStatus = "iniciando";
let lastError = "";
let bootScreenHost: HTMLElement | null = null;
let panelHost: HTMLElement | null = null;

function serialize(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function saveLogs() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); } catch {}
}

function updateUi() {
  if (bootScreenHost) {
    const list = logs.slice(-12).map((entry) => `<li>[${entry.ts}] ${entry.message}</li>`).join("");
    bootScreenHost.innerHTML = `<section class="boot-screen"><h1>Cardshell</h1><p><strong>Estado:</strong> ${bootStatus}</p><p><strong>Último error:</strong> ${lastError || "sin errores"}</p><ul>${list || "<li>sin logs</li>"}</ul></section>`;
  }
  if (panelHost) {
    const text = logs.map((entry) => `${entry.ts} [${entry.level}] ${entry.message}${entry.details ? `\n${entry.details}` : ""}`).join("\n");
    const pre = panelHost.querySelector("pre");
    if (pre) pre.textContent = text || "Sin logs";
  }
}

function push(entry: DebugEntry) {
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
  saveLogs();
  updateUi();
}

export function logEvent(message: string, level: DebugLevel = "log", details?: string) {
  push({ ts: new Date().toISOString(), level, message, details });
}

export function setBootStatus(status: string) { bootStatus = status; updateUi(); }
export function setLastError(error: unknown) { lastError = serialize(error); updateUi(); }

export function initDebugConsole(appHost: HTMLElement) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) logs.splice(0, logs.length, ...(JSON.parse(stored) as DebugEntry[]).slice(-MAX_LOGS));
  } catch {}

  bootScreenHost = document.createElement("div");
  bootScreenHost.id = "boot-screen-host";
  appHost.replaceChildren(bootScreenHost);

  const toggle = document.createElement("button");
  toggle.id = "debug-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Abrir debug");
  toggle.textContent = "·";

  panelHost = document.createElement("aside");
  panelHost.id = "debug-panel";
  panelHost.hidden = true;
  panelHost.innerHTML = `<div class="debug-panel-inner"><h2>Debug Cardshell</h2><pre></pre><div class="debug-actions"><button type="button" data-action="copy-errors">Copiar errores</button><button type="button" data-action="copy-all">Copiar todo</button><button type="button" data-action="hard-reset">Hard reset</button><button type="button" data-action="close">Cerrar</button></div></div>`;

  toggle.addEventListener("click", () => { if (!panelHost) return; panelHost.hidden = !panelHost.hidden; updateUi(); });
  panelHost.addEventListener("click", async (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (!action) return;
    if (action === "close") panelHost!.hidden = true;
    if (action === "copy-errors") await copyDebugReport(true);
    if (action === "copy-all") await copyDebugReport(false);
    if (action === "hard-reset") await hardReset();
  });

  document.body.append(toggle, panelHost);

  window.addEventListener("error", (ev) => {
    setLastError(ev.error || ev.message);
    logEvent(`[boot:error] ${ev.message}`, "error", [ev.filename, ev.lineno, ev.colno].filter(Boolean).join(":"));
  });
  window.addEventListener("unhandledrejection", (ev) => { setLastError(ev.reason); logEvent(`[boot:error] ${serialize(ev.reason)}`, "error"); });

  console.log = (...args: unknown[]) => { logEvent(args.map(serialize).join(" "), "log"); originalConsole.log(...args); };
  console.warn = (...args: unknown[]) => { logEvent(args.map(serialize).join(" "), "warn"); originalConsole.warn(...args); };
  console.error = (...args: unknown[]) => { logEvent(args.map(serialize).join(" "), "error"); originalConsole.error(...args); };

  logEvent("[boot:start]");
  updateUi();
}

export async function copyDebugReport(onlyErrors = false): Promise<void> {
  const selected = onlyErrors ? logs.filter((entry) => entry.level === "error") : logs;
  const content = selected.map((entry) => `${entry.ts} [${entry.level}] ${entry.message}${entry.details ? `\n${entry.details}` : ""}`).join("\n");
  await navigator.clipboard.writeText(content || "Sin logs disponibles");
  logEvent(onlyErrors ? "[debug:copy-errors]" : "[debug:copy-all]");
}

export async function hardReset(): Promise<void> {
  logEvent("[debug:hard-reset:start]", "warn");
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }
  sessionStorage.clear();
  const keepDebug = localStorage.getItem(STORAGE_KEY);
  localStorage.clear();
  if (keepDebug) localStorage.setItem(STORAGE_KEY, keepDebug);
  location.href = `${location.pathname}?v=${Date.now()}`;
}

export function renderFatalError(host: HTMLElement, error: unknown) {
  const message = serialize(error);
  const stack = error instanceof Error ? error.stack ?? "" : "";
  host.innerHTML = `<section class="boot-screen"><h1>Error cargando Cardshell</h1><p>${message}</p><pre>${stack}</pre><div class="debug-actions"><button type="button" id="copy-fatal">Copiar error</button><button type="button" id="hard-reset-fatal">Hard reset</button></div></section>`;
  host.querySelector("#copy-fatal")?.addEventListener("click", () => void copyDebugReport(false));
  host.querySelector("#hard-reset-fatal")?.addEventListener("click", () => void hardReset());
}
