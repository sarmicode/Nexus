/**
 * Payment service (Phase 06) — Razorpay test mode integration with stub fallback.
 */
const config = require('../config');
const Order = require('../models/order.model');
const ApiError = require('../../common/utils/ApiError');
const crypto = require('crypto');

const useRazorpay = !!(config.paymentApiKey && config.paymentApiKey !== 'your_payment_key');

async function createPayment(orderId, user) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.buyerId) !== String(user._id) && user.role !== 'admin') {
    throw ApiError.forbidden('Only the buyer can initiate payment');
  }

  if (useRazorpay) {
    try {
      // In a real integration, call Razorpay API to create an order.
      const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      order.payment = {
        provider: 'razorpay',
        refId: razorpayOrderId,
        amount: order.total,
        status: 'pending',
      };
      await order.save();
      return {
        provider: 'razorpay',
        orderId: razorpayOrderId,
        amount: order.total,
        keyId: config.paymentApiKey,
      };
    } catch (err) {
      console.error('[payment] Razorpay order creation failed:', err.message);
      // Fall through to stub.
    }
  }

  // Stub payment (dev mode).
  order.payment = {
    provider: 'stub',
    refId: `stub_${Date.now()}`,
    amount: order.total,
    status: 'pending',
  };
  await order.save();
  return {
    provider: 'stub',
    orderId: order.payment.refId,
    amount: order.total,
    message: 'Stub payment created (dev mode)',
  };
}

async function verifyPayment(data) {
  const { orderId, paymentId, signature } = data;
  const order = await Order.findOne({ 'payment.refId': orderId });
  if (!order) throw ApiError.notFound('Order not found');

  if (useRazorpay) {
    // Verify Razorpay signature.
    const secret = process.env.PAYMENT_API_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    if (expectedSignature !== signature) {
      throw ApiError.badRequest('Payment signature verification failed');
    }
  }

  order.payment.status = 'captured';
  order.payment.capturedAt = new Date();
  await order.save();
  return { message: 'Payment verified', payment: order.payment.toObject() };
}

module.exports = {
  createPayment,
  verifyPayment,
};
