/**
 * Fpo model — a Farmer Producer Organisation (Phase 02).
 *
 * An FPO is created by a farmer (`createdBy`) and becomes the optional owner of
 * crop listings (`CropListing.fpoId`). Verification is an admin action that
 * lands in Phase 07 — until then every FPO has `verified: false`.
 */
const mongoose = require('mongoose');

const fpoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    registrationNo: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    district: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    memberCount: { type: Number, default: 0, min: 0 },
    contactPhone: { type: String, trim: true, maxlength: 15 },
    verified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Filter + list views.
fpoSchema.index({ district: 1 });
fpoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Fpo', fpoSchema);
