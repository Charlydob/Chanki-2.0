import shellHtml from "./shell.html?raw";
import authHtml from "../modules/auth/auth.page.html?raw";
import decksHtml from "../modules/decks/decks.page.html?raw";
import cardsHtml from "../modules/cards/cards.page.html?raw";
import studyHtml from "../modules/study/study.page.html?raw";
import exploreHtml from "../modules/explore/explore.page.html?raw";
import statsHtml from "../modules/stats/stats.page.html?raw";
import settingsHtml from "../modules/settings/settings.page.html?raw";
import { getCurrentUser, logout, observeSession, waitForAuthReady } from "../shared/firebase/auth";
import { mountAuthPage } from "../modules/auth/auth.page";
import { mountDecksPage } from "../modules/decks/decks.page";
import { mountCardsPage } from "../modules/cards/cards.page";
import { mountStudyPage } from "../modules/study/study.page";
import { mountExplorePage } from "../modules/explore/explore.page";
import { mountStatsPage } from "../modules/stats/stats.page";
import { mountSettingsPage } from "../modules/settings/settings.page";

export type RouteName = "auth" | "decks" | "cards" | "study" | "explore" | "stats" | "settings";

export function createRouter(host: HTMLElement) {
  host.innerHTML = shellHtml;
  const view = host.querySelector("#route-view") as HTMLElement;
  const nav = host.querySelector("#bottom-nav") as HTMLElement;
  const logoutBtn = host.querySelector("#logout-btn") as HTMLButtonElement;
  let route: RouteName = "auth";

  const templates: Record<RouteName, string> = { auth: authHtml, decks: decksHtml, cards: cardsHtml, study: studyHtml, explore: exploreHtml, stats: statsHtml, settings: settingsHtml };

  const guardRoute = (next: RouteName): RouteName => {
    const user = getCurrentUser();
    if (!user && next !== "auth") return "auth";
    if (user && next === "auth") return "decks";
    return next;
  };

  const render = async () => {
    route = guardRoute(route);
    view.innerHTML = templates[route];
    nav.hidden = route === "auth";
    logoutBtn.hidden = route === "auth";
    nav.querySelectorAll("button").forEach((btn) => btn.classList.toggle("active", (btn as HTMLButtonElement).dataset.route === route));
    if (route === "auth") mountAuthPage(view, () => navigate("decks"));
    if (route === "decks") mountDecksPage(view);
    if (route === "cards") mountCardsPage(view);
    if (route === "study") mountStudyPage(view);
    if (route === "explore") await mountExplorePage(view);
    if (route === "stats") mountStatsPage();
    if (route === "settings") mountSettingsPage(view, () => navigate("auth"));
  };

  const navigate = (next: RouteName) => { route = next; void render(); };
  nav.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => navigate((btn as HTMLButtonElement).dataset.route as RouteName)));
  logoutBtn.addEventListener("click", async () => { await logout(); navigate("auth"); });

  void waitForAuthReady().then((user) => {
    route = user ? "decks" : "auth";
    void render();
  });

  observeSession((user) => {
    if (!user && route !== "auth") navigate("auth");
  });

  return { navigate };
}
