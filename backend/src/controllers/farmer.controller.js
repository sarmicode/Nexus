/**
 * Farmer controller — the farmer dashboard data (Phase 02).
 * Thin; aggregation lives in listing.service / fpo.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const listingService = require('../services/listing.service');
const fpoService = require('../services/fpo.service');

// GET /api/v1/farmer/me/listings
const myListings = asyncHandler(async (req, res) => {
  const data = await listingService.getMyListings(req.user, req.validated.query);
  res.status(200).json({ success: true, data });
});

// GET /api/v1/farmer/me/fpos
const myFpos = asyncHandler(async (req, res) => {
  const data = await fpoService.listMyFpos(req.user);
  res.status(200).json({ success: true, data });
});

module.exports = { myListings, myFpos };
