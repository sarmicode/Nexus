import axios from 'axios';

/**
 * Shared axios instance — every API call in the app goes through this
 * (RULES.md §5). VITE_API_BASE_URL defaults to the relative /api path,
 * which the Vite dev server proxies to the Express gateway.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Response interceptor — normalizes the backend error envelope
 * { success: false, error: { code, message } } into a consistent
 * { code, message, status } shape for UI components.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
