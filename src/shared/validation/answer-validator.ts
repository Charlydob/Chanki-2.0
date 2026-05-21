import { normalizeAnswer } from "./normalize-text";
import { validateGermanCapitalization, validateRequiredArticle } from "./german-rules";

export type AnswerValidationResult = {
  status: "correct" | "warning" | "incorrect";
  message: string;
  issues: string[];
};

// #region Compare
export function compareAnswer(expected: string, actual: string, options?: { requiresArticle?: boolean; expectedArticle?: string }): AnswerValidationResult {
  const e = normalizeAnswer(expected);
  const a = normalizeAnswer(actual);
  const issues: string[] = [];
  if (options?.requiresArticle && !validateRequiredArticle(options.expectedArticle ?? "", actual)) {
    issues.push("article-required");
    return { status: "incorrect", message: "Falta o no coincide el artículo.", issues };
  }
  if (e === a) return { status: "correct", message: "¡Correcto!", issues };
  if (e.includes(a) || a.includes(e)) {
    if (!validateGermanCapitalization(expected, actual)) {
      issues.push("capitalization");
      return { status: "warning", message: "Casi correcto, revisa mayúsculas en alemán.", issues };
    }
    return { status: "warning", message: "Respuesta cercana.", issues };
  }
  return { status: "incorrect", message: "Respuesta incorrecta.", issues: [...issues, "mismatch"] };
}
// #endregion
