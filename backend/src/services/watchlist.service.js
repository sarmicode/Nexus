/**
 * Watchlist service (Phase 03 — Buyer Module).
 *
 * A user shortlists a crop listing. `listingId` is validated against a real,
 * non-deleted listing; a listing can only be watched once per user (unique
 * compound index in the model, guarded here for a friendly error).
 */
const Watchlist = require('../models/watchlist.model');
const CropListing = require('../models/crop-listing.model');
const ApiError = require('../../common/utils/ApiError');

const POPULATE_LISTING = {
  path: 'listingId',
  populate: [
    { path: 'farmerId', select: 'name location' },
    { path: 'fpoId', select: 'name verified' },
  ],
};

function shapeEntry(entry) {
  const listing = entry.listingId;
  const farmer = listing && listing.farmerId;
  return {
    _id: entry._id.toString(),
    note: entry.note || null,
    listing: listing
      ? {
          _id: listing._id.toString(),
          crop: listing.crop,
          variety: listing.variety,
          grade: listing.grade,
          organic: listing.organic,
          quantity: listing.quantity,
          priceType: listing.priceType,
          pricePerUnit: listing.pricePerUnit,
          images: listing.images,
          status: listing.status,
          location: listing.location,
          farmer: farmer
            ? {
                _id: farmer._id.toString(),
                name: farmer.name,
                district: farmer.location && farmer.location.district,
                state: farmer.location && farmer.location.state,
              }
            : null,
        }
      : null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/** POST /watchlist */
async function addToWatchlist(user, { listingId, note }) {
  const listing = await CropListing.findOne({ _id: listingId, deletedAt: null });
  if (!listing) throw ApiError.notFound('Listing not found');
  const existing = await Watchlist.findOne({ buyerId: user._id, listingId });
  if (existing) throw ApiError.conflict('Listing is already in your watchlist');
  const entry = await Watchlist.create({ buyerId: user._id, listingId, note: note || undefined });
  await entry.populate(POPULATE_LISTING);
  return shapeEntry(entry);
}

/** GET /watchlist (paginated). */
async function listWatchlist(user, query) {
  const { page, limit } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    Watchlist.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_LISTING),
    Watchlist.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => shapeEntry(doc)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** DELETE /watchlist/:listingId */
async function removeFromWatchlist(user, listingId) {
  const result = await Watchlist.findOneAndDelete({ buyerId: user._id, listingId });
  if (!result) throw ApiError.notFound('Listing is not in your watchlist');
  return { message: 'Removed from watchlist' };
}

module.exports = { addToWatchlist, listWatchlist, removeFromWatchlist };
