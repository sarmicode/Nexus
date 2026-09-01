/**
 * /farmer routes (Phase 02) — the authenticated farmer's own data
 * (dashboard listings + stats, and their FPOs for the listing form).
 */
const { Router } = require('express');
const { myListings, myFpos } = require('../controllers/farmer.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { myListingsQuery } = require('../validators/listing.validator');

const router = Router();

router.use(authenticate, requireRole('farmer'));

router.get('/me/listings', validate({ query: myListingsQuery }), myListings);
router.get('/me/fpos', myFpos);

module.exports = router;
