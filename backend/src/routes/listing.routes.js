/**
 * /listings routes (Phase 02) — public browse + farmer CRUD + image upload.
 *
 * Ownership checks live in middleware/ownership.js (after validate, so an
 * invalid :id never reaches Mongoose).
 */
const { Router } = require('express');
const {
  createListing,
  listListings,
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
  idParams,
} = require('../validators/listing.validator');

const router = Router();

// Public (authenticateOptional so owners get isOwner + draft visibility).
router.get('/', authenticateOptional, validate({ query: listListingsQuery }), listListings);
router.get('/:id', authenticateOptional, validate({ params: idParams }), getListing);

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
