/**
 * Order service (Phase 06) — order lifecycle with state machine + quantity ledger.
 */
const Order = require('../models/order.model');
const Offer = require('../models/offer.model');
const CropListing = require('../models/crop-listing.model');
const notify = require('./notify.service');
const ApiError = require('../../common/utils/ApiError');

// State machine: allowed transitions.
const TRANSITIONS = {
  created: ['confirmed', 'cancelled'],
  confirmed: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: [],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

function normalizeQtyKg(qty) {
  if (!qty) return 0;
  if (qty.unit === 'kg') return qty.value;
  if (qty.unit === 'quintal') return qty.value * 100;
  if (qty.unit === 'tonne') return qty.value * 1000;
  return qty.value;
}

// Create an order from an accepted offer.
async function createOrderFromOffer(user, offerId) {
  const offer = await Offer.findById(offerId).populate('listingId');
  if (!offer) throw ApiError.notFound('Offer not found');
  if (offer.status !== 'accepted') {
    throw ApiError.conflict('Only accepted offers can become orders');
  }

  const listing = offer.listingId;
  const isParticipant =
    String(offer.farmerId) === String(user._id) ||
    String(offer.buyerId) === String(user._id);
  if (!isParticipant) throw ApiError.forbidden('You are not a participant');

  // Check for existing order from this offer.
  const existing = await Order.findOne({ offerId: offer._id });
  if (existing) throw ApiError.conflict('An order already exists for this offer');

  // Overselling guard: ensure listing is still active.
  if (listing.status !== 'active') {
    throw ApiError.conflict('Listing is no longer available');
  }

  const total = offer.pricePerUnit * offer.quantity.value;

  const order = await Order.create({
    listingId: listing._id,
    farmerId: offer.farmerId,
    buyerId: offer.buyerId,
    offerId: offer._id,
    quantity: offer.quantity,
    pricePerUnit: offer.pricePerUnit,
    total,
    status: 'created',
    payment: { provider: 'stub', status: 'pending' },
    timeline: [{ status: 'created', note: 'Order created from accepted offer' }],
  });

  // Mark listing sold to prevent overselling.
  listing.status = 'sold';
  await listing.save();

  await Promise.all([
    notify.createNotification({
      userId: offer.farmerId,
      type: 'order_created',
      title: 'New order created',
      body: `Order #${order._id.toString().slice(-6)} for your ${listing.crop} listing`,
      refType: 'order',
      refId: order._id,
    }),
    notify.createNotification({
      userId: offer.buyerId,
      type: 'order_created',
      title: 'Order confirmed',
      body: `Your order #${order._id.toString().slice(-6)} has been created`,
      refType: 'order',
      refId: order._id,
    }),
  ]);

  await order.populate([
    { path: 'listingId', select: 'crop quantity location' },
    { path: 'farmerId', select: 'name phone' },
    { path: 'buyerId', select: 'name phone' },
  ]);

  return order.toObject();
}

// Generic status transition.
async function transitionOrder(orderId, newStatus, user, note = '') {
  const order = await Order.findById(orderId).populate('listingId');
  if (!order) throw ApiError.notFound('Order not found');

  if (!canTransition(order.status, newStatus)) {
    throw ApiError.conflict(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  // Role checks for specific transitions.
  if (newStatus === 'confirmed' && String(order.farmerId) !== String(user._id) && user.role !== 'admin') {
    throw ApiError.forbidden('Only the farmer can confirm the order');
  }
  if (newStatus === 'dispatched' && String(order.farmerId) !== String(user._id) && user.role !== 'admin') {
    throw ApiError.forbidden('Only the farmer can dispatch the order');
  }
  if (newStatus === 'delivered' && String(order.buyerId) !== String(user._id) && user.role !== 'admin') {
    throw ApiError.forbidden('Only the buyer can confirm delivery');
  }
  if (newStatus === 'cancelled') {
    const isParticipant =
      String(order.farmerId) === String(user._id) ||
      String(order.buyerId) === String(user._id);
    if (!isParticipant && user.role !== 'admin') {
      throw ApiError.forbidden('Only participants can cancel');
    }
  }

  order.status = newStatus;
  order.timeline.push({ status: newStatus, note });
  await order.save();

  // Cancel restores listing quantity.
  if (newStatus === 'cancelled' && order.listingId) {
    order.listingId.status = 'active';
    await order.listingId.save();
  }

  const notifyType = `order_${newStatus}`;
  const counterpartyIds = [order.farmerId, order.buyerId].filter(
    (id) => String(id) !== String(user._id)
  );
  for (const uid of counterpartyIds) {
    await notify.createNotification({
      userId: uid,
      type: notifyType,
      title: `Order ${newStatus}`,
      body: `Order #${order._id.toString().slice(-6)} is now ${newStatus}`,
      refType: 'order',
      refId: order._id,
    });
  }

  return order.toObject();
}

async function confirmOrder(orderId, user, note) {
  return transitionOrder(orderId, 'confirmed', user, note);
}
async function dispatchOrder(orderId, user, note) {
  return transitionOrder(orderId, 'dispatched', user, note);
}
async function deliverOrder(orderId, user, note) {
  return transitionOrder(orderId, 'delivered', user, note);
}
async function completeOrder(orderId, user, note) {
  return transitionOrder(orderId, 'completed', user, note);
}
async function cancelOrder(orderId, user, note) {
  return transitionOrder(orderId, 'cancelled', user, note);
}
async function disputeOrder(orderId, user, note) {
  return transitionOrder(orderId, 'disputed', user, note);
}

async function getMyOrders(user, query) {
  const { page = 1, limit = 20, role } = query;
  const filter = {};
  if (role === 'farmer') {
    filter.farmerId = user._id;
  } else if (role === 'buyer') {
    filter.buyerId = user._id;
  } else {
    filter.$or = [{ farmerId: user._id }, { buyerId: user._id }];
  }

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'listingId', select: 'crop quantity location images' })
      .populate({ path: 'farmerId', select: 'name phone' })
      .populate({ path: 'buyerId', select: 'name phone' }),
    Order.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => d.toObject()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async function getOrder(orderId, user) {
  const order = await Order.findById(orderId)
    .populate({ path: 'listingId', select: 'crop quantity location images pricePerUnit' })
    .populate({ path: 'farmerId', select: 'name phone location' })
    .populate({ path: 'buyerId', select: 'name phone location' });
  if (!order) throw ApiError.notFound('Order not found');
  const isParticipant =
    String(order.farmerId._id) === String(user._id) ||
    String(order.buyerId._id) === String(user._id);
  if (!isParticipant && user.role !== 'admin') {
    throw ApiError.forbidden('You cannot view this order');
  }
  return order.toObject();
}

module.exports = {
  createOrderFromOffer,
  confirmOrder,
  dispatchOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  disputeOrder,
  getMyOrders,
  getOrder,
  TRANSITIONS,
};
