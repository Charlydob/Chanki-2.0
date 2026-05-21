import { getCurrentUser, logout, observeSession } from "../../shared/firebase/auth";
import { showToast } from "../../shared/ui/toast";

export function mountSettingsPage(root: HTMLElement, onLogout: () => void): void {
  const stateEl = root.querySelector<HTMLElement>("#session-state");
  const emailEl = root.querySelector<HTMLElement>("#session-email");

  const render = () => {
    const user = getCurrentUser();
    if (!stateEl || !emailEl) return;
    stateEl.textContent = user ? "Activa" : "Sin sesión";
    emailEl.textContent = user?.email ?? "—";
  };

  render();
  const unsub = observeSession(() => render());

  root.querySelector<HTMLButtonElement>("#settings-logout")?.addEventListener("click", async () => {
    await logout();
    showToast("Sesión cerrada");
    unsub();
    onLogout();
  });
}
