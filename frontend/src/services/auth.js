import api from './api';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Auth API calls (Phase 01). Both register and login return tokens —
 * the app auto-logs the user in on success.
 */
function saveTokens(data) {
  tokenStorage.access = data.accessToken;
  tokenStorage.refresh = data.refreshToken;
}

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  saveTokens(data.data);
  return data.data.user;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  saveTokens(data.data);
  return data.data.user;
}

export async function logout() {
  try {
    await api.post('/auth/logout'); // best effort — server-side token wipe
  } catch {
    /* even if the call fails, the local session is cleared below */
  }
  tokenStorage.clear();
}
