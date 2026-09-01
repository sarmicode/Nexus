/**
 * Phase 02 acceptance matrix — run against a RUNNING backend with a real
 * MongoDB (local or Atlas). From the repo root:
 *
 *   cd backend && npm run dev            (terminal 1)
 *   cd backend && npm run seed:admin     (optional; not needed for these tests)
 *   cd backend && npm run verify:listings (terminal 2)
 *
 * Prints PASS/FAIL per acceptance criterion and exits non-zero on any FAIL.
 * NOTE: like verify-auth, this registers real users. Don't run it right after
 * verify:auth — the /auth strict limiter (10/15 min per IP) may still be
 * exhausted; wait out the window or use a different source IP.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE = process.argv[2] || 'http://localhost:5000/api/v1';
const ORIGIN = new URL(BASE).origin;

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

async function api(method, p, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + p, {
    method,
    headers,
    body: form !== undefined ? form : body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json, headers: res.headers };
}

const randPhone = () => `9${Math.floor(100000000 + Math.random() * 899999999)}`;
const PASSWORD = 'Passw0rd!phase2';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

function pngForm(filenames) {
  const form = new FormData();
  for (const name of filenames) {
    form.append('images', new Blob([PNG], { type: 'image/png' }), name);
  }
  return form;
}

(async () => {
  console.log(`\nPhase 02 acceptance matrix → ${BASE}\n`);

  // ── A. Actors ────────────────────────────────────────────────────────
  const farmerA = await api('POST', '/auth/register', {
    body: {
      name: 'Farmer A',
      phone: randPhone(),
      password: PASSWORD,
      role: 'farmer',
      location: { village: 'Raipur', district: 'Munger', state: 'Bihar' },
    },
  });
  check(
    'register farmer A → 201',
    farmerA.status === 201,
    JSON.stringify(farmerA.json).slice(0, 200)
  );
  const farmerAToken = farmerA.json?.data?.accessToken;

  const buyer = await api('POST', '/auth/register', {
    body: { name: 'Buyer B', phone: randPhone(), password: PASSWORD, role: 'buyer' },
  });
  check('register buyer → 201', buyer.status === 201);
  const buyerToken = buyer.json?.data?.accessToken;

  const farmerB = await api('POST', '/auth/register', {
    body: { name: 'Farmer B', phone: randPhone(), password: PASSWORD, role: 'farmer' },
  });
  check('register farmer B → 201', farmerB.status === 201);
  const farmerBToken = farmerB.json?.data?.accessToken;

  // ── B. FPO ───────────────────────────────────────────────────────────
  const fpo = await api('POST', '/fpos', {
    token: farmerAToken,
    body: {
      name: 'Raipur Farmer Producer Co',
      registrationNo: `REG-${Date.now()}`,
      district: 'Munger',
      state: 'Bihar',
      memberCount: 120,
      contactPhone: randPhone(),
    },
  });
  check(
    'farmer A creates FPO → 201, verified false',
    fpo.status === 201 && fpo.json?.data?.verified === false,
    JSON.stringify(fpo.json).slice(0, 200)
  );
  const fpoId = fpo.json?.data?._id;

  const fpoPatch = await api('PATCH', `/fpos/${fpoId}`, {
    token: farmerBToken,
    body: { name: 'Hijacked FPO' },
  });
  check(
    "farmer B PATCH farmer A's FPO → 403",
    fpoPatch.status === 403,
    JSON.stringify(fpoPatch.json).slice(0, 200)
  );

  // ── C. Create listing + images + public filter ───────────────────────
  const listing = await api('POST', '/listings', {
    token: farmerAToken,
    body: {
      crop: 'Wheat',
      variety: 'HD-3086',
      grade: 'A',
      organic: true,
      quantity: { value: 5, unit: 'quintal' },
      priceType: 'fixed',
      pricePerUnit: 2200,
      readinessDate: '2026-09-15',
      location: { village: 'Raipur', district: 'Munger', state: 'Bihar' },
      fpoId,
    },
  });
  check(
    'farmer A creates listing → 201 with crop + location',
    listing.status === 201 &&
      listing.json?.data?.crop === 'wheat' &&
      listing.json?.data?.location?.district === 'Munger' &&
      listing.json?.data?.fpo?.name === 'Raipur Farmer Producer Co',
    JSON.stringify(listing.json).slice(0, 300)
  );
  const listingId = listing.json?.data?._id;

  const imgs = await api('POST', `/listings/${listingId}/images`, {
    token: farmerAToken,
    form: pngForm(['one.png', 'two.png', 'three.png']),
  });
  check(
    'upload 3 images → 200, images.length 3',
    imgs.status === 200 && imgs.json?.data?.images?.length === 3,
    JSON.stringify(imgs.json).slice(0, 300)
  );

  const imgUrl = imgs.json?.data?.images?.[0];
  if (imgUrl) {
    const imgRes = await fetch(ORIGIN + imgUrl);
    const contentType = imgRes.headers.get('content-type') || '';
    check(
      'uploaded image serves with image content-type',
      imgRes.status === 200 && contentType.startsWith('image/'),
      `${imgUrl} → ${contentType}`
    );
  } else {
    check('uploaded image serves with image content-type', false, 'no image URL in response');
  }

  const pubFilter = await api(
    'GET',
    `/listings?crop=${encodeURIComponent('Wheat')}&district=Munger`
  );
  check(
    'public GET /listings?crop&district includes the listing',
    pubFilter.status === 200 &&
      pubFilter.json?.data?.total >= 1 &&
      pubFilter.json?.data?.items.some((item) => item._id === listingId),
    JSON.stringify(pubFilter.json).slice(0, 200)
  );

  const pubOrganic = await api('GET', '/listings?organic=true');
  check(
    'organic filter works (organic=true → includes listing)',
    pubOrganic.status === 200 && pubOrganic.json?.data?.items.some((item) => item._id === listingId)
  );

  // ── D. RBAC ──────────────────────────────────────────────────────────
  const buyerCreate = await api('POST', '/listings', {
    token: buyerToken,
    body: {
      crop: 'Rice',
      grade: 'B',
      quantity: { value: 1, unit: 'quintal' },
      location: { district: 'Patna', state: 'Bihar' },
    },
  });
  check(
    'buyer token cannot create listings → 403',
    buyerCreate.status === 403,
    JSON.stringify(buyerCreate.json).slice(0, 200)
  );

  const bPatch = await api('PATCH', `/listings/${listingId}`, {
    token: farmerBToken,
    body: { pricePerUnit: 9999 },
  });
  check("farmer B cannot edit farmer A's listing → 403", bPatch.status === 403);

  const bDelete = await api('DELETE', `/listings/${listingId}`, { token: farmerBToken });
  check("farmer B cannot delete farmer A's listing → 403", bDelete.status === 403);

  const noToken = await api('POST', '/listings', { body: { crop: 'Rice' } });
  check('no token on POST /listings → 401', noToken.status === 401);

  // ── E. Upload rejections ─────────────────────────────────────────────
  const exeForm = new FormData();
  exeForm.append(
    'images',
    new Blob([Buffer.from('MZ\x90\x00')], { type: 'application/x-msdownload' }),
    'evil.exe'
  );
  const exe = await api('POST', `/listings/${listingId}/images`, {
    token: farmerAToken,
    form: exeForm,
  });
  check(
    'invalid upload (.exe) → 400',
    exe.status === 400 && exe.json?.error?.code === 'VALIDATION_ERROR',
    JSON.stringify(exe.json).slice(0, 200)
  );

  const six = await api('POST', `/listings/${listingId}/images`, {
    token: farmerAToken,
    form: pngForm(['1.png', '2.png', '3.png', '4.png', '5.png', '6.png']),
  });
  check('6th image → 400 (max 5)', six.status === 400, JSON.stringify(six.json).slice(0, 200));

  const bigForm = new FormData();
  bigForm.append(
    'images',
    new Blob([Buffer.alloc(3.5 * 1024 * 1024)], { type: 'image/png' }),
    'big.png'
  );
  const big = await api('POST', `/listings/${listingId}/images`, {
    token: farmerAToken,
    form: bigForm,
  });
  check('>3 MB image → 400', big.status === 400, JSON.stringify(big.json).slice(0, 200));

  // ── F. Pagination (seed 30 listings) ─────────────────────────────────
  const seeded = [];
  for (let i = 0; i < 30; i += 1) {
    const created = await api('POST', '/listings', {
      token: farmerAToken,
      body: {
        crop: 'Maize',
        grade: 'B',
        organic: false,
        quantity: { value: 10, unit: 'quintal' },
        priceType: 'fixed',
        pricePerUnit: 1000 + i,
        location: { district: 'Patna', state: 'Bihar' },
      },
    });
    if (created.status === 201) seeded.push(created.json.data);
  }
  check('seeded 30 listings', seeded.length === 30, `only ${seeded.length} created`);

  const page1 = await api('GET', '/listings?limit=10&page=1');
  const page2 = await api('GET', '/listings?limit=10&page=2');
  const p1Ids = new Set((page1.json?.data?.items || []).map((i) => i._id));
  const p2Ids = (page2.json?.data?.items || []).map((i) => i._id);
  check(
    'pagination: page 2 (limit 10) returns 10 items, no overlap with page 1',
    page2.json?.data?.items?.length === 10 && p2Ids.every((id) => !p1Ids.has(id)),
    `p1=${p1Ids.size} p2=${p2Ids.length} total=${page2.json?.data?.total}`
  );

  // ── G. Dashboard stats ───────────────────────────────────────────────
  const soldIds = [seeded[0]._id, seeded[1]._id];
  await api('PATCH', `/listings/${soldIds[0]}`, { token: farmerAToken, body: { status: 'sold' } });
  await api('PATCH', `/listings/${soldIds[1]}`, { token: farmerAToken, body: { status: 'sold' } });

  const my = await api('GET', '/farmer/me/listings', { token: farmerAToken });
  const expectedActive = 1 + 30 - 2;
  const activePrices = [2200, ...seeded.slice(2).map((s) => s.pricePerUnit)];
  const expectedAvg =
    Math.round((activePrices.reduce((a, b) => a + b, 0) / expectedActive) * 100) / 100;
  check(
    'dashboard stats match seeded data (active + sold + avg price)',
    my.json?.data?.stats?.active === expectedActive &&
      my.json?.data?.stats?.sold === 2 &&
      my.json?.data?.stats?.avgPrice === expectedAvg,
    `got active=${my.json?.data?.stats?.active} sold=${my.json?.data?.stats?.sold} avg=${my.json?.data?.stats?.avgPrice}, expected ${expectedActive}/2/${expectedAvg}`
  );

  // ── H. Draft privacy ─────────────────────────────────────────────────
  const draft = await api('POST', '/listings', {
    token: farmerAToken,
    body: {
      crop: 'Draft Crop',
      grade: 'C',
      quantity: { value: 1, unit: 'kg' },
      status: 'draft',
      location: { district: 'Patna', state: 'Bihar' },
    },
  });
  const draftId = draft.json?.data?._id;
  const publicDraft = await api('GET', '/listings?status=draft');
  check(
    'public GET /listings hides drafts',
    publicDraft.status === 200 &&
      !(publicDraft.json?.data?.items || []).some((i) => i._id === draftId),
    JSON.stringify(publicDraft.json).slice(0, 200)
  );
  const ownDraft = await api('GET', '/farmer/me/listings?status=draft', { token: farmerAToken });
  check(
    'owner sees own draft via /farmer/me/listings',
    (ownDraft.json?.data?.items || []).some((i) => i._id === draftId)
  );

  // ── I. Owner edit + soft delete ──────────────────────────────────────
  const ownPatch = await api('PATCH', `/listings/${listingId}`, {
    token: farmerAToken,
    body: { pricePerUnit: 2300 },
  });
  check(
    'farmer A edits own listing → 200 + price updated',
    ownPatch.status === 200 && ownPatch.json?.data?.pricePerUnit === 2300
  );

  const badPatch = await api('PATCH', `/listings/${listingId}`, {
    token: farmerAToken,
    body: { priceType: 'fixed', pricePerUnit: 0 },
  });
  check('fixed price without a positive pricePerUnit → 400', badPatch.status === 400);

  const del = await api('DELETE', `/listings/${listingId}`, { token: farmerAToken });
  check('farmer A soft-deletes own listing → 200', del.status === 200);
  const afterDel = await api('GET', `/listings/${listingId}`);
  check('soft-deleted listing hidden from public GET → 404', afterDel.status === 404);

  // ── J. Validation ────────────────────────────────────────────────────
  const noCrop = await api('POST', '/listings', {
    token: farmerAToken,
    body: {
      grade: 'A',
      quantity: { value: 1, unit: 'kg' },
      location: { district: 'Patna', state: 'Bihar' },
    },
  });
  check(
    'listing without crop → 400 VALIDATION_ERROR',
    noCrop.status === 400 && noCrop.json?.error?.code === 'VALIDATION_ERROR'
  );

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((err) => {
  console.error('verify-listings crashed:', err.message);
  process.exit(2);
});
