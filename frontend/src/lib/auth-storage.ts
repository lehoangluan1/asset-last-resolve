import type { User } from '@/types';

export const AUTH_STORAGE_KEY = 'asset_mgmt_auth';

export interface StoredSession {
  token: string;
  user: User;
}

export function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: StoredSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken() {
  return readStoredSession()?.token ?? null;
}
