/**
 * Listing controller — thin request handling; logic lives in listing.service.
 * Owner-only routes run after middleware/ownership.js attaches `req.listing`.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const listingService = require('../services/listing.service');

// POST /api/v1/listings
const createListing = asyncHandler(async (req, res) => {
  const data = await listingService.createListing(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

// GET /api/v1/listings
const listListings = asyncHandler(async (req, res) => {
  const data = await listingService.listListings(req.validated.query, req.user);
  res.status(200).json({ success: true, data });
});

// GET /api/v1/listings/:id
const getListing = asyncHandler(async (req, res) => {
  const data = await listingService.getListing(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

// PATCH /api/v1/listings/:id
const updateListing = asyncHandler(async (req, res) => {
  const data = await listingService.updateListing(req.listing, req.validated.body);
  res.status(200).json({ success: true, data });
});

// DELETE /api/v1/listings/:id (soft-delete)
const deleteListing = asyncHandler(async (req, res) => {
  await listingService.softDelete(req.listing);
  res.status(200).json({ success: true, data: { message: 'Listing deleted' } });
});

// POST /api/v1/listings/:id/images
const addImages = asyncHandler(async (req, res) => {
  const urls = (req.files || []).map((file) => `/uploads/listings/${file.filename}`);
  const data = await listingService.addImages(req.listing, urls);
  res.status(200).json({ success: true, data });
});

module.exports = {
  createListing,
  listListings,
  getListing,
  updateListing,
  deleteListing,
  addImages,
};
