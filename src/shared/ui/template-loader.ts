import { logEvent } from "../debug/debug-console";

export async function loadTemplate(path: string): Promise<string> {
  logEvent(`[template:load:start] ${path}`);
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`No se pudo cargar plantilla: ${path}`);
    const html = await response.text();
    logEvent(`[template:load:ready] ${path}`);
    return html;
  } catch (error) {
    logEvent(`[template:load:error] ${path} ${(error as Error).message}`, "error");
    throw error;
  }
}

export function renderTemplateLoadError(host: HTMLElement, path: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  host.innerHTML = `<section class="boot-screen"><h2>Error cargando vista</h2><p>Ruta: ${path}</p><p>${message}</p></section>`;
}
