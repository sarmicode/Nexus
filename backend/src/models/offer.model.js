/**
 * Offer model (Phase 06) — buyer/farmer price negotiation on a listing.
 */
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'CropListing', required: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, required: true, enum: ['quintal', 'kg', 'tonne'] },
    },
    pricePerUnit: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    side: { type: String, enum: ['buyer', 'farmer'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'countered', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
  },
  { timestamps: true }
);

offerSchema.index({ buyerId: 1, createdAt: -1 });
offerSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
