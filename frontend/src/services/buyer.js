import api from './api';

export const searchListings = (params) =>
  api.get('/buyer/search', { params }).then((r) => r.data.data);

export const addToWatchlist = (listingId, note) =>
  api.post('/buyer/watchlist', { listingId, note }).then((r) => r.data.data);

export const getWatchlist = (params) =>
  api.get('/buyer/watchlist', { params }).then((r) => r.data.data);

export const removeFromWatchlist = (id) =>
  api.delete(`/buyer/watchlist/${id}`).then((r) => r.data.data);

export const createSavedSearch = (data) =>
  api.post('/buyer/saved-searches', data).then((r) => r.data.data);

export const getSavedSearches = (params) =>
  api.get('/buyer/saved-searches', { params }).then((r) => r.data.data);

export const deleteSavedSearch = (id) =>
  api.delete(`/buyer/saved-searches/${id}`).then((r) => r.data.data);

export const createLead = (listingId, data) =>
  api.post(`/buyer/listings/${listingId}/leads`, data).then((r) => r.data.data);

export const getBuyerLeads = (params) =>
  api.get('/buyer/leads', { params }).then((r) => r.data.data);

export const getFarmerLeads = (params) =>
  api.get('/farmer/leads', { params }).then((r) => r.data.data);

export const updateLeadStatus = (id, status) =>
  api.patch(`/farmer/leads/${id}`, { status }).then((r) => r.data.data);
