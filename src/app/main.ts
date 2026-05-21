import "./shell.css";
import "../styles/tokens.css";
import "../styles/typography.css";
import "../styles/themes.css";
import "../styles/layout.css";
import "../styles/buttons.css";
import "../styles/forms.css";
import "../styles/cards.css";
import "../modules/auth/auth.page.css";
import "../modules/decks/decks.page.css";
import "../modules/cards/cards.page.css";
import "../modules/study/study.page.css";
import "../modules/explore/explore.page.css";
import "../modules/stats/stats.page.css";
import "../modules/settings/settings.page.css";

type BootLogger = (message: string) => void;

function renderBootShell(host: HTMLElement): BootLogger {
  host.innerHTML = `
    <div style="min-height:100dvh;background:#f4f6fb;color:#1b2559;font-family:Inter,system-ui,sans-serif;display:grid;grid-template-rows:auto 1fr auto;">
      <header style="padding:1rem 1.25rem;background:#ffffff;border-bottom:1px solid #dbe3ff;display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:1.1rem;">Cardshell</strong>
        <button type="button" aria-label="Debug" style="position:fixed;top:12px;right:12px;z-index:50;padding:.45rem .7rem;border-radius:999px;border:1px solid #9fb3ff;background:#fff;color:#1b2559;">Debug</button>
      </header>
      <main style="padding:1rem 1.25rem;">
        <section style="background:#fff;border:1px solid #dbe3ff;border-radius:12px;padding:1rem;">
          <h2 style="margin:0 0 .5rem;">Mazos</h2>
          <p style="margin:0;color:#4f5b8a;">Arranque mínimo activo.</p>
        </section>
        <section style="margin-top:1rem;background:#fff;border:1px solid #dbe3ff;border-radius:12px;padding:1rem;">
          <h3 style="margin:0 0 .5rem;">Boot logs</h3>
          <pre id="boot-logs" style="margin:0;white-space:pre-wrap;font-size:.85rem;line-height:1.5;color:#1b2559;"></pre>
        </section>
      </main>
      <nav style="padding:.8rem 1.25rem;background:#ffffff;border-top:1px solid #dbe3ff;">Navegación inferior</nav>
    </div>
  `;

  const pre = host.querySelector("#boot-logs") as HTMLPreElement | null;
  return (message: string) => {
    if (!pre) return;
    pre.textContent = `${pre.textContent}${pre.textContent ? "\n" : ""}${message}`;
  };
}

async function bootstrap() {
  const app = document.querySelector("#app") as HTMLElement | null;
  if (!app) {
    throw new Error("Error de arranque: no existe el contenedor #app en index.html");
  }

  const log = renderBootShell(app);
  log("[boot:start]");
  log("[boot:main-loaded]");
  log("[boot:app-found]");
  log("[boot:shell-rendered]");

  try {
    const { loadTemplate } = await import("../shared/ui/template-loader");
    await loadTemplate("/src/modules/decks/decks.page.html");
    log("[boot:templates-loaded]");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`[boot:templates-error] ${message}`);
  }
}

void bootstrap();
