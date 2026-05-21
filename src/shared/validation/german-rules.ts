// #region German rules
export function validateGermanCapitalization(expected: string, actual: string): boolean {
  if (!expected || !actual) return true;
  return expected === actual;
}

export function validateRequiredArticle(expectedArticle: string, actual: string): boolean {
  if (!expectedArticle) return true;
  return actual.trim().toLocaleLowerCase("de-DE").startsWith(expectedArticle.toLocaleLowerCase("de-DE") + " ");
}
// #endregion
