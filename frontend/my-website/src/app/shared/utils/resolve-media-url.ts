import { environment } from '../../../environments/environment';

/**
 * Theme JSON paths may be:
 * - full URLs (Instagram API)
 * - /assets/... (bundled static files served by the frontend)
 * - /products/... or /homepage/... (R2 / CDN storage keys)
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/assets/')) {
    return normalized;
  }

  const base = environment.storageURL.endsWith('/')
    ? environment.storageURL
    : `${environment.storageURL}/`;
  const key = normalized.startsWith('/') ? normalized.slice(1) : normalized;
  return `${base}${key}`;
}
