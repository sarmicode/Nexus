/**
 * Zod schemas for the /listings routes (Phase 02).
 */
const { z } = require('zod');
const {
  QUANTITY_UNITS,
  GRADES,
  PRICE_TYPES,
  LISTING_STATUSES,
} = require('../../common/constants/crops');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

// Empty string → undefined (browsers send '' for empty optional inputs).
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const quantitySchema = z.object({
  value: z
    .number({ invalid_type_error: 'Quantity value must be a number' })
    .positive('Quantity must be greater than 0'),
  unit: z.enum(QUANTITY_UNITS, { message: 'Unit must be quintal, kg or tonne' }),
});

const locationSchema = z.object({
  village: z.string().trim().max(100).optional(),
  district: z.string().trim().min(2, 'District name is too short').max(100),
  state: z.string().trim().min(2, 'State name is too short').max(100),
  geo: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]).optional(),
});

const dateField = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'readinessDate must be a YYYY-MM-DD date')
    .optional()
);

const priceField = z
  .number({ invalid_type_error: 'pricePerUnit must be a number' })
  .min(0, 'Price must be 0 or more');

const createListingSchema = z
  .object({
    crop: z
      .string({ required_error: 'Crop is required' })
      .trim()
      .min(1, 'Crop is required')
      .max(60),
    variety: z.string().trim().max(60).optional(),
    grade: z.enum(GRADES, { message: 'Grade must be A, B or C' }),
    organic: z.boolean({ invalid_type_error: 'organic must be true or false' }).optional(),
    quantity: quantitySchema,
    priceType: z.enum(PRICE_TYPES, { message: 'priceType must be fixed or negotiable' }).optional(),
    pricePerUnit: priceField.optional(),
    mandiRef: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
    readinessDate: dateField,
    location: locationSchema,
    fpoId: objectId.optional(),
    status: z.enum(LISTING_STATUSES, { message: 'Invalid listing status' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.priceType === 'fixed' && (data.pricePerUnit === undefined || data.pricePerUnit <= 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['pricePerUnit'],
        message: 'pricePerUnit is required (and greater than 0) when priceType is fixed',
      });
    }
  });

const updateListingSchema = z
  .object({
    crop: z.string().trim().min(1, 'Crop is required').max(60).optional(),
    variety: z.string().trim().max(60).nullable().optional(),
    grade: z.enum(GRADES, { message: 'Grade must be A, B or C' }).optional(),
    organic: z.boolean({ invalid_type_error: 'organic must be true or false' }).optional(),
    quantity: quantitySchema.optional(),
    priceType: z.enum(PRICE_TYPES, { message: 'priceType must be fixed or negotiable' }).optional(),
    pricePerUnit: priceField.optional(),
    mandiRef: z.preprocess(emptyToUndefined, z.string().trim().max(100).nullable().optional()),
    readinessDate: dateField.nullable(),
    location: locationSchema
      .partial()
      .refine((loc) => Object.keys(loc).length > 0, {
        message: 'location must have at least one field',
      })
      .optional(),
    fpoId: objectId.nullable().optional(),
    status: z.enum(LISTING_STATUSES, { message: 'Invalid listing status' }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

const listListingsQuery = z.object({
  crop: z.string().trim().max(60).optional(),
  district: z.string().trim().max(100).optional(),
  organic: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : v),
    z.boolean().optional()
  ),
  status: z.enum(LISTING_STATUSES, { message: 'Invalid listing status' }).optional(),
  minQty: z.coerce.number().min(0, 'minQty must be 0 or more').optional(),
  priceMin: z.coerce.number().min(0, 'priceMin must be 0 or more').optional(),
  priceMax: z.coerce.number().min(0, 'priceMax must be 0 or more').optional(),
  sort: z
    .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'qtyAsc', 'qtyDesc'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Phase 03 (Buyer Module) search: `q` — full-text-ish across crop/variety/district.
const searchListingsQuery = listListingsQuery.extend({
  q: z.string().trim().max(120).optional(),
});

const myListingsQuery = z.object({
  status: z.enum(LISTING_STATUSES, { message: 'Invalid listing status' }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const idParams = z.object({ id: objectId });

module.exports = {
  createListingSchema,
  updateListingSchema,
  listListingsQuery,
  searchListingsQuery,
  myListingsQuery,
  idParams,
};
