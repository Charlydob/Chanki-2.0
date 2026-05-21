import { cardsStore } from "./cards.store";
export function saveCard(payload: string){ cardsStore.push(payload); }
