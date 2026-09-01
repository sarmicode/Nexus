/**
 * Zod schemas for the /watchlist routes (Phase 03 — Buyer Module).
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const addWatchlistSchema = z.object({
  listingId: objectId,
  note: z.string().trim().max(500).optional(),
});

const listingIdParams = z.object({ listingId: objectId });

const listWatchlistQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { addWatchlistSchema, listingIdParams, listWatchlistQuery };
