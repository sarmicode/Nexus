/**
 * FarmBridge API — Express gateway.
 * Phases 00–07 all mounted under /api/v1.
 */
const path = require('path');
const http = require('http');
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
const { setIO } = require('./services/notify.service');

const app = express();
const server = http.createServer(app);

// ── Socket.io (Phase 06) ──────────────────────────────────────────────
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: config.isProduction ? config.corsOrigins : true,
      credentials: true,
    },
  });

  // JWT auth for socket connections.
  const jwt = require('jsonwebtoken');
  const User = require('./models/user.model');
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, config.jwtSecret);
      if (payload.type !== 'access') return next(new Error('Invalid token type'));
      const user = await User.findById(payload.sub);
      if (!user || user.status !== 'active') return next(new Error('Account not active'));
      socket.userId = user._id.toString();
      socket.join(`user:${socket.userId}`);
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] user ${socket.userId} connected`);
    socket.on('disconnect', () => {
      console.log(`[socket] user ${socket.userId} disconnected`);
    });
  });

  setIO(io);
} catch (err) {
  console.warn('[socket] socket.io not available, real-time notifications disabled');
}

// ── Security & hardening ──────────────────────────────────────────────
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors(
    config.isProduction
      ? { origin: config.corsOrigins, credentials: true }
      : { origin: true, credentials: true }
  )
);

// ── Observability & payload handling ──────────────────────────────────
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// Uploads (Phase 02).
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// ── Rate limiting ─────────────────────────────────────────────────────
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

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 + error handler ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
server.listen(config.port, '0.0.0.0', () => {
  console.log(`[server] ${config.appName} API listening on :${config.port} (${config.env})`);
});

connectDB();

module.exports = app;
