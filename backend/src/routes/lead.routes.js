/**
 * /leads routes (Phase 03 — Buyer Module) — buyer enquiries and the farmer
 * status actions. The creation route lives on /listings/:id/leads (see
 * listing.routes.js); this file owns /leads/me (buyer's own) and
 * PATCH /leads/:id (farmer updates status).
 *
 * Anti-spam: a strict limiter throttles lead creation — applied here to the
 * buyer-facing subset as well as in listing.routes.js.
 */
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { listMyLeads, updateLeadStatus } = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateLeadSchema, listLeadsQuery, idParams } = require('../validators/lead.validator');
const { requireLeadOwner } = require('../middleware/ownership');

const router = Router();

// 10 lead-actions / 15 min per IP (anti-spam, SECURITY.md).
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many enquiry actions, please try again later.' },
  },
});

router.use(leadLimiter);

// Buyer: my own enquiries (Buyer Dashboard).
router.get(
  '/me',
  authenticate,
  requireRole('buyer'),
  validate({ query: listLeadsQuery }),
  listMyLeads
);

// Farmer/admin: move a lead's status (owner check in middleware/ownership).
router.patch(
  '/:id',
  authenticate,
  requireRole('farmer', 'admin'),
  validate({ params: idParams, body: updateLeadSchema }),
  requireLeadOwner,
  updateLeadStatus
);

module.exports = router;
