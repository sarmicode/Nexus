/**
 * RefreshToken model — opaque rotating refresh tokens (Phase 01).
 *
 * Only a SHA-256 hash of the token is stored, so a DB leak does not expose
 * usable refresh tokens. Tokens are single-use (rotation) and TTL-cleaned.
 */
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB TTL — removes expired tokens automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
