/**
 * requireRole — RBAC guard, always used after authenticate.
 * Server-side only — the client role is never trusted (SECURITY.md).
 *
 *   router.get('/', authenticate, requireRole('admin'), handler);
 */
const ApiError = require('../../common/utils/ApiError');

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires role: ${roles.join(' or ')}`));
    }
    return next();
  };

module.exports = { requireRole };
