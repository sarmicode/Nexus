/**
 * Matching routes (Phase 05).
 */
const { Router } = require('express');
const {
  createDemand,
  getDemands,
  updateDemand,
  getMatchesForListing,
  getMatchesForDemand,
  getFeed,
} = require('../controllers/matching.controller');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  createDemandSchema,
  updateDemandSchema,
  paginationQuery,
  idParams,
} = require('../validators/matching.validator');

const router = Router();

// Demand CRUD (buyer only).
router.post(
  '/demand',
  authenticate,
  requireRole('buyer'),
  validate({ body: createDemandSchema }),
  createDemand
);
router.get(
  '/demand',
  authenticate,
  requireRole('buyer'),
  validate({ query: paginationQuery }),
  getDemands
);
router.patch(
  '/demand/:id',
  authenticate,
  requireRole('buyer'),
  validate({ params: idParams, body: updateDemandSchema }),
  updateDemand
);

// Match endpoints.
router.get('/matches/listing/:id', authenticateOptional, validate({ params: idParams }), getMatchesForListing);
router.get('/matches/demand/:id', authenticateOptional, validate({ params: idParams }), getMatchesForDemand);
router.get('/matches/feed', authenticate, requireRole('buyer'), getFeed);

module.exports = router;
