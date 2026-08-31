/**
 * Zod schemas for the /users routes (Phase 01).
 */
const { z } = require('zod');

const locationUpdateSchema = z
  .object({
    village: z.string().trim().max(100).optional(),
    district: z.string().trim().min(2, 'District name is too short').max(100).optional(),
    state: z.string().trim().min(2, 'State name is too short').max(100).optional(),
    geo: z
      .tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)])
      .nullable()
      .optional(),
  })
  .optional();

const patchMeSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(100).optional(),
    language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'ur']).optional(),
    location: locationUpdateSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { patchMeSchema, listUsersQuery };
