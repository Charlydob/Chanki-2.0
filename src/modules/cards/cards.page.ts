import { saveCard } from "./cards.repository";
import { showToast } from "../../shared/ui/toast";
export function mountCardsPage(root: HTMLElement){
  root.querySelector("#autocomplete")?.addEventListener("click",()=>showToast("Autocompletar (mock)"));
  root.querySelector("#save-card")?.addEventListener("click",()=>{saveCard("mock");showToast("Tarjeta guardada (mock)");});
}
