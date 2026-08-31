/**
 * MongoDB connection helper with retry-on-start logging.
 *
 * The API boots even if the database is briefly unavailable (local dev without
 * mongod, Render cold starts, …) and keeps retrying; `GET /api/v1/health`
 * reports the current connection state.
 */
const mongoose = require('mongoose');

const config = require('./index');

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;
const SERVER_SELECTION_TIMEOUT_MS = 5000;

mongoose.connection.on('connected', () => {
  console.log(`[db] MongoDB connected (${mongoose.connection.host}/${mongoose.connection.name})`);
});
mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  console.log('[db] MongoDB reconnected');
});
mongoose.connection.on('error', (err) => {
  console.error(`[db] MongoDB error: ${err.message}`);
});

async function attemptConnection(attempt) {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    });
  } catch (err) {
    console.error(`[db] connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`);
    if (attempt < MAX_ATTEMPTS) {
      console.log(`[db] retrying in ${RETRY_DELAY_MS / 1000}s …`);
      setTimeout(() => attemptConnection(attempt + 1), RETRY_DELAY_MS).unref();
    } else {
      console.error(
        '[db] giving up for now — the API is still up; health will report the db state ' +
          'and Mongoose retries internally once connections are made'
      );
    }
  }
}

function connectDB() {
  attemptConnection(1);
}

const READY_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

/** @returns {'connected'|'disconnected'|'connecting'|'disconnecting'} */
function getDbState() {
  return READY_STATES[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, getDbState };
