import { getCurrentUser } from "./auth";
import { getFirebaseConfig } from "./firebase-app";

function authParam(): string {
  const token = getCurrentUser()?.idToken;
  return token ? `?auth=${encodeURIComponent(token)}` : "";
}

function buildUrl(path: string): string {
  const { databaseURL } = getFirebaseConfig();
  return `${databaseURL}/${path}.json${authParam()}`;
}

export async function listByPath<T>(path: string): Promise<Array<T & { id: string }>> {
  const res = await fetch(buildUrl(path));
  const value = await res.json();
  if (!value) return [];
  return Object.entries(value as Record<string, T>).map(([id, item]) => ({ id, ...item }));
}

export async function createAtPath<T>(path: string, payload: T): Promise<string> {
  const res = await fetch(buildUrl(path), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json() as { name: string };
  return data.name;
}

export async function updateAtPath(path: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(buildUrl(path), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

export async function removeAtPath(path: string): Promise<void> {
  await fetch(buildUrl(path), { method: "DELETE" });
}
