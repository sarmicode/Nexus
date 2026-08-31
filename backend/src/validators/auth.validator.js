/**
 * Zod schemas for the /auth routes (Phase 01).
 */
const { z } = require('zod');
const { isValidIndianPhone } = require('../../common/utils/phone');

const phoneField = z
  .string({ required_error: 'Phone is required' })
  .min(10, 'Phone must be a 10-digit Indian mobile number')
  .max(15)
  .refine(isValidIndianPhone, 'Enter a valid Indian mobile number (10 digits, starting 6-9)');

// Empty string → undefined (frontend sends '' for the optional email).
const emailField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.email('Enter a valid email').max(255).optional()
);

const locationSchema = z
  .object({
    village: z.string().trim().max(100).optional(),
    district: z.string().trim().min(2, 'District name is too short').max(100).optional(),
    state: z.string().trim().min(2, 'State name is too short').max(100).optional(),
    geo: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]).optional(),
  })
  .optional();

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name is too short')
    .max(100),
  phone: phoneField,
  email: emailField,
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  // Admins are created via the seed script, never via self-registration.
  role: z.enum(['farmer', 'buyer'], { message: 'Role must be farmer or buyer' }),
  language: z.string().length(2).optional(),
  location: locationSchema,
});

const loginSchema = z.object({
  // Phone (10 digits) or email — the service decides which to match.
  identifier: z
    .string({ required_error: 'Phone or email is required' })
    .trim()
    .min(1, 'Phone or email is required')
    .max(255),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'refreshToken is required' })
    .min(16, 'refreshToken is invalid'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
