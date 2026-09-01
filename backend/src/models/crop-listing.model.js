/**
 * CropListing model — a crop lot a farmer puts up for sale (Phase 02).
 *
 * Soft-delete: DELETE sets `deletedAt` instead of removing the row, so public
 * and owner queries filter `deletedAt: null`. `status` is the lifecycle state
 * (draft → active → sold/expired).
 */
const mongoose = require('mongoose');

const quantitySchema = new mongoose.Schema(
  {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['quintal', 'kg', 'tonne'] },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    village: { type: String, trim: true, maxlength: 100 },
    district: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    // [lat, lng] — optional.
    geo: { type: [Number], default: undefined },
  },
  { _id: false }
);

const cropListingSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fpoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fpo', default: undefined },
    crop: { type: String, required: true, trim: true, maxlength: 60 },
    variety: { type: String, trim: true, maxlength: 60 },
    grade: { type: String, required: true, enum: ['A', 'B', 'C'] },
    organic: { type: Boolean, default: false },
    quantity: { type: quantitySchema, required: true },
    priceType: { type: String, required: true, enum: ['fixed', 'negotiable'], default: 'fixed' },
    pricePerUnit: { type: Number, default: 0, min: 0 },
    mandiRef: { type: String, trim: true, maxlength: 100 },
    readinessDate: { type: Date },
    location: { type: locationSchema, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'expired'],
      default: 'active',
      index: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index every field we filter/sort by (RULES.md §6).
cropListingSchema.index({ crop: 1, status: 1, 'location.district': 1 });
cropListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CropListing', cropListingSchema);
