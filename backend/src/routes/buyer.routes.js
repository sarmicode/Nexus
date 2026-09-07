/**
 * Buyer routes (Phase 03) — search, watchlist, saved searches, leads/RFQs.
 */
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
  searchListings,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
  createLead,
  getBuyerLeads,
} = require('../controllers/buyer.controller');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  addToWatchlistSchema,
  createSavedSearchSchema,
  createLeadSchema,
  searchListingsQuery,
  paginationQuery,
  listingIdParams,
  idParams,
} = require('../validators/buyer.validator');

const router = Router();

// Search — public with optional auth.
router.get('/search', authenticateOptional, validate({ query: searchListingsQuery }), searchListings);

// Watchlist — buyer only.
router.post(
  '/watchlist',
  authenticate,
  requireRole('buyer'),
  validate({ body: addToWatchlistSchema }),
  addToWatchlist
);
router.get(
  '/watchlist',
  authenticate,
  requireRole('buyer'),
  validate({ query: paginationQuery }),
  getWatchlist
);
router.delete(
  '/watchlist/:id',
  authenticate,
  requireRole('buyer'),
  validate({ params: idParams }),
  removeFromWatchlist
);

// Saved searches — buyer only.
router.post(
  '/saved-searches',
  authenticate,
  requireRole('buyer'),
  validate({ body: createSavedSearchSchema }),
  createSavedSearch
);
router.get(
  '/saved-searches',
  authenticate,
  requireRole('buyer'),
  validate({ query: paginationQuery }),
  getSavedSearches
);
router.delete(
  '/saved-searches/:id',
  authenticate,
  requireRole('buyer'),
  validate({ params: idParams }),
  deleteSavedSearch
);

// Leads / RFQs — buyer creates, buyer reads own.
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many enquiries, please slow down.' },
  },
});

router.post(
  '/listings/:id/leads',
  authenticate,
  requireRole('buyer'),
  leadLimiter,
  validate({ params: listingIdParams, body: createLeadSchema }),
  createLead
);
router.get(
  '/leads',
  authenticate,
  requireRole('buyer'),
  validate({ query: paginationQuery }),
  getBuyerLeads
);

module.exports = router;
