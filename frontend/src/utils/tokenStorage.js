const ACCESS_KEY = 'fb.access_token';
const REFRESH_KEY = 'fb.refresh_token';

/**
 * Token storage (Phase 01).
 *
 * Access + refresh tokens live in localStorage. A pure SPA cannot use real
 * httpOnly cookies without a server cookie flow — this trade-off is logged in
 * docs/PROJECT_STATE.md. Mitigations: the refresh token is only ever sent to
 * /auth/refresh, rotates on every use, and dies on logout.
 */
export const tokenStorage = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  set access(value) {
    if (value) localStorage.setItem(ACCESS_KEY, value);
    else localStorage.removeItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set refresh(value) {
    if (value) localStorage.setItem(REFRESH_KEY, value);
    else localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
