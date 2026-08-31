import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Shared axios instance — every API call in the app goes through this
 * (RULES.md §5). VITE_API_BASE_URL defaults to the versioned root /api/v1,
 * which the Vite dev server proxies to the Express gateway.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/** Attach the current access token to every request. */
api.interceptors.request.use((config) => {
  const token = tokenStorage.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** One in-flight refresh at a time (avoids refresh stampedes on parallel 401s). */
let refreshPromise = null;

function silentRefresh() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh', { refreshToken: tokenStorage.refresh })
      .then(({ data }) => {
        tokenStorage.access = data.data.accessToken;
        tokenStorage.refresh = data.data.refreshToken;
        return data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Response interceptor:
 * 1. 401 on a non-auth route → ONE silent refresh → retry the original request
 *    (the "user notices nothing" requirement). If the refresh fails, the
 *    session is cleared and `fb:logout` is dispatched for AuthContext.
 * 2. Normalizes the backend error envelope
 *    { success: false, error: { code, message } } into { code, message, status }.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (status === 401 && original && !original._retry && !isAuthCall && tokenStorage.refresh) {
      original._retry = true;
      try {
        const newToken = await silentRefresh();
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      } catch (refreshError) {
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent('fb:logout'));
        throw refreshError;
      }
    }

    const data = error.response?.data;
    const normalized = {
      code: data?.error?.code || (error.response ? 'HTTP_ERROR' : 'NETWORK_ERROR'),
      message: data?.error?.message || error.message || 'Something went wrong',
      status: error.response?.status ?? null,
    };
    const normalizedError = new Error(normalized.message);
    normalizedError.apiError = normalized;
    return Promise.reject(normalizedError);
  }
);

export default api;
