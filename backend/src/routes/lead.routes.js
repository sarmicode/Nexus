/**
 * Lead routes (Phase 03) — farmer-side lead inbox and status updates.
 */
const { Router } = require('express');
const { z } = require('zod');
const { getFarmerLeads, updateLeadStatus } = require('../controllers/buyer.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateLeadStatusSchema, idParams } = require('../validators/buyer.validator');

const farmerLeadsQuery = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'dropped']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('farmer'),
  validate({ query: farmerLeadsQuery }),
  getFarmerLeads
);

router.patch(
  '/:id',
  authenticate,
  requireRole('farmer', 'admin'),
  validate({ params: idParams, body: updateLeadStatusSchema }),
  updateLeadStatus
);

module.exports = router;
