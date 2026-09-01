/**
 * authenticate — verifies the Bearer access token, loads the active user
 * and attaches it to req.user. Runs BEFORE any role check (roles.js).
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.model');
const ApiError = require('../../common/utils/ApiError');
const asyncHandler = require('../../common/utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
    );
  }
  if (payload.type !== 'access') {
    throw ApiError.unauthorized('Invalid token type');
  }

  const user = await User.findById(payload.sub); // passwordHash excluded by select:false
  if (!user) throw ApiError.unauthorized('Account not found');
  if (user.status !== 'active') throw ApiError.forbidden('Account is blocked');

  req.user = user;
  next();
});

module.exports = { authenticate };
