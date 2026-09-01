/**
 * Ownership middleware (Phase 02) — loads a resource by :id and verifies the
 * authenticated user owns it (admins bypass). Attaches the loaded document to
 * req.listing / req.fpo so controllers/services reuse it without re-querying.
 *
 * Always used after `authenticate` (+ `requireRole`) and after `validate` for
 * the :id param, so an invalid id never reaches Mongoose.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const CropListing = require('../models/crop-listing.model');
const Fpo = require('../models/fpo.model');

const ownsOrAdmin = (ownerId, user) =>
  String(ownerId) === String(user._id) || user.role === 'admin';

const requireListingOwner = asyncHandler(async (req, res, next) => {
  const listing = await CropListing.findById(req.params.id);
  if (!listing || listing.deletedAt) throw ApiError.notFound('Listing not found');
  if (!ownsOrAdmin(listing.farmerId, req.user)) {
    throw ApiError.forbidden('You can only manage your own listings');
  }
  req.listing = listing;
  next();
});

const requireFpoOwner = asyncHandler(async (req, res, next) => {
  const fpo = await Fpo.findById(req.params.id);
  if (!fpo) throw ApiError.notFound('FPO not found');
  if (!ownsOrAdmin(fpo.createdBy, req.user)) {
    throw ApiError.forbidden('You can only manage your own FPOs');
  }
  req.fpo = fpo;
  next();
});

module.exports = { requireListingOwner, requireFpoOwner };
