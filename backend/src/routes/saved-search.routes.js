/**
 * /saved-searches routes (Phase 03 — Buyer Module).
 *
 * Authenticated user saves a catalog search for re-running later (and for
 * Phase 4 price alerts). Owner-only delete is enforced in the service.
 */
const { Router } = require('express');
const {
  createSavedSearch,
  listSavedSearches,
  deleteSavedSearch,
} = require('../controllers/saved-search.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createSavedSearchSchema,
  idParams,
  listSavedSearchesQuery,
} = require('../validators/saved-search.validator');

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createSavedSearchSchema }), createSavedSearch);
router.get('/', validate({ query: listSavedSearchesQuery }), listSavedSearches);
router.delete('/:id', validate({ params: idParams }), deleteSavedSearch);

module.exports = router;
