/**
 * PriceRecord model (Phase 04) — daily mandi price data from AGMARKNET/eNAM.
 * Indexed for fast lookup by market, crop, and date.
 */
const mongoose = require('mongoose');

const priceRecordSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['agmarknet', 'enam', 'seed'],
      required: true,
    },
    market: {
      mandiName: { type: String, required: true, trim: true, maxlength: 200 },
      district: { type: String, required: true, trim: true, maxlength: 100, index: true },
      state: { type: String, required: true, trim: true, maxlength: 100, index: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    crop: { type: String, required: true, trim: true, lowercase: true, index: true },
    variety: { type: String, trim: true },
    grade: { type: String, trim: true },
    minPrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    modalPrice: { type: Number, required: true, min: 0 },
    arrivals: {
      date: { type: Date },
      qtyTonnes: { type: Number, min: 0 },
    },
    recordedOn: { type: Date, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index for efficient queries.
priceRecordSchema.index(
  { 'market.state': 1, 'market.district': 1, crop: 1, recordedOn: -1 },
  { name: 'market_crop_date' }
);
priceRecordSchema.index(
  { 'market.mandiName': 1, crop: 1, recordedOn: -1 },
  { unique: true, name: 'mandi_crop_date_unique' }
);

module.exports = mongoose.model('PriceRecord', priceRecordSchema);
