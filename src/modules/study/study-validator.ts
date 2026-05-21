import { compareAnswer } from "../../shared/validation/answer-validator";
import type { StudyCard } from "./study.types";
export function validateStudyAnswer(card: StudyCard, actual: string){
  return compareAnswer(card.back, actual, { requiresArticle: card.requiresArticle, expectedArticle: card.article });
}
