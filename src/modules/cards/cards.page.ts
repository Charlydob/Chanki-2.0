import { listCards, saveCard } from "./cards.repository";
import { showToast } from "../../shared/ui/toast";
import type { CardType } from "./cards.types";

export function mountCardsPage(root: HTMLElement): void {
  const list = root.querySelector("#cards-list");

  const renderCards = async () => {
    if (!list) return;
    const cards = await listCards();
    list.innerHTML = cards.map((c) => `<article class='card'><h3>${c.word} → ${c.translation}</h3><p>${c.type} · deck: ${c.deckId ?? "—"}</p></article>`).join("");
  };

  root.querySelector("#autocomplete")?.addEventListener("click", () => showToast("Autocompletar (mock)"));
  root.querySelector("#save-card")?.addEventListener("click", async () => {
    try {
      await saveCard({
        word: (root.querySelector("#c-word") as HTMLInputElement).value,
        translation: (root.querySelector("#c-translation") as HTMLInputElement).value,
        type: (root.querySelector("#c-type") as HTMLSelectElement).value as CardType,
        article: (root.querySelector("#c-article") as HTMLInputElement).value,
        plural: (root.querySelector("#c-plural") as HTMLInputElement).value,
        example: (root.querySelector("#c-example") as HTMLInputElement).value,
        notes: (root.querySelector("#c-notes") as HTMLTextAreaElement).value,
        deckId: (root.querySelector("#c-deck-id") as HTMLInputElement).value || undefined
      });
      showToast("Tarjeta guardada");
      await renderCards();
    } catch (error) {
      showToast(`No se pudo guardar: ${(error as Error).message}`);
    }
  });

  void renderCards();
}
