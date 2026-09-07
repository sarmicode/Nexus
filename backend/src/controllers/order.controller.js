/**
 * Order controller (Phase 06).
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const orderService = require('../services/order.service');
const paymentService = require('../services/payment.service');
const notifyService = require('../services/notify.service');

const createOrder = asyncHandler(async (req, res) => {
  const data = await orderService.createOrderFromOffer(req.user, req.validated.body.offerId);
  res.status(201).json({ success: true, data });
});

const confirmOrder = asyncHandler(async (req, res) => {
  const data = await orderService.confirmOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const dispatchOrder = asyncHandler(async (req, res) => {
  const data = await orderService.dispatchOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const deliverOrder = asyncHandler(async (req, res) => {
  const data = await orderService.deliverOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const completeOrder = asyncHandler(async (req, res) => {
  const data = await orderService.completeOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const data = await orderService.cancelOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const disputeOrder = asyncHandler(async (req, res) => {
  const data = await orderService.disputeOrder(req.params.id, req.user, req.validated.body.note);
  res.json({ success: true, data });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getMyOrders(req.user, req.validated.query);
  res.json({ success: true, data });
});

const getOrder = asyncHandler(async (req, res) => {
  const data = await orderService.getOrder(req.params.id, req.user);
  res.json({ success: true, data });
});

const createPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.createPayment(req.params.id, req.user);
  res.status(201).json({ success: true, data });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.verifyPayment(req.validated.body);
  res.json({ success: true, data });
});

const getNotifications = asyncHandler(async (req, res) => {
  const data = await notifyService.getNotifications(req.user, req.validated.query);
  res.json({ success: true, data });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const data = await notifyService.markRead(req.params.id, req.user);
  res.json({ success: true, data });
});

const markAllRead = asyncHandler(async (req, res) => {
  const data = await notifyService.markAllRead(req.user);
  res.json({ success: true, data });
});

module.exports = {
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
};
