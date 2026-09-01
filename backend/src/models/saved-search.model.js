/**
 * SavedSearch model (Phase 03 — Buyer Module).
 *
 * A user stores the query params they used on the Catalog/search page so they
 * can re-run the exact search later. `alertsEnabled` is consumed by Phase 4
 * (price alerts) — it is stored now, used then.
 */
const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // The same shape as GET /listings/search query params (crop, district, …),
    // stored so the URL can be rebuilt. Loose record of strings/numbers/booleans.
    query: { type: mongoose.Schema.Types.Mixed, required: true },
    alertsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

savedSearchSchema.index({ buyerId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
