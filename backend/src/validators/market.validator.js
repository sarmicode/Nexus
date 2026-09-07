/**
 * Zod schemas for market routes (Phase 04).
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const latestPricesQuery = z.object({
  crop: z.string().trim().min(1, 'crop is required').max(60),
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
});

const trendsQuery = z.object({
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  range: z.enum(['7', '30', '90']).default('30'),
});

const compareQuery = z.object({
  crops: z.string().trim().min(1, 'crops is required'),
  district: z.string().trim().max(100).optional(),
});

const mandisQuery = z.object({
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  crop: z.string().trim().max(60).optional(),
});

const createPriceAlertSchema = z.object({
  crop: z.string().trim().min(1, 'crop is required').max(60),
  district: z.string().trim().max(100).optional(),
  belowPrice: z.number().min(0).optional(),
  abovePrice: z.number().min(0).optional(),
}).refine(
  (data) => data.belowPrice !== undefined || data.abovePrice !== undefined,
  { message: 'At least one of belowPrice or abovePrice is required' }
);

const resyncBody = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const cropParams = z.object({
  crop: z.string().trim().min(1).max(60),
});

const idParams = z.object({ id: objectId });

module.exports = {
  latestPricesQuery,
  trendsQuery,
  compareQuery,
  mandisQuery,
  createPriceAlertSchema,
  resyncBody,
  cropParams,
  idParams,
};
