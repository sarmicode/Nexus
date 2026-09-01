/**
 * Seed the first admin from env (ADMIN_PHONE, ADMIN_PASSWORD).
 *
 *   npm run seed:admin
 *
 * Safe to re-run — it never modifies an existing account.
 */
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/user.model');
const { normalizePhone, isValidIndianPhone } = require('../../common/utils/phone');

(async () => {
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !password) {
    console.error('[seed] set ADMIN_PHONE and ADMIN_PASSWORD in backend/.env first');
    process.exit(1);
  }
  if (!isValidIndianPhone(phone)) {
    console.error('[seed] ADMIN_PHONE must be a valid 10-digit Indian mobile number');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const normalized = normalizePhone(phone);
  const existing = await User.findOne({ phone: normalized });
  if (existing) {
    console.log(`[seed] admin already exists (id ${existing._id}) — nothing to do`);
  } else {
    // passwordHash is bcrypted by the model's pre-save hook.
    const admin = await User.create({
      name: 'FarmBridge Admin',
      phone: normalized,
      passwordHash: password,
      role: 'admin',
    });
    console.log(`[seed] admin created: phone ${admin.phone} (id ${admin._id})`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});
