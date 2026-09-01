import api from './api';

/**
 * User API calls (Phase 01).
 */
export async function getMe() {
  const { data } = await api.get('/users/me');
  return data.data;
}

export async function updateMe(patch) {
  const { data } = await api.patch('/users/me', patch);
  return data.data;
}
