// #region Template loader
export async function loadTemplate(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar plantilla: ${path}`);
  }
  return response.text();
}
// #endregion
