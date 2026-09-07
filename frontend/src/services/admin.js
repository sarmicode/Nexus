import api from './api';

// Analytics.
export const getFarmerAnalytics = () =>
  api.get('/analytics/farmer').then((r) => r.data.data);

export const getBuyerAnalytics = () =>
  api.get('/analytics/buyer').then((r) => r.data.data);

export const getAdminOverview = () =>
  api.get('/analytics/admin/overview').then((r) => r.data.data);

// Admin.
export const adminListUsers = (params) =>
  api.get('/admin/users', { params }).then((r) => r.data.data);

export const adminUpdateUser = (id, data) =>
  api.patch(`/admin/users/${id}`, data).then((r) => r.data.data);

export const adminBlockUser = (id) =>
  api.post(`/admin/users/${id}/block`).then((r) => r.data.data);

export const adminUnblockUser = (id) =>
  api.post(`/admin/users/${id}/unblock`).then((r) => r.data.data);

export const adminVerifyFpo = (id) =>
  api.post(`/admin/fpos/${id}/verify`).then((r) => r.data.data);

export const adminGetDisputes = (params) =>
  api.get('/admin/disputes', { params }).then((r) => r.data.data);

export const adminResolveDispute = (id, data) =>
  api.patch(`/admin/disputes/${id}/resolve`, data).then((r) => r.data.data);

export const adminQualityCheck = (id, data) =>
  api.post(`/admin/quality/${id}`, data).then((r) => r.data.data);

export const adminGetAuditLog = (params) =>
  api.get('/admin/audit', { params }).then((r) => r.data.data);

// Logistics.
export const estimateLogistics = (from, to, qtyTonnes) =>
  api
    .get('/logistics/estimate', {
      params: { from: from.join(','), to: to.join(','), qtyTonnes },
    })
    .then((r) => r.data.data);

export const optimizeRoute = (stops) =>
  api.post('/logistics/optimize', { stops }).then((r) => r.data.data);
