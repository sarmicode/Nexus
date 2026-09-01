import api from './api';

/**
 * Saved-search API calls (Phase 03 — Buyer Module). A saved search stores the
 * query params so the exact search can be recreated from the URL later.
 */
export async function createSavedSearch(query, alertsEnabled = false) {
  const { data } = await api.post('/saved-searches', { query, alertsEnabled });
  return data.data;
}

export async function listSavedSearches() {
  const { data } = await api.get('/saved-searches');
  return data.data;
}

export async function deleteSavedSearch(id) {
  const { data } = await api.delete(`/saved-searches/${id}`);
  return data.data;
}
