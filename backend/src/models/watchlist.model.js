/**
 * Watchlist model (Phase 03) — buyer bookmarks for crop listings.
 */
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
    note: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true }
);

watchlistSchema.index({ buyerId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
