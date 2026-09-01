# 🧱 PHASE 02 — Farmer Module (Listings, FPO & Uploads)

| | |
|---|---|
| **Status** | 🟡 PARTIAL (2026-09-01) — fully implemented & lint/build-verified; DB-dependent E2E verification pending (no MongoDB reachable from the build sandbox) |
| **Depends on** | Phase 01 |
| **Builds (blueprint §3)** | Farmer module · Product/Listing Service · uploads |

## 🎯 Objective

Farmers can create and manage **crop lot listings** (with photos, quantity, grade, price expectation) and maintain an FPO profile — supply-side inventory the marketplace runs on.

## ✅ Scope

### Backend
- [x] `Fpo` model: `name, registrationNo (unique), district, state, memberCount, contactPhone, verified: false, createdBy → User, timestamps` (+ `{district}`, `{createdAt}` indexes). `createdBy` was added (not in the original field list) to power the owner-only `PATCH /fpos/:id`.
- [x] `CropListing` model: `farmerId → User, fpoId?, crop, variety?, grade (A/B/C), organic: bool, quantity { value, unit: quintal|kg|tonne }, priceType: fixed|negotiable, pricePerUnit, mandiRef?, readinessDate, location { village, district, state, geo }, images: [url], status: draft|active|sold|expired, deletedAt (soft-delete), timestamps`
- [x] Indexes: `{crop, status, 'location.district'}`, `farmerId`, `createdAt` (RULES.md §6)
- [x] Endpoints (`/api/v1/listings`, `/api/v1/fpos`, `/api/v1/farmer`):
  - [x] `POST /listings` (farmer role) · `GET /listings` public w/ filters `crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit` · `GET /listings/:id` (public; drafts visible only to owner/admin) · `PATCH /listings/:id` (owner only) · `DELETE /listings/:id` (owner, soft-delete)
  - [x] `GET /farmer/me/listings` (own, any status) + stats `{ active, sold, avgPrice }`
  - [x] FPO: `POST /fpos` (farmer) · `GET /fpos` public (district/state filters + pagination) · `GET /fpos/:id` · `PATCH /fpos/:id` (owner) — admin verify later (Phase 7)
  - [x] `POST /listings/:id/images` — Multer: jpg/png/webp only, ≤ 3 MB each, max 5, random filenames → `backend/uploads/listings/` (local dev; **Cloudinary free tier in deployed envs** — see `docs/FREE_TIER_PLAN.md`)
- [x] Ownership checks in `middleware/ownership.js` (loads the doc, attaches `req.listing`/`req.fpo`, 403 on foreign access); validators (zod) on all routes; pagination envelope `{ items, page, limit, total, totalPages }`
- [x] `GET /farmer/me/fpos` added so the listing form can offer the caller's own FPOs (small, justified addition — noted in `PROJECT_STATE.md`)

### Frontend
- [x] **Farmer Dashboard** (`/farmer`): stats cards (active, sold, avg price), my-listings table (status chips), actions (view / edit / relist / mark sold / retire / delete)
- [x] **Add/Edit Listing form** (`/farmer/listings/new`, `/farmer/listings/:id/edit`): crop typeahead (`src/data/crops.js`), quantity+unit, price type & value, grade, organic toggle, readiness date, district + geo, multi-image upload with preview (≤ 5)
- [x] Listing detail page (public view, `/listings/:id`) + "Seller" card with FPO badge; images lazy-loaded
- [x] Empty/loading/error states on every data view (RULES.md §5)

## 🚫 Out of Scope

Mandi reference-price autofill UI (Phase 4 wires real prices), buyer actions on listings (Phase 3), an FPO-management UI (FPO CRUD is API-only until Phase 7 admin verify), removing individual photos from an existing listing (add-only in Phase 2).

## 🧪 Acceptance Criteria

- [ ] Farmer creates a listing with 3 images → appears in public `GET /listings` filtered by crop & district — **implemented; E2E pending a reachable MongoDB**
- [ ] Buyer-role token cannot create listings (403); farmer B cannot edit farmer A's listing (403) — **implemented (role + ownership middleware); E2E pending**
- [ ] Invalid upload (e.g., `.exe`, 6th image, 10 MB file) rejected with clear error — **implemented (MIME filter + `files:5` + `fileSize:3MB` + 5-total cap); MIME predicate unit-verified; E2E pending**
- [ ] Pagination works: seed 30 listings, page 2 returns items 11–20 — **implemented; E2E pending**
- [ ] Dashboard stats match seeded data — **implemented; E2E pending**
- [ ] Uploads dir not committed; image URLs serve with correct content type — **implemented: `.gitignore` keeps `backend/uploads/listings/` empty-but-present; `/uploads` static serving + Vite proxy wired; content-type check E2E pending**

> Verified without a DB (2026-09-01): lint + prettier + production build clean in both apps; zod validators unit-checked (fixed-price rule, negotiable-no-price, query coercion, id guard); `isAllowedImageMime` + `buildFilter` unit-checked; live curl — no-token/garbage-token → 401, bad `:id` → 400 `VALIDATION_ERROR`, public `GET /listings` with DB down → clean 500 `INTERNAL_ERROR` envelope (no internals), static `/uploads` + Vite `/api` `/uploads` proxy routes confirmed.

## ⏳ Remaining Tasks (to close this phase)

1. **Provide a reachable MongoDB** — local `mongod`, free Atlas M0, or `cd backend && npm run dev:db` (in-memory dev Mongo; needs normal internet).
2. `cd backend && npm run verify:listings` → all PASS flips every acceptance criterion above to ✅.
3. (Also closes Phase 01: `cd backend && npm run seed:admin` then `npm run verify:auth`.)
4. Tick the boxes, set Status `✅ DONE`, and complete the Phase Completion Protocol.

## 📦 Suggested Commits

```
feat(listings): crop listing model, crud and filters with ownership checks
feat(listings): multer image upload with type/size limits
feat(fpo): fpo model and endpoints
feat(frontend): farmer dashboard and listing forms with image upload
docs: close phase 02
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 03 — Buyer Module**. Note the crop constants file location in `PROJECT_STATE.md`.
