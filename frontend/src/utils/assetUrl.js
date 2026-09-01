/**
 * Resolve an uploaded-asset path (e.g. /uploads/listings/x.jpg) into a URL the
 * browser can load.
 *
 * - Local dev / preview: VITE_API_BASE_URL is relative (/api/v1) and the Vite
 *   dev server proxies /uploads to the backend, so the path is used as-is.
 * - Deployed backend: VITE_API_BASE_URL is absolute — derive its origin and
 *   prepend it.
 */
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  if (/^https?:\/\//.test(base)) {
    return new URL(path, base).href;
  }
  return path;
}
