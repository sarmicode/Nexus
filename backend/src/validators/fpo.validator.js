/**
 * Zod schemas for the /fpos routes (Phase 02).
 */
const { z } = require('zod');
const { isValidIndianPhone } = require('../../common/utils/phone');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'id must be a valid 24-character id');

const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const contactPhone = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine(isValidIndianPhone, 'Enter a valid Indian mobile number (10 digits, starting 6-9)')
    .optional()
);

const createFpoSchema = z.object({
  name: z
    .string({ required_error: 'FPO name is required' })
    .trim()
    .min(2, 'Name is too short')
    .max(120),
  registrationNo: z
    .string({ required_error: 'Registration number is required' })
    .trim()
    .min(2, 'Registration number is too short')
    .max(60),
  district: z.string().trim().min(2, 'District name is too short').max(100),
  state: z.string().trim().min(2, 'State name is too short').max(100),
  memberCount: z.coerce.number().int().min(0, 'memberCount must be 0 or more').default(0),
  contactPhone,
});

const updateFpoSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(120).optional(),
    registrationNo: z.string().trim().min(2, 'Registration number is too short').max(60).optional(),
    district: z.string().trim().min(2, 'District name is too short').max(100).optional(),
    state: z.string().trim().min(2, 'State name is too short').max(100).optional(),
    memberCount: z.coerce.number().int().min(0, 'memberCount must be 0 or more').optional(),
    contactPhone: contactPhone.nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

const listFposQuery = z.object({
  district: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParams = z.object({ id: objectId });

module.exports = { createFpoSchema, updateFpoSchema, listFposQuery, idParams };
