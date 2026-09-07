/**
 * Zod schemas for orders/offers (Phase 06).
 */
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const quantitySchema = z.object({
  value: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['quintal', 'kg', 'tonne']),
});

const createOfferSchema = z.object({
  quantity: quantitySchema,
  pricePerUnit: z.number().positive('Price must be greater than 0'),
  message: z.string().trim().max(500).optional().default(''),
  parentId: objectId.nullable().optional(),
});

const counterOfferSchema = z.object({
  quantity: quantitySchema.optional(),
  pricePerUnit: z.number().positive('Price must be greater than 0'),
  message: z.string().trim().max(500).optional().default(''),
});

const createOrderSchema = z.object({
  offerId: objectId,
});

const transitionSchema = z.object({
  note: z.string().trim().max(500).optional().default(''),
});

const paymentCreateSchema = z.object({
  orderId: objectId,
});

const paymentVerifySchema = z.object({
  orderId: z.string().trim().min(1),
  paymentId: z.string().trim().min(1),
  signature: z.string().trim().min(1),
});

const ordersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['farmer', 'buyer', 'all']).default('all'),
});

const offersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  side: z.enum(['sent', 'received', 'all']).default('all'),
});

const notificationsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const idParams = z.object({ id: objectId });

module.exports = {
  createOfferSchema,
  counterOfferSchema,
  createOrderSchema,
  transitionSchema,
  paymentCreateSchema,
  paymentVerifySchema,
  ordersQuery,
  offersQuery,
  notificationsQuery,
  idParams,
};
