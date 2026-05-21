// #region Auth stubs
let currentUser: { uid: string; email: string } | null = null;

export async function loginWithEmail(email: string, _password: string) {
  currentUser = { uid: "local-user", email };
  return currentUser;
}
export async function registerWithEmail(email: string, _password: string) {
  currentUser = { uid: "local-user", email };
  return currentUser;
}
export async function logout() { currentUser = null; }
export function getCurrentUser() { return currentUser; }
// #endregion
