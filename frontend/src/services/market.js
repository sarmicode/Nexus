import api from './api';

export const getLatestPrices = (params) =>
  api.get('/market/prices/latest', { params }).then((r) => r.data.data);

export const getPriceTrends = (crop, params) =>
  api.get(`/market/prices/trends/${encodeURIComponent(crop)}`, { params }).then((r) => r.data.data);

export const compareCrops = (params) =>
  api.get('/market/prices/compare', { params }).then((r) => r.data.data);

export const getMandis = (params) =>
  api.get('/market/mandis', { params }).then((r) => r.data.data);

export const getMandisGeo = () =>
  api.get('/market/mandis/geo').then((r) => r.data.data);

export const getPriceHeatmap = (crop) =>
  api.get('/market/prices/heatmap', { params: crop ? { crop } : {} }).then((r) => r.data.data);

export const createPriceAlert = (data) =>
  api.post('/market/alerts', data).then((r) => r.data.data);

export const getPriceAlerts = () =>
  api.get('/market/alerts').then((r) => r.data.data);

export const deletePriceAlert = (id) =>
  api.delete(`/market/alerts/${id}`).then((r) => r.data.data);
