import { getFirebaseConfig } from "./firebase-app";
import { logEvent } from "../debug/debug-console";

export type SessionUser = { uid: string; email: string | null; idToken: string };
const STORAGE_KEY = "cardshell-session";
let currentUser: SessionUser | null = null;
const listeners = new Set<(user: SessionUser | null) => void>();

function emit() { listeners.forEach((cb) => cb(currentUser)); }

function setSession(user: SessionUser | null) {
  currentUser = user;
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
  emit();
}

async function authRequest(endpoint: string, email: string, password: string): Promise<SessionUser> {
  const { apiKey } = getFirebaseConfig();
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Error de autenticación");
  return { uid: data.localId, email: data.email, idToken: data.idToken };
}

export async function loginWithEmail(email: string, password: string): Promise<SessionUser> {
  const user = await authRequest("accounts:signInWithPassword", email, password);
  setSession(user);
  return user;
}

export async function registerWithEmail(email: string, password: string): Promise<SessionUser> {
  const user = await authRequest("accounts:signUp", email, password);
  setSession(user);
  return user;
}

export async function logout(): Promise<void> { setSession(null); }
export function getCurrentUser(): SessionUser | null { return currentUser; }
export async function waitForAuthReady(): Promise<SessionUser | null> {
  logEvent("[firebase:init:start]");
  if (currentUser) return currentUser;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { logEvent("[firebase:init:ready]"); return null; }
  try { currentUser = JSON.parse(raw) as SessionUser; } catch { currentUser = null; }
  logEvent("[firebase:init:ready]");
  return currentUser;
}
export function observeSession(cb: (user: SessionUser | null) => void): () => void {
  listeners.add(cb); cb(currentUser); return () => listeners.delete(cb);
}
