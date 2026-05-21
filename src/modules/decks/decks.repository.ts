import { getCurrentUser } from "../../shared/firebase/auth";
import { createAtPath, listByPath, removeAtPath, updateAtPath } from "../../shared/firebase/database";
import { rtdbPaths } from "../../shared/firebase/rtdb-paths";
import type { Deck } from "./decks.types";

type DeckPayload = Omit<Deck, "id">;

function requireUid(): string {
  const user = getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  return user.uid;
}

export async function getDecks(): Promise<Deck[]> {
  const uid = requireUid();
  return listByPath<DeckPayload>(rtdbPaths.userDecks(uid));
}

export async function createDeck(payload: DeckPayload): Promise<string> {
  const uid = requireUid();
  return createAtPath(rtdbPaths.userDecks(uid), payload);
}

export async function renameDeck(deckId: string, name: string): Promise<void> {
  const uid = requireUid();
  await updateAtPath(rtdbPaths.userDeck(uid, deckId), { name });
}

export async function deleteDeck(deckId: string): Promise<void> {
  const uid = requireUid();
  await removeAtPath(rtdbPaths.userDeck(uid, deckId));
}
