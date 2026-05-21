import { loginWithEmail, registerWithEmail } from "../../shared/firebase/auth";
import { showToast } from "../../shared/ui/toast";

export function mountAuthPage(root: HTMLElement, onSuccess: () => void): void {
  const emailInput = root.querySelector<HTMLInputElement>("#auth-email");
  const passwordInput = root.querySelector<HTMLInputElement>("#auth-password");

  const handleAuth = async (mode: "login" | "register") => {
    const email = emailInput?.value?.trim() ?? "";
    const password = passwordInput?.value ?? "";
    if (!email || !password) {
      showToast("Completa email y contraseña");
      return;
    }
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        showToast("Sesión iniciada");
      } else {
        await registerWithEmail(email, password);
        showToast("Cuenta creada");
      }
      onSuccess();
    } catch (error) {
      showToast(`Error de autenticación: ${(error as Error).message}`);
    }
  };

  root.querySelector<HTMLButtonElement>("#login-btn")?.addEventListener("click", () => void handleAuth("login"));
  root.querySelector<HTMLButtonElement>("#register-btn")?.addEventListener("click", () => void handleAuth("register"));
}
