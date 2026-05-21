import { loginWithEmail, registerWithEmail } from "../../shared/firebase/auth";
import { showToast } from "../../shared/ui/toast";

export function mountAuthPage(root: HTMLElement, onSuccess: () => void): void {
  root.querySelector<HTMLButtonElement>("#login-btn")?.addEventListener("click", async () => {
    const email = (root.querySelector("#auth-email") as HTMLInputElement).value;
    await loginWithEmail(email, "mock");
    showToast("Sesión iniciada (mock)");
    onSuccess();
  });
  root.querySelector<HTMLButtonElement>("#register-btn")?.addEventListener("click", async () => {
    const email = (root.querySelector("#auth-email") as HTMLInputElement).value;
    await registerWithEmail(email, "mock");
    showToast("Cuenta creada (mock)");
    onSuccess();
  });
}
