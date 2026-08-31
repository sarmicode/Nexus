/**
 * FarmBridge API — Express gateway (Phase 00 foundation).
 *
 * Gateway responsibilities per docs/PROJECT_BLUEPRINT.md:
 * security headers, CORS, logging, rate limiting, body limits,
 * routing under /api/v1, 404 catch-all, central error handling.
 * Business logic lives in src/services/, kept thin in src/controllers/.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// ── Security & hardening ────────────────────────────────────────────────
app.disable('x-powered-by');
app.use(helmet());

// CORS: strict allowlist (CORS_ORIGIN) in production; in development the
// request origin is reflected so the Vite dev-server proxy and sandboxed
// previews work without extra configuration.
app.use(
  cors(
    config.isProduction
      ? { origin: config.corsOrigins, credentials: true }
      : { origin: true, credentials: true }
  )
);

// ── Observability & payload handling ────────────────────────────────────
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// ── Rate limiting (abuse protection from day one, SECURITY.md) ──────────
app.use(
  '/api/v1',
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
    },
  })
);

// ── Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 catch-all + central error handler (must be last) ───────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`[server] ${config.appName} API listening on :${config.port} (${config.env})`);
});

// MongoDB connects in the background with retries — the gateway stays up
// and /api/v1/health reports the db state (see src/config/db.js).
connectDB();

module.exports = app;
