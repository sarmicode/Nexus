/**
 * Order routes (Phase 06).
 */
const { Router } = require('express');
const {
  createOrder,
  confirmOrder,
  dispatchOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  disputeOrder,
  getMyOrders,
  getOrder,
  createPayment,
  verifyPayment,
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderSchema,
  transitionSchema,
  paymentVerifySchema,
  ordersQuery,
  notificationsQuery,
  idParams,
} = require('../validators/order.validator');

const router = Router();

// Orders.
router.post('/orders', authenticate, validate({ body: createOrderSchema }), createOrder);
router.get('/orders/me', authenticate, validate({ query: ordersQuery }), getMyOrders);
router.get('/orders/:id', authenticate, validate({ params: idParams }), getOrder);
router.post('/orders/:id/confirm', authenticate, validate({ params: idParams, body: transitionSchema }), confirmOrder);
router.post('/orders/:id/dispatch', authenticate, validate({ params: idParams, body: transitionSchema }), dispatchOrder);
router.post('/orders/:id/deliver', authenticate, validate({ params: idParams, body: transitionSchema }), deliverOrder);
router.post('/orders/:id/complete', authenticate, validate({ params: idParams, body: transitionSchema }), completeOrder);
router.post('/orders/:id/cancel', authenticate, validate({ params: idParams, body: transitionSchema }), cancelOrder);
router.post('/orders/:id/dispute', authenticate, validate({ params: idParams, body: transitionSchema }), disputeOrder);

// Payments.
router.post('/payments/create/:id', authenticate, validate({ params: idParams }), createPayment);
router.post('/payments/verify', authenticate, validate({ body: paymentVerifySchema }), verifyPayment);

// Notifications.
router.get('/notifications/me', authenticate, validate({ query: notificationsQuery }), getNotifications);
router.patch('/notifications/:id/read', authenticate, validate({ params: idParams }), markNotificationRead);
router.post('/notifications/read-all', authenticate, markAllRead);

module.exports = router;
