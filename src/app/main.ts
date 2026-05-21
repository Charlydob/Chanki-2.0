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
import { createRouter } from "./router";
import { registerServiceWorker } from "../shared/pwa/register-sw";
import { initDebugConsole, logEvent, renderFatalError, setBootStatus, setLastError } from "../shared/debug/debug-console";

async function bootstrap() {
  const app = document.querySelector("#app") as HTMLElement | null;
  if (!app) throw new Error("No existe #app");

  initDebugConsole(app);
  logEvent("[boot:dom-ready]");
  setBootStatus("importando módulos");

  try {
    logEvent("[boot:main-imported]");
    logEvent("[boot:shell-render:start]");
    setBootStatus("renderizando shell");
    createRouter(app);
    logEvent("[boot:shell-render:ready]");
    registerServiceWorker();
    setBootStatus("app lista");
  } catch (error) {
    setLastError(error);
    logEvent("[boot:error]", "error");
    renderFatalError(app, error);
  }
}

void bootstrap();
