/**
 * Lead model (Phase 03 — Buyer Module) — a buy-intent / Request For Quotation.
 *
 * A buyer expresses interest in a listing: how much they want, an optional
 * offered price, and a message. The farmer sees it in their inbox and moves it
 * through `status`. Duplicate leads (same buyer + listing within 24 h) are
 * blocked at the service layer; `status` transitions are farmer-driven.
 */
const mongoose = require('mongoose');

const LEAD_STATUSES = ['new', 'contacted', 'converted', 'dropped'];

const leadSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    quantityWanted: { type: Number, required: true, min: 0 },
    quantityUnit: { type: String, required: true, enum: ['quintal', 'kg', 'tonne'] },
    priceOffered: { type: Number, min: 0, default: undefined },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

// Fast "duplicate lead" + farmer-inbox lookups.
leadSchema.index({ listingId: 1, buyerId: 1, createdAt: -1 });
leadSchema.index({ buyerId: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
