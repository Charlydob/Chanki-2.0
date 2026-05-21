import { createDeck, deleteDeck, getDecks, renameDeck } from "./decks.repository";
import { showToast } from "../../shared/ui/toast";

export function mountDecksPage(root: HTMLElement): void {
  const list = root.querySelector("#decks-list");
  if (!list) return;

  const render = async () => {
    try {
      const decks = await getDecks();
      list.innerHTML = "";
      decks.forEach((d) => {
        const article = document.createElement("article");
        article.className = "card";
        article.innerHTML = `<h3>${d.name}</h3><p class='deck-meta'>${d.from} → ${d.to} · ${d.count} tarjetas</p>`;

        const actions = document.createElement("div");
        actions.className = "row";
        const renameBtn = document.createElement("button");
        renameBtn.className = "button secondary";
        renameBtn.textContent = "Editar";
        renameBtn.addEventListener("click", async () => {
          const next = prompt("Nuevo nombre", d.name)?.trim();
          if (!next) return;
          await renameDeck(d.id, next);
          await render();
        });
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "button secondary";
        deleteBtn.textContent = "Borrar";
        deleteBtn.addEventListener("click", async () => {
          await deleteDeck(d.id);
          await render();
        });
        actions.append(renameBtn, deleteBtn);
        article.appendChild(actions);
        list.appendChild(article);
      });
    } catch (error) {
      showToast(`No se pudieron cargar mazos: ${(error as Error).message}`);
    }
  };

  root.querySelector("#create-deck")?.addEventListener("click", async () => {
    const name = prompt("Nombre del mazo", "Nuevo mazo")?.trim();
    if (!name) return;
    await createDeck({ name, from: "Español", to: "Alemán", count: 0 });
    showToast("Mazo creado");
    await render();
  });

  void render();
}
