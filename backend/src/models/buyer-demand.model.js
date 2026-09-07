/**
 * BuyerDemand model (Phase 05) — buyer intent profile for matching.
 */
const mongoose = require('mongoose');

const buyerDemandSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropsWanted: { type: [String], required: true },
    quantityNeeded: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['quintal', 'kg', 'tonne'] },
    },
    districts: { type: [String], default: [] },
    maxDistanceKm: { type: Number, min: 0 },
    budgetPerUnit: { type: Number, min: 0 },
    buyerType: {
      type: String,
      enum: ['consumer', 'wholesaler', 'processor', 'exporter'],
      default: 'consumer',
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

buyerDemandSchema.index({ buyerId: 1, active: 1 });
buyerDemandSchema.index({ cropsWanted: 1 });

module.exports = mongoose.model('BuyerDemand', buyerDemandSchema);
