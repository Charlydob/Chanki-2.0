import type { StudyCard } from "./study.types";
export function randomDirection(card: StudyCard): { prompt: string; expected: string } {
  return Math.random() > 0.5 ? { prompt: card.front, expected: card.back } : { prompt: card.back, expected: card.front };
}
