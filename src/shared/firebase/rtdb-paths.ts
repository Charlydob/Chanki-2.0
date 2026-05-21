export const rtdbPaths = {
  userProfile: (uid: string) => `users/${uid}/profile`,
  userSettings: (uid: string) => `users/${uid}/settings`,
  userDecks: (uid: string) => `users/${uid}/decks`,
  userDeck: (uid: string, deckId: string) => `users/${uid}/decks/${deckId}`,
  userCards: (uid: string) => `users/${uid}/cards`,
  userCard: (uid: string, cardId: string) => `users/${uid}/cards/${cardId}`,
  userProgress: (uid: string) => `users/${uid}/progress`,
  userStudySessions: (uid: string) => `users/${uid}/studySessions`,
  translationCache: (uid: string) => `users/${uid}/translationCache`,
  dictionaryCache: (uid: string) => `users/${uid}/dictionaryCache`
};
