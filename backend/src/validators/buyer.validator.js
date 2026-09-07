/**
 * Zod schemas for buyer module routes (Phase 03).
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const addToWatchlistSchema = z.object({
  listingId: objectId,
  note: z.string().trim().max(200).optional().default(''),
});

const createSavedSearchSchema = z.object({
  name: z.string().trim().max(100).optional().default(''),
  query: z.object({
    crop: z.string().trim().max(60).optional(),
    district: z.string().trim().max(100).optional(),
    organic: z.boolean().optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    minQty: z.number().min(0).optional(),
  }),
  alertsEnabled: z.boolean().optional().default(true),
});

const createLeadSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(1000),
  quantityWanted: z
    .object({
      value: z.number().positive('Quantity must be greater than 0'),
      unit: z.enum(['quintal', 'kg', 'tonne']),
    })
    .optional(),
  priceOffered: z.number().min(0).optional(),
});

const updateLeadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'dropped']),
});

const searchListingsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  crop: z.string().trim().max(60).optional(),
  district: z.string().trim().max(100).optional(),
  organic: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : v),
    z.boolean().optional()
  ),
  status: z.enum(['draft', 'active', 'sold', 'expired']).optional(),
  minQty: z.coerce.number().min(0).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'quantityDesc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParams = z.object({ id: objectId });
const listingIdParams = z.object({ id: objectId });

module.exports = {
  addToWatchlistSchema,
  createSavedSearchSchema,
  createLeadSchema,
  updateLeadStatusSchema,
  searchListingsQuery,
  paginationQuery,
  idParams,
  listingIdParams,
};
