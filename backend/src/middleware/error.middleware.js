/**
 * Central error handling — the 404 catch-all and the envelope-shaped error
 * handler, wired into src/server.js. No stack traces or internals ever leak
 * to production clients (SECURITY.md).
 */
const config = require('../config');
const ApiError = require('../../common/utils/ApiError');
const { ERROR_CODES } = require('../../common/constants');

/** 404 catch-all — any non-matching request gets the JSON envelope. */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Express error handlers need 4 params — `_next` is unused by design.
function errorHandler(err, req, res, _next) {
  // Malformed JSON body produced by express.json().
  if (err.type === 'entity.parse.failed') {
    err = ApiError.badRequest('Invalid JSON in request body');
  }
  // Payload over the 1 MB limit.
  if (err.type === 'entity.too.large') {
    err = ApiError.badRequest('Request body too large (limit 1 MB)');
  }
  // Database unreachable (no mongod / Atlas down / queued op timed out) —
  // clean message, no internals (collection names, driver errors, …).
  const isDbDown =
    err &&
    (err.name === 'MongooseServerSelectionError' ||
      err.name === 'MongooseNotConnectedError' ||
      /ECONNREFUSED|MongoNetworkError|MongoServerSelectionError|buffering timed out/.test(
        String(err.message || '')
      ));
  if (isDbDown) {
    err = ApiError.internal('Database temporarily unavailable, please try again');
  }

  const status = err.statusCode || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (isServerError ? ERROR_CODES.INTERNAL_ERROR : ERROR_CODES.VALIDATION_ERROR),
      // Never leak internals (e.g. Mongo/DB errors) in production.
      message:
        isServerError && config.isProduction
          ? 'Internal server error'
          : err.message || 'Something went wrong',
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
