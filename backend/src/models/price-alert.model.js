/**
 * PriceAlert model (Phase 04) — user-defined price thresholds.
 * Notifications sent in Phase 06 when thresholds are hit.
 */
const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    crop: { type: String, required: true, trim: true, lowercase: true },
    district: { type: String, trim: true },
    belowPrice: { type: Number, min: 0 },
    abovePrice: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date },
    pendingAlerts: { type: [Date], default: [] },
  },
  { timestamps: true }
);

priceAlertSchema.index({ crop: 1, active: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
