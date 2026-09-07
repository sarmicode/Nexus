/**
 * Admin price resync route (Phase 04) — mounted under /api/v1/admin.
 */
const { Router } = require('express');
const { resyncPrices } = require('../controllers/market.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { resyncBody } = require('../validators/market.validator');

const router = Router();

router.post(
  '/prices/resync',
  authenticate,
  requireRole('admin'),
  validate({ body: resyncBody }),
  resyncPrices
);

module.exports = router;
