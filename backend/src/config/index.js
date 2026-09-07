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
  console.error('[config] refusing to start — fix backend/.env:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const toPositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const ttlToMs = (value, fallback) => {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  if (value.endsWith('ms')) return n;
  if (value.endsWith('s')) return n * 1000;
  if (value.endsWith('m')) return n * 60 * 1000;
  if (value.endsWith('h')) return n * 60 * 60 * 1000;
  if (value.endsWith('d')) return n * 24 * 60 * 60 * 1000;
  return n * 1000;
};

module.exports = {
  env,
  isProduction: env === 'production',
  appName: 'FarmBridge',
  port: toPositiveInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  redisUrl: process.env.REDIS_URL || '',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: toPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.RATE_LIMIT_MAX, 100),
  },
  jwt: {
    accessTtlMs: ttlToMs(process.env.JWT_ACCESS_TTL, 15 * 60 * 1000),
    refreshTtlMs: ttlToMs(process.env.JWT_REFRESH_TTL, 7 * 24 * 60 * 60 * 1000),
  },
  adminPhone: process.env.ADMIN_PHONE || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  emailApiKey: process.env.EMAIL_API_KEY || '',
  smsApiKey: process.env.SMS_API_KEY || '',
  paymentApiKey: process.env.PAYMENT_API_KEY || '',
  paymentApiSecret: process.env.PAYMENT_API_SECRET || '',
  mapsApiKey: process.env.MAPS_API_KEY || '',
  dataGovInApiKey: process.env.DATA_GOV_IN_API_KEY || '',
  agmarknetBaseUrl: process.env.AGMARKNET_BASE_URL || '',
  mlServiceUrl: process.env.ML_SERVICE_URL || '',
  useMl: process.env.USE_ML === 'true',
};
