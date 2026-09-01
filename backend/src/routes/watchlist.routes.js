/**
 * /watchlist routes (Phase 03 — Buyer Module).
 *
 * Authenticated user shortlists a listing. Uses the standard API envelope and
 * zod validation; duplicate + user-ownership handled in watchlist.service.
 */
const { Router } = require('express');
const {
  addToWatchlist,
  listWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlist.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  addWatchlistSchema,
  listingIdParams,
  listWatchlistQuery,
} = require('../validators/watchlist.validator');

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: addWatchlistSchema }), addToWatchlist);
router.get('/', validate({ query: listWatchlistQuery }), listWatchlist);
router.delete('/:listingId', validate({ params: listingIdParams }), removeFromWatchlist);

module.exports = router;
