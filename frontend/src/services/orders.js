import api from './api';

// Offers.
export const createOffer = (listingId, data) =>
  api.post(`/listings/${listingId}/offers`, data).then((r) => r.data.data);

export const counterOffer = (offerId, data) =>
  api.post(`/offers/${offerId}/counter`, data).then((r) => r.data.data);

export const acceptOffer = (offerId) =>
  api.post(`/offers/${offerId}/accept`).then((r) => r.data.data);

export const rejectOffer = (offerId) =>
  api.post(`/offers/${offerId}/reject`).then((r) => r.data.data);

export const withdrawOffer = (offerId) =>
  api.post(`/offers/${offerId}/withdraw`).then((r) => r.data.data);

export const getMyOffers = (params) =>
  api.get('/offers', { params }).then((r) => r.data.data);

// Orders.
export const createOrder = (offerId) =>
  api.post('/orders', { offerId }).then((r) => r.data.data);

export const getMyOrders = (params) =>
  api.get('/orders/me', { params }).then((r) => r.data.data);

export const getOrder = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data.data);

export const confirmOrder = (id, note) =>
  api.post(`/orders/${id}/confirm`, { note }).then((r) => r.data.data);

export const dispatchOrder = (id, note) =>
  api.post(`/orders/${id}/dispatch`, { note }).then((r) => r.data.data);

export const deliverOrder = (id, note) =>
  api.post(`/orders/${id}/deliver`, { note }).then((r) => r.data.data);

export const completeOrder = (id, note) =>
  api.post(`/orders/${id}/complete`, { note }).then((r) => r.data.data);

export const cancelOrder = (id, note) =>
  api.post(`/orders/${id}/cancel`, { note }).then((r) => r.data.data);

export const disputeOrder = (id, note) =>
  api.post(`/orders/${id}/dispute`, { note }).then((r) => r.data.data);

// Payments.
export const createPayment = (orderId) =>
  api.post(`/payments/create/${orderId}`).then((r) => r.data.data);

export const verifyPayment = (data) =>
  api.post('/payments/verify', data).then((r) => r.data.data);

// Notifications.
export const getNotifications = (params) =>
  api.get('/notifications/me', { params }).then((r) => r.data.data);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data.data);

export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all').then((r) => r.data.data);
