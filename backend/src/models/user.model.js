/**
 * User model — the single identity for farmers, buyers and admins (RBAC).
 * Phase 01 of docs/phases/PHASE-01-auth-users.md.
 *
 * Security notes (SECURITY.md):
 * - passwordHash is `select: false` — it never leaves the service layer.
 * - bcrypt cost 10 via a pre-save hook (hashes only when the value changes).
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 10;

const locationSchema = new mongoose.Schema(
  {
    village: { type: String, trim: true, maxlength: 100 },
    district: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    // [lat, lng] — optional (frontend "use my location")
    geo: { type: [Number], min: [-90, -180], max: [90, 180], default: undefined },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, minlength: 10, maxlength: 10, unique: true },
    // Optional — sparse unique index allows multiple users without email.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
      unique: true,
      sparse: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer', index: true },
    language: {
      type: String,
      enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'ur'],
      default: 'en',
    },
    location: { type: locationSchema, default: undefined },
    isFpoMember: { type: Boolean, default: false },
    fpoId: { type: String, trim: true, maxlength: 64, default: undefined },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  },
  { timestamps: true }
);

// List views sort by newest first (admin user list).
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_ROUNDS);
  next();
});

/** Compare a plaintext password against the stored hash. */
userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/** JSON-safe user without the password hash or Mongo internals. */
userSchema.methods.toPublic = function toPublic() {
  const obj = this.toObject({ versionKey: false });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
