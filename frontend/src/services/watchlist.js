import api from './api';

/**
 * Watchlist API calls (Phase 03 — Buyer Module).
 */
export async function addToWatchlist(listingId, note) {
  const { data } = await api.post('/watchlist', note ? { listingId, note } : { listingId });
  return data.data;
}

export async function listWatchlist(params) {
  const { data } = await api.get('/watchlist', { params });
  return data.data;
}

export async function removeFromWatchlist(listingId) {
  const { data } = await api.delete(`/watchlist/${listingId}`);
  return data.data;
}
