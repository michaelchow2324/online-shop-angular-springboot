/**
 * Read the Ngxs-persisted `auth` slice from localStorage (sync).
 * Used when the in-memory store has not rehydrated yet, or as a guard fallback.
 */
export function readPersistedAuth(): {
  access_token?: string | null;
  role?: string | null;
  email?: string | null;
} | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      access_token?: string | null;
      role?: string | null;
      email?: string | null;
    };
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
