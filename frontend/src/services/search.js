import api from './api';

/**
 * Catalog / search API calls (Phase 03 — Buyer Module).
 * `searchListings` mirrors GET /listings/search; public browse is also
 * available via listListings (services/listings.js) with the same filters.
 */
export async function searchListings(params) {
  const { data } = await api.get('/listings/search', { params });
  return data.data;
}
