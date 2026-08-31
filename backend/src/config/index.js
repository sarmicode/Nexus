/**
 * Central configuration — reads & validates `.env`, fails fast on problems.
 * RULES.md §4: config only from env; no hardcoded secrets, ports, or URLs.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const env = process.env.NODE_ENV || 'development';
const DEV_JWT_PLACEHOLDER = 'dev_change_me_in_production';

const problems = ['MONGO_URI', 'JWT_SECRET']
  .filter((key) => !process.env[key] || !String(process.env[key]).trim())
  .map((key) => `${key} is required but missing/empty in .env`);

if (env === 'production' && process.env.JWT_SECRET === DEV_JWT_PLACEHOLDER) {
  problems.push('JWT_SECRET must not be the dev placeholder when NODE_ENV=production');
}

if (problems.length > 0) {
  // Fail fast — a misconfigured server is worse than no server.
  console.error('[config] refusing to start — fix backend/.env:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const toPositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  env,
  isProduction: env === 'production',
  appName: 'FarmBridge',
  port: toPositiveInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  redisUrl: process.env.REDIS_URL || '',
  // Comma-separated origin allowlist, enforced when NODE_ENV=production.
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: toPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.RATE_LIMIT_MAX, 100),
  },
  // Integrations wired up in later phases (kept here so .env is complete from day one).
  emailApiKey: process.env.EMAIL_API_KEY || '',
  smsApiKey: process.env.SMS_API_KEY || '',
  paymentApiKey: process.env.PAYMENT_API_KEY || '',
  mapsApiKey: process.env.MAPS_API_KEY || '',
};
