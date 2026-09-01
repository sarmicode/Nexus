import api from './api';

/**
 * FPO API calls (Phase 02) — create/list/read/update + the caller's own FPOs.
 */
export async function createFpo(payload) {
  const { data } = await api.post('/fpos', payload);
  return data.data;
}

export async function listFpos(params) {
  const { data } = await api.get('/fpos', { params });
  return data.data;
}

export async function getFpo(id) {
  const { data } = await api.get(`/fpos/${id}`);
  return data.data;
}

export async function updateFpo(id, patch) {
  const { data } = await api.patch(`/fpos/${id}`, patch);
  return data.data;
}

export async function getMyFpos() {
  const { data } = await api.get('/farmer/me/fpos');
  return data.data;
}
