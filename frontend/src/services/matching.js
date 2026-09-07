import api from './api';

export const createDemand = (data) =>
  api.post('/demand', data).then((r) => r.data.data);

export const getDemands = (params) =>
  api.get('/demand', { params }).then((r) => r.data.data);

export const updateDemand = (id, data) =>
  api.patch(`/demand/${id}`, data).then((r) => r.data.data);

export const getMatchesForListing = (id) =>
  api.get(`/matches/listing/${id}`).then((r) => r.data.data);

export const getMatchesForDemand = (id) =>
  api.get(`/matches/demand/${id}`).then((r) => r.data.data);

export const getFeed = () =>
  api.get('/matches/feed').then((r) => r.data.data);
