/**
 * Read unsigned JWT payload claim {@code role}.
 * Backend still enforces ADMIN on /api/admin/** — this is UI-only.
 */
export function roleFromJwt(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }
  try {
    const raw = String(token).trim().replace(/^Bearer\s+/i, '');
    const parts = raw.split('.');
    if (parts.length < 2) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: string };
    const role = (payload.role || '').trim().toUpperCase();
    return role || null;
  } catch {
    return null;
  }
}
