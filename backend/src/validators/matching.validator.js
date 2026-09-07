/**
 * Zod schemas for matching routes (Phase 05).
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const createDemandSchema = z.object({
  cropsWanted: z.array(z.string().trim().min(1).max(60)).min(1, 'At least one crop is required'),
  quantityNeeded: z
    .object({
      value: z.number().positive(),
      unit: z.enum(['quintal', 'kg', 'tonne']),
    })
    .optional(),
  districts: z.array(z.string().trim().max(100)).optional(),
  maxDistanceKm: z.number().min(0).optional(),
  budgetPerUnit: z.number().min(0).optional(),
  buyerType: z.enum(['consumer', 'wholesaler', 'processor', 'exporter']).optional(),
});

const updateDemandSchema = z
  .object({
    cropsWanted: z.array(z.string().trim().min(1).max(60)).optional(),
    quantityNeeded: z
      .object({
        value: z.number().positive(),
        unit: z.enum(['quintal', 'kg', 'tonne']),
      })
      .optional(),
    districts: z.array(z.string().trim().max(100)).optional(),
    maxDistanceKm: z.number().min(0).optional(),
    budgetPerUnit: z.number().min(0).optional(),
    buyerType: z.enum(['consumer', 'wholesaler', 'processor', 'exporter']).optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'Provide at least one field to update',
  });

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParams = z.object({ id: objectId });

module.exports = {
  createDemandSchema,
  updateDemandSchema,
  paginationQuery,
  idParams,
};
