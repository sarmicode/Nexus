/**
 * Watchlist model (Phase 03 — Buyer Module).
 *
 * A buyer (or farmer) shortlists a crop listing to revisit. A user can only
 * watch a given listing once (unique compound index), enforced by the service.
 */
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One watchlist entry per user+listing.
watchlistSchema.index({ buyerId: 1, listingId: 1 }, { unique: true });
watchlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
