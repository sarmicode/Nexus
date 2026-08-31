/**
 * Shared constants for the FarmBridge API.
 */
module.exports = {
  APP_NAME: 'FarmBridge',
  API_VERSION: 'v1',
  API_PREFIX: '/api/v1',
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  },
  // RBAC roles — enforced from Phase 01 (server-side, never client-trusted).
  ROLES: { FARMER: 'farmer', BUYER: 'buyer', ADMIN: 'admin' },
};
