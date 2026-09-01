/**
 * Zod schemas for the /saved-searches routes (Phase 03 — Buyer Module).
 *
 * `query` is a loose record mirroring GET /listings/search params so the
 * search can be recreated exactly from the stored URL query string.
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

// Primitive values a search param can hold (string / number / boolean).
const primitive = z.union([z.string(), z.number(), z.boolean()]);

const createSavedSearchSchema = z.object({
  query: z
    .record(z.string().max(60), primitive)
    .refine((record) => Object.keys(record).length > 0, {
      message: 'query must have at least one field',
    }),
  alertsEnabled: z
    .boolean({ invalid_type_error: 'alertsEnabled must be true or false' })
    .optional(),
});

const idParams = z.object({ id: objectId });

const listSavedSearchesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { createSavedSearchSchema, idParams, listSavedSearchesQuery };
