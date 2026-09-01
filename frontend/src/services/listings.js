import api from './api';

/**
 * Listing API calls (Phase 02) — farmer CRUD + public browse/detail.
 */
export async function createListing(payload) {
  const { data } = await api.post('/listings', payload);
  return data.data;
}

export async function listListings(params) {
  const { data } = await api.get('/listings', { params });
  return data.data;
}

export async function getListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data.data;
}

export async function updateListing(id, patch) {
  const { data } = await api.patch(`/listings/${id}`, patch);
  return data.data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/listings/${id}`);
  return data.data;
}

export async function uploadListingImages(id, files) {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const { data } = await api.post(`/listings/${id}/images`, form);
  return data.data;
}

export async function getMyListings(params) {
  const { data } = await api.get('/farmer/me/listings', { params });
  return data.data;
}
