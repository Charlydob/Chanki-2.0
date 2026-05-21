// #region RTDB paths
export const rtdbPaths = {
  userProfile: (uid: string) => `users/${uid}/profile`,
  userSettings: (uid: string) => `users/${uid}/settings`,
  userDecks: (uid: string) => `users/${uid}/decks`,
  userCards: (uid: string) => `users/${uid}/cards`,
  userProgress: (uid: string) => `users/${uid}/progress`,
  userStudySessions: (uid: string) => `users/${uid}/studySessions`,
  translationCache: (uid: string) => `users/${uid}/translationCache`,
  dictionaryCache: (uid: string) => `users/${uid}/dictionaryCache`
};
// #endregion
