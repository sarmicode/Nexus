/**
 * Phase 03 acceptance matrix — run against a RUNNING backend with a real
 * MongoDB (local or Atlas). From the repo root:
 *
 *   cd backend && npm run dev            (terminal 1)
 *   cd backend && npm run seed:admin     (optional; not needed for these tests)
 *   cd backend && npm run verify:buyer   (terminal 2)
 *
 * Prints PASS/FAIL per acceptance criterion and exits non-zero on any FAIL.
 * NOTE: like verify-auth/listings, this registers real users. Don't run it
 * right after another verify script — the /auth strict limiter (10/15 min per
 * IP) may still be exhausted; wait out the window or use another source IP.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE = process.argv[2] || 'http://localhost:5000/api/v1';

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
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + p, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json };
}

const randPhone = () => `9${Math.floor(100000000 + Math.random() * 899999999)}`;
const PASSWORD = 'Passw0rd!phase3';

(async () => {
  console.log(`\nPhase 03 acceptance matrix → ${BASE}\n`);

  // ── A. Actors ────────────────────────────────────────────────────────
  const farmer = await api('POST', '/auth/register', {
    body: {
      name: 'Farmer Phase3',
      phone: randPhone(),
      password: PASSWORD,
      role: 'farmer',
      location: { village: 'Krishnanagar', district: 'Nadia', state: 'West Bengal' },
    },
  });
  check('register farmer → 201', farmer.status === 201, JSON.stringify(farmer.json).slice(0, 200));
  const farmerToken = farmer.json?.data?.accessToken;

  const buyer = await api('POST', '/auth/register', {
    body: { name: 'Buyer Phase3', phone: randPhone(), password: PASSWORD, role: 'buyer' },
  });
  check('register buyer → 201', buyer.status === 201, JSON.stringify(buyer.json).slice(0, 200));
  const buyerToken = buyer.json?.data?.accessToken;

  // ── B. Seed listings: tomato in Nadia (2), tomato elsewhere, rice ───────
  async function seed(crop, district, state, pricePerUnit) {
    const r = await api('POST', '/listings', {
      token: farmerToken,
      body: {
        crop,
        grade: 'A',
        organic: true,
        quantity: { value: 3, unit: 'quintal' },
        priceType: 'fixed',
        pricePerUnit,
        location: { village: 'Test', district, state },
      },
    });
    return r;
  }
  const tomatoNadia1 = await seed('tomato', 'Nadia', 'West Bengal', 1500);
  const tomatoNadia2 = await seed('tomato', 'Nadia', 'West Bengal', 900);
  const tomatoOther = await seed('tomato', 'Patna', 'Bihar', 1200);
  const rice = await seed('rice', 'Munger', 'Bihar', 3000);
  check(
    'seeded 4 listings (2 tomato/Nadia, 1 tomato/Patna, 1 rice)',
    tomatoNadia1.status === 201 &&
      tomatoNadia2.status === 201 &&
      tomatoOther.status === 201 &&
      rice.status === 201,
    JSON.stringify({
      tN1: tomatoNadia1.status,
      tN2: tomatoNadia2.status,
      tO: tomatoOther.status,
      r: rice.status,
    })
  );

  // ── C. Search: q=tomato & district=Nadia returns only matching active lots ─
  const search = await api(
    'GET',
    `/listings/search?q=${encodeURIComponent('tomato')}&district=Nadia`
  );
  const searchCrops = (search.json?.data?.items || []).map((i) => i.crop);
  check(
    'search q=tomato&district=Nadia only returns tomato in Nadia',
    search.status === 200 &&
      search.json?.data?.items?.length === 2 &&
      searchCrops.every((c) => c === 'tomato') &&
      search.json?.data?.items.every((i) => i.location.district === 'Nadia'),
    `got ${searchCrops.join(',')} total=${search.json?.data?.total}`
  );

  // ── D. Sort by price works ─────────────────────────────────────────────
  const sortAsc = await api('GET', '/listings/search?q=tomato&sort=priceAsc&district=Nadia');
  const ascPrices = (sortAsc.json?.data?.items || []).map((i) => i.pricePerUnit);
  check(
    'sort=priceAsc returns ascending prices',
    ascPrices.length === 2 && ascPrices[0] <= ascPrices[1],
    `got [${ascPrices}]`
  );
  const sortDesc = await api('GET', '/listings/search?q=tomato&sort=priceDesc&district=Nadia');
  const descPrices = (sortDesc.json?.data?.items || []).map((i) => i.pricePerUnit);
  check(
    'sort=priceDesc returns descending prices',
    descPrices.length === 2 && descPrices[0] >= descPrices[1],
    `got [${descPrices}]`
  );

  // ── E. Unauthenticated browse OK but RFQ/watchlist → 401 ───────────────
  const anonSearch = await api('GET', '/listings/search?q=tomato');
  check('unauthenticated search returns 200', anonSearch.status === 200);

  const anonRfq = await api('POST', `/listings/${tomatoNadia1.json?.data?._id}/leads`, {
    body: { message: 'I want this', quantityWanted: 1, quantityUnit: 'quintal' },
  });
  check(
    'unauthenticated RFQ → 401',
    anonRfq.status === 401,
    JSON.stringify(anonRfq.json).slice(0, 150)
  );

  const anonWatch = await api('POST', '/watchlist', {
    body: { listingId: tomatoNadia1.json?.data?._id },
  });
  check(
    'unauthenticated watchlist → 401',
    anonWatch.status === 401,
    JSON.stringify(anonWatch.json).slice(0, 150)
  );

  // ── F. Buyer RFQ → farmer inbox → mark contacted ───────────────────────
  const rfq = await api('POST', `/listings/${tomatoNadia1.json?.data?._id}/leads`, {
    token: buyerToken,
    body: {
      message: 'Please quote for weekly supply',
      quantityWanted: 2,
      quantityUnit: 'quintal',
      priceOffered: 1400,
    },
  });
  check(
    'buyer sends RFQ → 201, status new',
    rfq.status === 201 && rfq.json?.data?.status === 'new',
    JSON.stringify(rfq.json).slice(0, 200)
  );
  const leadId = rfq.json?.data?._id;

  const dupRfq = await api('POST', `/listings/${tomatoNadia1.json?.data?._id}/leads`, {
    token: buyerToken,
    body: { message: 'duplicate', quantityWanted: 1, quantityUnit: 'quintal' },
  });
  check(
    'duplicate RFQ (same buyer+listing within 24h) → 409',
    dupRfq.status === 409,
    JSON.stringify(dupRfq.json).slice(0, 200)
  );

  const farmerInbox = await api('GET', '/farmer/me/leads', { token: farmerToken });
  check(
    'farmer sees the buyer RFQ in inbox',
    farmerInbox.status === 200 &&
      (farmerInbox.json?.data?.items || []).some((l) => l._id === leadId) &&
      farmerInbox.json?.data?.items?.[0]?.buyer?.name === 'Buyer Phase3',
    JSON.stringify(farmerInbox.json).slice(0, 300)
  );

  const contact = await api('PATCH', `/leads/${leadId}`, {
    token: farmerToken,
    body: { status: 'contacted' },
  });
  check(
    'farmer marks RFQ contacted → 200',
    contact.status === 200 && contact.json?.data?.status === 'contacted',
    JSON.stringify(contact.json).slice(0, 200)
  );

  const buyerSeesContacted = await api('GET', '/leads/me', { token: buyerToken });
  check(
    'buyer sees own enquiry and updated status',
    buyerSeesContacted.status === 200 &&
      (buyerSeesContacted.json?.data?.items || []).some(
        (l) => l._id === leadId && l.status === 'contacted'
      ),
    JSON.stringify(buyerSeesContacted.json).slice(0, 300)
  );

  // ── G. Watchlist add/remove ────────────────────────────────────────────
  const addWatch = await api('POST', '/watchlist', {
    token: buyerToken,
    body: { listingId: tomatoNadia2.json?.data?._id, note: 'Compare later' },
  });
  check(
    'buyer adds listing to watchlist → 201',
    addWatch.status === 201 && addWatch.json?.data?.listing?._id === tomatoNadia2.json?.data?._id,
    JSON.stringify(addWatch.json).slice(0, 200)
  );

  const dupWatch = await api('POST', '/watchlist', {
    token: buyerToken,
    body: { listingId: tomatoNadia2.json?.data?._id },
  });
  check(
    'duplicate watchlist → 409',
    dupWatch.status === 409,
    JSON.stringify(dupWatch.json).slice(0, 150)
  );

  const listWatch = await api('GET', '/watchlist', { token: buyerToken });
  check(
    'watchlist listing persists (total 1)',
    listWatch.status === 200 && listWatch.json?.data?.total === 1,
    JSON.stringify(listWatch.json).slice(0, 200)
  );

  const removeWatch = await api('DELETE', `/watchlist/${tomatoNadia2.json?.data?._id}`, {
    token: buyerToken,
  });
  check(
    'watchlist remove → 200',
    removeWatch.status === 200,
    JSON.stringify(removeWatch.json).slice(0, 150)
  );

  const afterRemove = await api('GET', '/watchlist', { token: buyerToken });
  check(
    'watchlist empty after remove',
    afterRemove.json?.data?.total === 0,
    JSON.stringify(afterRemove.json).slice(0, 150)
  );

  // ── H. Saved search created + recreated from URL query ─────────────────
  const save = await api('POST', '/saved-searches', {
    token: buyerToken,
    body: { query: { q: 'tomato', district: 'Nadia', sort: 'priceAsc' }, alertsEnabled: true },
  });
  check(
    'buyer saves a search → 201',
    save.status === 201 &&
      save.json?.data?.query?.q === 'tomato' &&
      save.json?.data?.query?.district === 'Nadia' &&
      save.json?.data?.alertsEnabled === true,
    JSON.stringify(save.json).slice(0, 250)
  );
  const savedId = save.json?.data?._id;

  const listSaved = await api('GET', '/saved-searches', { token: buyerToken });
  check(
    'saved search persists',
    listSaved.status === 200 && listSaved.json?.data?.total === 1,
    JSON.stringify(listSaved.json).slice(0, 200)
  );

  // Recreate the exact search from the stored query → same results shape.
  const savedQuery = listSaved.json?.data?.items?.[0]?.query;
  const params = new URLSearchParams(savedQuery).toString();
  const rebuilt = await api('GET', `/listings/search?${params}`, { token: buyerToken });
  check(
    'saved search re-run from URL query returns results',
    rebuilt.status === 200 && rebuilt.json?.data?.total === 2,
    `rebuilt=${params} total=${rebuilt.json?.data?.total}`
  );

  const delSaved = await api('DELETE', `/saved-searches/${savedId}`, { token: buyerToken });
  check(
    'saved search delete → 200',
    delSaved.status === 200,
    JSON.stringify(delSaved.json).slice(0, 150)
  );

  // ── I. Validation & RBAC ────────────────────────────────────────────────
  const badRfq = await api('POST', `/listings/${tomatoNadia1.json?.data?._id}/leads`, {
    token: buyerToken,
    body: { message: '', quantityWanted: 0, quantityUnit: 'kg' },
  });
  check('invalid RFQ body → 400 VALIDATION_ERROR', badRfq.status === 400);

  // A farmer cannot send an RFQ (buyer role only).
  const farmerRfq = await api('POST', `/listings/${tomatoNadia1.json?.data?._id}/leads`, {
    token: farmerToken,
    body: { message: 'not a buyer', quantityWanted: 1, quantityUnit: 'quintal' },
  });
  check(
    'farmer role cannot send RFQ → 403',
    farmerRfq.status === 403,
    JSON.stringify(farmerRfq.json).slice(0, 150)
  );

  // Another farmer cannot update someone else's lead status (buyer B as owner of the listing).
  const otherFarmer = await api('POST', '/auth/register', {
    body: { name: 'Other Farmer', phone: randPhone(), password: PASSWORD, role: 'farmer' },
  });
  const hijack = await api('PATCH', `/leads/${leadId}`, {
    token: otherFarmer.json?.data?.accessToken,
    body: { status: 'converted' },
  });
  check(
    'another farmer cannot update the lead → 403',
    hijack.status === 403,
    JSON.stringify(hijack.json).slice(0, 150)
  );

  // Buyer cannot drive a lead status.
  const buyerPatch = await api('PATCH', `/leads/${leadId}`, {
    token: buyerToken,
    body: { status: 'converted' },
  });
  check(
    'buyer cannot update lead status → 403',
    buyerPatch.status === 403,
    JSON.stringify(buyerPatch.json).slice(0, 150)
  );

  // Pagination on list responses.
  const pagedWatch = await api('GET', '/watchlist?page=1&limit=10', { token: buyerToken });
  check(
    'watchlist pagination envelope',
    pagedWatch.status === 200 && pagedWatch.json?.data?.totalPages === 0
  );

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((err) => {
  console.error('verify-buyer crashed:', err.message);
  process.exit(2);
});
