import { randomDirection } from "./study-engine";
import { validateStudyAnswer } from "./study-validator";
const sample = { front: "la casa", back: "das Haus", type: "sustantivo", article: "das", requiresArticle: true };
export function mountStudyPage(root: HTMLElement){
  const dir = randomDirection(sample);
  const prompt = root.querySelector("#study-prompt") as HTMLElement; prompt.textContent = dir.prompt;
  root.querySelector("#flip-btn")?.addEventListener("click",()=>{prompt.textContent = prompt.textContent === sample.front ? sample.back : sample.front;});
  root.querySelector("#validate-answer")?.addEventListener("click",()=>{
    const answer = (root.querySelector("#study-answer") as HTMLInputElement).value;
    const result = validateStudyAnswer(sample, answer);
    (root.querySelector("#study-result") as HTMLElement).textContent = `${result.status}: ${result.message}`;
  });
}
