/**
 * Lead model (Phase 03) — buyer enquiries / RFQs for crop listings.
 * Lifecycle: new → contacted → converted | dropped.
 */
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    quantityWanted: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['quintal', 'kg', 'tonne'] },
    },
    priceOffered: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'dropped'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

leadSchema.index({ buyerId: 1, listingId: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
