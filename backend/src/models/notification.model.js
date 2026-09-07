/**
 * Notification model (Phase 06) — in-app inbox for events.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'offer_received',
        'offer_accepted',
        'offer_countered',
        'offer_rejected',
        'order_created',
        'order_confirmed',
        'order_dispatched',
        'order_delivered',
        'order_completed',
        'order_cancelled',
        'order_disputed',
        'price_alert',
        'lead_received',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, maxlength: 1000, default: '' },
    refType: { type: String, trim: true },
    refId: { type: mongoose.Schema.Types.ObjectId },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
