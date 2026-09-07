/**
 * Order model (Phase 06) — confirmed transactions with lifecycle state machine.
 * State machine: created → confirmed → dispatched → delivered → completed
 *                ↘ cancelled (until dispatch)
 *                ↘ disputed (after dispatch)
 */
const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'CropListing', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
    quantity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, required: true, enum: ['quintal', 'kg', 'tonne'] },
    },
    pricePerUnit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['created', 'confirmed', 'dispatched', 'delivered', 'completed', 'cancelled', 'disputed'],
      default: 'created',
      index: true,
    },
    payment: {
      provider: { type: String, enum: ['razorpay', 'cod', 'stub'], default: 'stub' },
      refId: { type: String, trim: true },
      amount: { type: Number, min: 0 },
      status: { type: String, enum: ['pending', 'captured', 'failed', 'refunded', 'cod'], default: 'pending' },
      capturedAt: { type: Date },
    },
    deliveryAddress: {
      line1: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      pincode: { type: String, trim: true, maxlength: 10 },
    },
    timeline: { type: [timelineEntrySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
