/**
 * Auth service — register, login, token refresh (rotation), logout (Phase 01).
 *
 * Token design:
 * - access:  JWT (HS256, 15 min default) — stateless, carried in the
 *   Authorization header.
 * - refresh: opaque 48-byte random token, 7 d default. Only its SHA-256 hash
 *   is stored; tokens rotate on every refresh (single-use).
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const config = require('../config');
const ApiError = require('../../common/utils/ApiError');
const { normalizePhone } = require('../../common/utils/phone');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, type: 'access' }, config.jwtSecret, {
    expiresIn: config.jwt.accessTtlMs,
  });
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + config.jwt.refreshTtlMs),
  });
  return { accessToken, refreshToken };
}

/** POST /auth/register — self-signup (farmer/buyer only). */
async function register({ name, phone, email, password, role, language, location }) {
  const normalizedPhone = normalizePhone(phone);
  const query = { $or: [{ phone: normalizedPhone }] };
  if (email) query.$or.push({ email: email.toLowerCase() });
  const existing = await User.findOne(query);
  if (existing) {
    throw ApiError.conflict(
      existing.phone === normalizedPhone ? 'Phone already registered' : 'Email already registered'
    );
  }
  const user = await User.create({
    name,
    phone: normalizedPhone,
    email: email ? email.toLowerCase() : undefined,
    passwordHash: password, // pre-save hook bcrypts it
    role,
    language,
    location,
  });
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), ...tokens };
}

/** POST /auth/login — phone OR email + password. */
async function login({ identifier, password }) {
  const id = String(identifier).trim().toLowerCase();
  const query = /^[6-9]\d{9}$/.test(id) ? { phone: id } : { email: id };
  const user = await User.findOne(query).select('+passwordHash');
  // Deliberately generic message — do not reveal which identifier exists.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (user.status !== 'active') throw ApiError.forbidden('Account is blocked');
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), ...tokens };
}

/** POST /auth/refresh — rotate the refresh token, return a new pair. */
async function refresh(refreshTokenValue) {
  const record = await RefreshToken.findOne({ tokenHash: sha256(refreshTokenValue) });
  if (!record) throw ApiError.unauthorized('Invalid refresh token');
  if (record.expiresAt <= new Date()) {
    await record.deleteOne();
    throw ApiError.unauthorized('Refresh token expired');
  }
  const user = await User.findById(record.userId).select('+passwordHash');
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Account not found or blocked');
  }
  // Rotation — the presented token is single-use.
  await record.deleteOne();
  const tokens = await issueTokens(user);
  return { user: user.toPublic(), ...tokens };
}

/** POST /auth/logout — invalidate every refresh token for the user. */
async function logout(userId) {
  await RefreshToken.deleteMany({ userId });
}

module.exports = { register, login, refresh, logout };
