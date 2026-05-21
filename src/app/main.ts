import "./shell.css";

type Level = "log" | "warn" | "error";

const logs: string[] = [];
const errors: string[] = [];

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("#app no existe");

const bootStatus = document.querySelector<HTMLElement>("#boot-status");
const diagCurrent = document.querySelector<HTMLElement>("#diag-current");
const diagLast = document.querySelector<HTMLElement>("#diag-last");
const debugLog = document.querySelector<HTMLElement>("#debug-log");
const debugConsole = document.querySelector<HTMLElement>("#debug-console");

function appendLog(level: Level, message: string) {
  const line = `[${level}] ${message}`;
  logs.push(line);
  if (level !== "log") errors.push(line);
  if (debugLog) debugLog.textContent = logs.join("\n");
}

function markCheck(key: "loading" | "executed" | "nav", text: string, done: boolean) {
  const target = document.querySelector<HTMLElement>(`[data-check="${key}"]`);
  if (!target) return;
  target.textContent = `${done ? "✅" : "⏳"} ${text}`;
}

function setDiag(current: string, last: string) {
  if (diagCurrent) diagCurrent.textContent = current;
  if (diagLast) diagLast.textContent = last;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

async function hardReset() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
  sessionStorage.clear();
  location.href = `./?v=${Date.now()}`;
}

function wireDebugCapture() {
  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };

  console.log = (...args) => {
    appendLog("log", args.map(String).join(" "));
    original.log(...args);
  };
  console.warn = (...args) => {
    appendLog("warn", args.map(String).join(" "));
    original.warn(...args);
  };
  console.error = (...args) => {
    appendLog("error", args.map(String).join(" "));
    original.error(...args);
  };

  window.addEventListener("error", (event) => appendLog("error", `window.error ${event.message}`));
  window.addEventListener("unhandledrejection", (event) => appendLog("error", `unhandledrejection ${String(event.reason)}`));
}

function wireNavigation() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-tab]"));
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const current = tab.dataset.tab;
      tabs.forEach((btn) => btn.classList.toggle("active", btn === tab));
      panels.forEach((panel) => (panel.hidden = panel.dataset.panel !== current));
      setDiag(`Pestaña: ${current}`, "navegación básica");
    });
  });

  markCheck("nav", "navegación básica", true);
}

wireDebugCapture();
console.log("[boot:main-loaded]");
app.dataset.jsStatus = "executed";
if (bootStatus) bootStatus.textContent = "JS ejecutado";
markCheck("loading", "JS cargando", true);
markCheck("executed", "JS ejecutado", true);
setDiag("JS ejecutado", "JS ejecutado");
wireNavigation();

app.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const action = target.dataset.action;
  if (!action) return;

  if (action === "copy-diagnostics") {
    copyText(`Paso actual: ${diagCurrent?.textContent}\nÚltimo completado: ${diagLast?.textContent}\n${logs.join("\n")}`);
  }
  if (action === "hard-reset") void hardReset();
  if (action === "copy-errors") copyText(errors.join("\n") || "Sin errores");
  if (action === "copy-all") copyText(logs.join("\n"));
  if (action === "close-debug" && debugConsole) debugConsole.hidden = true;
});

document.querySelector("#debug-toggle")?.addEventListener("click", () => {
  if (debugConsole) debugConsole.hidden = !debugConsole.hidden;
});
