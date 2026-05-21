import { getDecks } from "./decks.repository";
import { showToast } from "../../shared/ui/toast";
export function mountDecksPage(root: HTMLElement): void {
  const list = root.querySelector("#decks-list"); if (!list) return;
  list.innerHTML = getDecks().map(d=>`<article class='card'><h3>${d.name}</h3><p class='deck-meta'>${d.from} → ${d.to} · ${d.count} tarjetas</p></article>`).join("");
  root.querySelector("#create-deck")?.addEventListener("click",()=>showToast("Crear mazo (mock)"));
}
