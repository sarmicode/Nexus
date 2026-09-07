/**
 * Admin & analytics routes (Phase 07).
 */
const { Router } = require('express');
const { z } = require('zod');
const {
  getFarmerAnalytics,
  getBuyerAnalytics,
  getAdminOverview,
  listUsers,
  updateUser,
  blockUser,
  unblockUser,
  verifyFpo,
  getDisputes,
  resolveDispute,
  qualityCheck,
  getAuditLog,
  estimateLogistics,
  optimizeRoute,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');
const idParams = z.object({ id: objectId });

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const usersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['farmer', 'buyer', 'admin']).optional(),
  status: z.enum(['active', 'blocked']).optional(),
  search: z.string().trim().max(100).optional(),
});

const updateUserSchema = z.object({
  status: z.enum(['active', 'blocked']).optional(),
  role: z.enum(['farmer', 'buyer', 'admin']).optional(),
});

const resolveDisputeSchema = z.object({
  resolution: z.enum(['refund', 'cancel', 'complete']),
  note: z.string().trim().max(500).optional().default(''),
});

const qualityCheckSchema = z.object({
  passed: z.boolean(),
  note: z.string().trim().max(500).optional().default(''),
});

const optimizeRouteSchema = z.object({
  stops: z
    .array(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
    )
    .min(2),
});

const auditQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const router = Router();

// Analytics.
router.get('/analytics/farmer', authenticate, requireRole('farmer'), getFarmerAnalytics);
router.get('/analytics/buyer', authenticate, requireRole('buyer'), getBuyerAnalytics);
router.get('/analytics/admin/overview', authenticate, requireRole('admin'), getAdminOverview);

// Admin user management.
router.get('/admin/users', authenticate, requireRole('admin'), validate({ query: usersQuery }), listUsers);
router.patch('/admin/users/:id', authenticate, requireRole('admin'), validate({ params: idParams, body: updateUserSchema }), updateUser);
router.post('/admin/users/:id/block', authenticate, requireRole('admin'), validate({ params: idParams }), blockUser);
router.post('/admin/users/:id/unblock', authenticate, requireRole('admin'), validate({ params: idParams }), unblockUser);
router.post('/admin/fpos/:id/verify', authenticate, requireRole('admin'), validate({ params: idParams }), verifyFpo);

// Disputes.
router.get('/admin/disputes', authenticate, requireRole('admin'), validate({ query: paginationQuery }), getDisputes);
router.patch('/admin/disputes/:id/resolve', authenticate, requireRole('admin'), validate({ params: idParams, body: resolveDisputeSchema }), resolveDispute);

// Quality checks.
router.post('/admin/quality/:id', authenticate, requireRole('admin'), validate({ params: idParams, body: qualityCheckSchema }), qualityCheck);

// Audit log.
router.get('/admin/audit', authenticate, requireRole('admin'), validate({ query: auditQuery }), getAuditLog);

// Logistics.
router.get('/logistics/estimate', authenticate, estimateLogistics);
router.post('/logistics/optimize', authenticate, validate({ body: optimizeRouteSchema }), optimizeRoute);

module.exports = router;
