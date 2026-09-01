/**
 * /fpos routes (Phase 02) — public FPO listing + farmer create/update.
 * Verification is an admin action landing in Phase 07.
 */
const { Router } = require('express');
const { createFpo, listFpos, getFpo, updateFpo } = require('../controllers/fpo.controller');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { requireFpoOwner } = require('../middleware/ownership');
const validate = require('../middleware/validate');
const {
  createFpoSchema,
  updateFpoSchema,
  listFposQuery,
  idParams,
} = require('../validators/fpo.validator');

const router = Router();

router.get('/', authenticateOptional, validate({ query: listFposQuery }), listFpos);
router.get('/:id', authenticateOptional, validate({ params: idParams }), getFpo);

router.post(
  '/',
  authenticate,
  requireRole('farmer'),
  validate({ body: createFpoSchema }),
  createFpo
);
router.patch(
  '/:id',
  authenticate,
  requireRole('farmer'),
  validate({ params: idParams, body: updateFpoSchema }),
  requireFpoOwner,
  updateFpo
);

module.exports = router;
