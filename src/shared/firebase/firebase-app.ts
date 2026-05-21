// #region Firebase app
export type FirebaseConfig = Record<string, string>;
let initialized = false;

export function initFirebase(config?: FirebaseConfig): boolean {
  initialized = Boolean(config && Object.keys(config).length);
  return initialized;
}

export function isFirebaseReady(): boolean {
  return initialized;
}
// #endregion
