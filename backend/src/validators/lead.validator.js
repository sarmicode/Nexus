/**
 * Zod schemas for the lead / RFQ routes (Phase 03 — Buyer Module).
 */
const { z } = require('zod');
const { QUANTITY_UNITS } = require('../../common/constants/crops');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const createLeadSchema = z.object({
  message: z
    .string({ required_error: 'message is required' })
    .trim()
    .min(1, 'message is required')
    .max(2000),
  quantityWanted: z.coerce.number().positive('quantityWanted must be greater than 0'),
  quantityUnit: z.enum(QUANTITY_UNITS, { message: 'Unit must be quintal, kg or tonne' }),
  priceOffered: z.coerce.number().min(0, 'priceOffered must be 0 or more').optional(),
});

const updateLeadSchema = z
  .object({
    status: z.enum(['new', 'contacted', 'converted', 'dropped'], {
      message: 'Invalid lead status',
    }),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

const listLeadsQuery = z.object({
  status: z
    .enum(['new', 'contacted', 'converted', 'dropped'], { message: 'Invalid lead status' })
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParams = z.object({ id: objectId });

module.exports = { createLeadSchema, updateLeadSchema, listLeadsQuery, idParams };
