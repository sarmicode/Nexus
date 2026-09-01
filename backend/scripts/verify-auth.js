/**
 * Phase 01 acceptance matrix — run against a RUNNING backend that has a real
 * MongoDB (local or Atlas). From the repo root:
 *
 *   cd backend && npm run dev            (terminal 1)
 *   cd backend && npm run seed:admin     (once, after ADMIN_PHONE/ADMIN_PASSWORD are set)
 *   cd backend && npm run verify:auth    (terminal 2)
 *
 * Prints PASS/FAIL per acceptance criterion. NOTE: the rate-limit test at the
 * end intentionally exhausts the auth budget (10/15 min per IP) — wait out the
 * window before more manual logins.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');

const BASE = process.argv[2] || 'http://localhost:5000/api/v1';
const ADMIN_PHONE = process.env.ADMIN_PHONE;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.error(`  FAIL  ${name} ${extra}`);
  }
};

async function api(method, p, { token, body } = {}) {
  const res = await fetch(BASE + p, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, json };
}

const phone = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
const buyerPhone = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
const password = 'Passw0rd!phase1';
const email = `farmer+${Date.now()}@test.farmbridge.dev`;

(async () => {
  console.log(`\nPhase 01 acceptance matrix → ${BASE}\n`);

  // ── Register: farmer + buyer round-trips ────────────────────────────
  const farmerReg = await api('POST', '/auth/register', {
    body: {
      name: 'Test Farmer',
      phone,
      email,
      password,
      role: 'farmer',
      location: { village: 'Raipur', district: 'Munger', state: 'Bihar' },
    },
  });
  check(
    'register farmer → 201 + user + tokens',
    farmerReg.status === 201 && farmerReg.json?.success && farmerReg.json?.data?.accessToken,
    JSON.stringify(farmerReg.json).slice(0, 200)
  );
  check(
    'no password/hash in register response',
    !JSON.stringify(farmerReg.json).includes('passwordHash') &&
      !JSON.stringify(farmerReg.json).includes(password)
  );

  const buyerReg = await api('POST', '/auth/register', {
    body: { name: 'Test Buyer', phone: buyerPhone, password, role: 'buyer' },
  });
  check('register buyer → 201', buyerReg.status === 201 && buyerReg.json?.success);

  const dup = await api('POST', '/auth/register', {
    body: { name: 'Dup Farmer', phone, password, role: 'farmer' },
  });
  check('duplicate phone → 409', dup.status === 409 && dup.json?.error?.code === 'CONFLICT');

  const badPhone = await api('POST', '/auth/register', {
    body: { name: 'Bad Phone', phone: '12345', password, role: 'farmer' },
  });
  check(
    'invalid phone → 400 VALIDATION_ERROR',
    badPhone.status === 400 && badPhone.json?.error?.code === 'VALIDATION_ERROR'
  );
  const shortPw = await api('POST', '/auth/register', {
    body: {
      name: 'Short Pw',
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      password: 'short',
      role: 'farmer',
    },
  });
  check('short password → 400', shortPw.status === 400);

  // ── Login: phone, email, wrong password ─────────────────────────────
  const loginPhone = await api('POST', '/auth/login', { body: { identifier: phone, password } });
  check(
    'login by phone → 200 + tokens',
    loginPhone.status === 200 && loginPhone.json?.data?.accessToken
  );

  const loginEmail = await api('POST', '/auth/login', { body: { identifier: email, password } });
  check('login by email → 200', loginEmail.status === 200);

  const badLogin = await api('POST', '/auth/login', {
    body: { identifier: phone, password: 'WrongPass123' },
  });
  check(
    'wrong password → 401 (generic message)',
    badLogin.status === 401 && /Invalid credentials/.test(badLogin.json?.error?.message || '')
  );

  // ── /users/me round-trips (farmer & buyer) ──────────────────────────
  const farmerAccess = loginPhone.json?.data?.accessToken;
  const farmerRefresh = loginPhone.json?.data?.refreshToken;
  const me = await api('GET', '/users/me', { token: farmerAccess });
  check(
    'farmer GET /users/me → 200 + role farmer + location',
    me.status === 200 &&
      me.json?.data?.role === 'farmer' &&
      me.json?.data?.location?.district === 'Munger',
    JSON.stringify(me.json).slice(0, 200)
  );

  const buyerAccess = buyerReg.json?.data?.accessToken;
  const buyerMe = await api('GET', '/users/me', { token: buyerAccess });
  check(
    'buyer GET /users/me → 200 + role buyer',
    buyerMe.status === 200 && buyerMe.json?.data?.role === 'buyer'
  );

  // ── PATCH /users/me ─────────────────────────────────────────────────
  const patch = await api('PATCH', '/users/me', {
    token: farmerAccess,
    body: { language: 'bn', location: { village: 'Newraipur', state: 'Bihar' } },
  });
  check(
    'farmer PATCH /users/me → updated language + location merged',
    patch.status === 200 &&
      patch.json?.data?.language === 'bn' &&
      patch.json?.data?.location?.village === 'Newraipur' &&
      patch.json?.data?.location?.district === 'Munger',
    JSON.stringify(patch.json?.data).slice(0, 200)
  );

  // ── Authn / RBAC ────────────────────────────────────────────────────
  const noToken = await api('GET', '/users/me');
  check('no token → 401', noToken.status === 401);

  const farmerList = await api('GET', '/users', { token: farmerAccess });
  check(
    'farmer GET /users (admin-only) → 403',
    farmerList.status === 403 && farmerList.json?.error?.code === 'FORBIDDEN'
  );

  if (ADMIN_PHONE && ADMIN_PASSWORD) {
    const adminLogin = await api('POST', '/auth/login', {
      body: { identifier: ADMIN_PHONE, password: ADMIN_PASSWORD },
    });
    const adminList = await api('GET', '/users', { token: adminLogin.json?.data?.accessToken });
    check(
      'admin login → GET /users 200 (paginated)',
      adminLogin.status === 200 &&
        adminList.status === 200 &&
        Array.isArray(adminList.json?.data?.users),
      JSON.stringify(adminList.json).slice(0, 120)
    );
  } else {
    check(
      'admin login → GET /users 200 (paginated)',
      false,
      'ADMIN_PHONE/ADMIN_PASSWORD not set — skipped'
    );
  }

  // ── Refresh rotation ────────────────────────────────────────────────
  const r1 = await api('POST', '/auth/refresh', { body: { refreshToken: farmerRefresh } });
  check(
    'refresh → new access + refresh pair',
    r1.status === 200 && r1.json?.data?.accessToken && r1.json?.data?.refreshToken,
    JSON.stringify(r1.json).slice(0, 120)
  );
  const newRefresh = r1.json?.data?.refreshToken;
  const reuse = await api('POST', '/auth/refresh', { body: { refreshToken: farmerRefresh } });
  check('old (rotated) refresh token → 401', reuse.status === 401);
  const newMe = await api('GET', '/users/me', { token: r1.json?.data?.accessToken });
  check('new access token works', newMe.status === 200);

  // ── Expired access token → 401 (frontend silently refreshes) ────────
  if (process.env.JWT_SECRET) {
    const sub = me.json?.data?._id;
    const expired = jwt.sign({ sub, role: 'farmer', type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const expiredMe = await api('GET', '/users/me', { token: expired });
    check(
      'expired access token → 401 "Access token expired"',
      expiredMe.status === 401 && /expired/i.test(expiredMe.json?.error?.message || ''),
      JSON.stringify(expiredMe.json).slice(0, 120)
    );
  } else {
    check('expired access token → 401', false, 'JWT_SECRET not set — skipped');
  }

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = await api('POST', '/auth/logout', { token: r1.json?.data?.accessToken });
  check('logout → 200', logout.status === 200);
  const afterLogout = await api('POST', '/auth/refresh', { body: { refreshToken: newRefresh } });
  check('refresh after logout → 401', afterLogout.status === 401);

  // ── Rate limiting (LAST — exhausts the auth budget) ─────────────────
  let got429 = false;
  let first429Attempt = null;
  for (let i = 1; i <= 12 && !got429; i += 1) {
    const res = await api('POST', '/auth/login', {
      body: { identifier: phone, password: `Wrong${Date.now()}${i}` },
    });
    if (res.status === 429) {
      got429 = true;
      first429Attempt = i;
    }
  }
  check(
    `wrong-credential rate limiting → 429 (hit on attempt ${first429Attempt ?? 'n/a'})`,
    got429,
    'never hit 429 in 12 attempts'
  );

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.error('NOTE: auth rate-limit budget may now be exhausted for this IP (~15 min).');
  }
  process.exit(fail > 0 ? 1 : 0);
})().catch((err) => {
  console.error('verify-auth crashed:', err.message);
  process.exit(2);
});
