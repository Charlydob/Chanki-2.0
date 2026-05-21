// #region Normalize
export function normalizeAnswer(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLocaleLowerCase("de-DE");
}
// #endregion
