/**
 * Notification service (Phase 06) — in-app + socket.io + email/SMS stubs.
 */
const Notification = require('../models/notification.model');

// Socket.io instance (set via setIO after server starts).
let io = null;

function setIO(socketIO) {
  io = socketIO;
}

async function createNotification(data) {
  try {
    const notification = await Notification.create(data);
    // Real-time socket push (if connected).
    if (io) {
      io.to(`user:${data.userId}`).emit('notification', notification.toObject());
    }
    // Dev-mode console log (replaces email/SMS in dev).
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[notify] ${data.type} → user:${data.userId}: ${data.title}`);
    }
    return notification.toObject();
  } catch (err) {
    console.error('[notify] failed to create notification:', err.message);
    return null;
  }
}

async function getNotifications(user, query = {}) {
  const { page = 1, limit = 50 } = query;
  const filter = { userId: user._id };
  const [docs, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);
  return {
    items: docs.map((d) => d.toObject()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    unreadCount: await Notification.countDocuments({ userId: user._id, read: false }),
  };
}

async function markRead(notificationId, user) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId: user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    const { notFound } = require('../../common/utils/ApiError');
    throw notFound('Notification not found');
  }
  return notification.toObject();
}

async function markAllRead(user) {
  await Notification.updateMany({ userId: user._id, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
}

module.exports = {
  setIO,
  createNotification,
  getNotifications,
  markRead,
  markAllRead,
};
