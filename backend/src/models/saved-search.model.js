/**
 * SavedSearch model (Phase 03) — persisted buyer filter queries.
 * Used by Phase 04 price alerts to notify when matching lots appear.
 */
const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, trim: true, maxlength: 100, default: '' },
    query: {
      crop: { type: String, trim: true },
      district: { type: String, trim: true },
      organic: { type: Boolean },
      priceMin: { type: Number },
      priceMax: { type: Number },
      minQty: { type: Number },
    },
    alertsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

savedSearchSchema.index({ buyerId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
