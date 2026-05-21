import { getCurrentUser } from "../../shared/firebase/auth";
import { createAtPath, listByPath } from "../../shared/firebase/database";
import { rtdbPaths } from "../../shared/firebase/rtdb-paths";
import type { CardType } from "./cards.types";

export type CardEntity = {
  id: string;
  word: string;
  translation: string;
  type: CardType;
  article?: string;
  plural?: string;
  example?: string;
  notes?: string;
  deckId?: string;
};

type CreateCardPayload = Omit<CardEntity, "id">;

function requireUid(): string {
  const user = getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  return user.uid;
}

export async function listCards(): Promise<CardEntity[]> {
  const uid = requireUid();
  return listByPath<CreateCardPayload>(rtdbPaths.userCards(uid));
}

export async function saveCard(payload: CreateCardPayload): Promise<string> {
  const uid = requireUid();
  return createAtPath(rtdbPaths.userCards(uid), payload);
}
