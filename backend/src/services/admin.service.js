/**
 * Admin service (Phase 07) — user management, disputes, quality checks, audit trail.
 */
const User = require('../models/user.model');
const Order = require('../models/order.model');
const CropListing = require('../models/crop-listing.model');
const Fpo = require('../models/fpo.model');
const ApiError = require('../../common/utils/ApiError');

// Simple in-memory audit log (production would use a dedicated model).
const auditLog = [];

function logAction(adminId, action, target, details) {
  auditLog.push({
    adminId: adminId.toString(),
    action,
    target,
    details,
    at: new Date(),
  });
  // Keep last 1000 entries.
  if (auditLog.length > 1000) auditLog.shift();
}

async function listUsers(query) {
  const { page = 1, limit = 20, role, status, search } = query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: docs.map((d) => d.toPublic()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async function updateUser(adminUser, userId, patch) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (patch.status !== undefined) user.status = patch.status;
  if (patch.role !== undefined && adminUser.role === 'admin') user.role = patch.role;

  await user.save();
  logAction(adminUser._id, 'update_user', userId, patch);
  return user.toPublic();
}

async function blockUser(adminUser, userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot block another admin');
  user.status = 'blocked';
  await user.save();
  logAction(adminUser._id, 'block_user', userId, {});
  return user.toPublic();
}

async function unblockUser(adminUser, userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  user.status = 'active';
  await user.save();
  logAction(adminUser._id, 'unblock_user', userId, {});
  return user.toPublic();
}

async function verifyFpo(adminUser, fpoId) {
  const fpo = await Fpo.findById(fpoId);
  if (!fpo) throw ApiError.notFound('FPO not found');
  fpo.verified = true;
  await fpo.save();
  logAction(adminUser._id, 'verify_fpo', fpoId, {});
  return fpo.toObject();
}

async function getDisputes(query) {
  const { page = 1, limit = 20 } = query;
  const filter = { status: 'disputed' };
  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'farmerId', select: 'name phone' })
      .populate({ path: 'buyerId', select: 'name phone' })
      .populate({ path: 'listingId', select: 'crop quantity' }),
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

async function resolveDispute(adminUser, orderId, data) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status !== 'disputed') {
    throw ApiError.conflict('Order is not in disputed state');
  }

  const resolution = data.resolution; // 'refund', 'cancel', 'complete'
  if (!['refund', 'cancel', 'complete'].includes(resolution)) {
    throw ApiError.badRequest('Resolution must be refund, cancel, or complete');
  }

  if (resolution === 'cancel' || resolution === 'refund') {
    order.status = 'cancelled';
    // Restore listing.
    const listing = await CropListing.findById(order.listingId);
    if (listing) {
      listing.status = 'active';
      await listing.save();
    }
    if (resolution === 'refund' && order.payment) {
      order.payment.status = 'refunded';
    }
  } else {
    order.status = 'completed';
  }

  order.timeline.push({
    status: order.status,
    note: `Admin resolved dispute: ${resolution}${data.note ? ` — ${data.note}` : ''}`,
  });
  await order.save();
  logAction(adminUser._id, 'resolve_dispute', orderId, { resolution, note: data.note });
  return order.toObject();
}

async function qualityCheck(adminUser, listingId, data) {
  const listing = await CropListing.findById(listingId);
  if (!listing || listing.deletedAt) throw ApiError.notFound('Listing not found');
  // Use a custom field for quality status (stored in the listing).
  listing.qualityChecked = data.passed;
  listing.qualityNote = data.note || '';
  await listing.save();
  logAction(adminUser._id, 'quality_check', listingId, data);
  return listing.toObject();
}

async function getAuditLog(query) {
  const { page = 1, limit = 50 } = query;
  const start = (page - 1) * limit;
  const items = auditLog.slice(start, start + limit).reverse();
  return { items, page, limit, total: auditLog.length };
}

module.exports = {
  listUsers,
  updateUser,
  blockUser,
  unblockUser,
  verifyFpo,
  getDisputes,
  resolveDispute,
  qualityCheck,
  getAuditLog,
  logAction,
};
