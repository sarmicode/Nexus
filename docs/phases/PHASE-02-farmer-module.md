# 🧱 PHASE 02 — Farmer Module (Listings, FPO & Uploads)

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 01 |
| **Builds (blueprint §3)** | Farmer module · Product/Listing Service · uploads |

## 🎯 Objective

Farmers can create and manage **crop lot listings** (with photos, quantity, grade, price expectation) and maintain an FPO profile — supply-side inventory the marketplace runs on.

## ✅ Scope

### Backend
- [ ] `Fpo` model: `name, registrationNo, district, state, memberCount, contactPhone, verified: false, timestamps`
- [ ] `CropListing` model:
  ```
  farmerId → User, fpoId?, crop, variety?, grade (A/B/C), organic: bool,
  quantity { value, unit: quintal|kg|tonne }, priceType: fixed|negotiable,
  pricePerUnit (₹), mandiRef? (nearest mandi for reference),
  readinessDate, location { village, district, state, geo },
  images: [url], status: draft|active|sold|expired, timestamps
  ```
- [ ] Indexes: `{crop, status, 'location.district'}`, `farmerId`, `createdAt`
- [ ] Endpoints (`/api/v1/farmer`, `/api/v1/listings`, `/api/v1/fpos`):
  - [ ] `POST /listings` (farmer role) · `GET /listings` public w/ filters `crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit` · `GET /listings/:id` · `PATCH /listings/:id` (owner only) · `DELETE /listings/:id` (owner, soft-delete)
  - [ ] `GET /farmer/me/listings` (own, any status) + simple stats (active, sold, avg price)
  - [ ] FPO: `POST/GET /fpos`, `PATCH /fpos/:id` (owner), admin verify later (Phase 7)
  - [ ] `POST /listings/:id/images` — Multer: jpg/png/webp only, ≤ 3 MB each, max 5, random filenames → `backend/uploads/listings/` (local dev; **use Cloudinary free tier in deployed envs** — see `docs/FREE_TIER_PLAN.md`)
- [ ] Ownership checks in `middleware`; validators on all routes; pagination envelope `{ items, page, total }`

### Frontend
- [ ] **Farmer Dashboard**: stats cards, my listings table (status chips), actions (edit/retire/relist)
- [ ] **Add/Edit Listing form**: crop (typeahead from `common/constants/crops.js`), quantity+unit, price type & value, grade, organic toggle, readiness date, district + geo, multi-image upload with preview
- [ ] Listing detail page (public view) + "Seller" card with FPO badge
- [ ] Empty/loading/error states; images lazy-loaded

## 🚫 Out of Scope

Mandi reference-price autofill UI (Phase 4 wires real prices), buyer actions on listings (Phase 3).

## 🧪 Acceptance Criteria

- [ ] Farmer creates a listing with 3 images → appears in public `GET /listings` filtered by crop & district
- [ ] Buyer-role token cannot create listings (403); farmer B cannot edit farmer A's listing (403)
- [ ] Invalid upload (e.g., `.exe`, 6th image, 10 MB file) rejected with clear error
- [ ] Pagination works: seed 30 listings, page 2 returns items 11–20
- [ ] Dashboard stats match seeded data
- [ ] Uploads dir not committed; image URLs serve with correct content type

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
