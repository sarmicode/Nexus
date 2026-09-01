/**
 * /listings routes (Phase 02) — public browse + farmer CRUD + image upload.
 *
 * Ownership checks live in middleware/ownership.js (after validate, so an
 * invalid :id never reaches Mongoose).
 */
const { Router } = require('express');
const { createLead } = require('../controllers/lead.controller');
const {
  createListing,
  listListings,
  searchListings,
  getListing,
  updateListing,
  deleteListing,
  addImages,
} = require('../controllers/listing.controller');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { requireListingOwner } = require('../middleware/ownership');
const { uploadListingImages } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createListingSchema,
  updateListingSchema,
  listListingsQuery,
  searchListingsQuery,
  idParams,
} = require('../validators/listing.validator');
const { createLeadSchema } = require('../validators/lead.validator');

const router = Router();

// Public (authenticateOptional so owners get isOwner + draft visibility).
router.get('/', authenticateOptional, validate({ query: listListingsQuery }), listListings);
// Buyer-facing search — declared before /:id so "search" isn't treated as an id.
router.get(
  '/search',
  authenticateOptional,
  validate({ query: searchListingsQuery }),
  searchListings
);
router.get('/:id', authenticateOptional, validate({ params: idParams }), getListing);

// Buyer-only: send an enquiry (RFQ) on a listing.
router.post(
  '/:id/leads',
  authenticate,
  requireRole('buyer'),
  validate({ params: idParams, body: createLeadSchema }),
  createLead
);

// Farmer-only.
router.post(
  '/',
  authenticate,
  requireRole('farmer'),
  validate({ body: createListingSchema }),
  createListing
);
router.patch(
  '/:id',
  authenticate,
  requireRole('farmer'),
  validate({ params: idParams, body: updateListingSchema }),
  requireListingOwner,
  updateListing
);
router.delete(
  '/:id',
  authenticate,
  requireRole('farmer'),
  validate({ params: idParams }),
  requireListingOwner,
  deleteListing
);
router.post(
  '/:id/images',
  authenticate,
  requireRole('farmer'),
  validate({ params: idParams }),
  requireListingOwner,
  uploadListingImages.array('images', 5),
  addImages
);

module.exports = router;
