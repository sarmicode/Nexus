# 🧱 PHASE 03 — Buyer Module (Discovery, Compare & Watchlist)

| | |
|---|---|
| **Status** | 🟡 PARTIAL (2026-09-01) — fully implemented & lint/build-verified; DB-dependent E2E verification pending (no MongoDB reachable from the build sandbox, same egress blocker as Phases 01–02) |
| **Depends on** | Phase 02 |
| **Builds (blueprint §3)** | Buyer module (search · compare · buy-intent · orders start here) |

## 🎯 Objective

Buyers (consumers, wholesalers, processors, exporters) can **find, filter, compare, and express demand** — the demand side of the linkage, wired to Phase 2 supply.

## ✅ Scope

### Backend
- [x] `GET /api/v1/listings/search` — full-text-ish search on crop/variety/district + existing filters + sort (price ↑/↓, newest, quantity) + pagination — `q` matches crop/variety/district; extended sort map with `qtyAsc`/`qtyDesc`
- [x] `Watchlist` model (`buyerId, listingId, note?`, unique compound index) → `POST/GET/DELETE /watchlist` (409 on duplicate; 404 on missing listing)
- [x] `SavedSearch` model (`buyerId, query, alertsEnabled`) → `POST/GET/DELETE /saved-searches` (used by Phase 4 alerts)
- [x] `Lead` model (buy-intent/RFQ): `listingId, buyerId, message, quantityWanted, quantityUnit, priceOffered?, status: new|contacted|converted|dropped, timestamps`
  - [x] `POST /listings/:id/leads` (buyer role) · `GET /farmer/me/leads` (farmer inbox) · `GET /leads/me` (buyer's own) · `PATCH /leads/:id` status (owner/admin)
- [x] Rate limit lead creation (strict 10/15 min per IP) + duplicate lead per buyer+listing blocked within 24 h
- [x] Postman collection updated (`docs/postman/marketplace.json`)

### Frontend
- [x] **Catalog page** (`/catalog`): search bar, filter sidebar (crop, state/district, price range, organic, min qty), sort dropdown, result cards with image/price/quantity/district, pagination
- [x] **Compare tray**: select 2–4 lots → side-by-side table (price/unit, ₹/kg-normalized price, qty, grade, district, readiness) with a "mandi modal price" column (placeholder until Phase 4)
- [x] Listing detail: gallery, seller card, "Send enquiry (RFQ)" form (qty, unit, message, optional offer price) + watchlist toggle
- [x] **Buyer Dashboard** (`/buyer`): watchlist grid, saved searches, my enquiries with status
- [x] Farmer side: "Enquiries" tab in Farmer Dashboard (lead inbox with status actions) — merged into the farmer dashboard

## 🚫 Out of Scope

Real-time mandi prices in compare (Phase 4), matching scores (Phase 5), offers/negotiation & orders (Phase 6).

## 🧪 Acceptance Criteria

- [ ] Search "tomato" in district Nadia returns only matching active lots; sort by price works — **implemented; E2E pending a reachable MongoDB** (via `npm run verify:buyer`)
- [ ] Compare tray renders 3 lots side-by-side with unit-normalized price (₹/kg vs ₹/quintal note) — **implemented (frontend CompareTable); E2E pending (needs live listings)**
- [ ] Buyer sends RFQ → farmer sees it in enquiries → marks "contacted" — **implemented; E2E pending**
- [ ] Watchlist add/remove persists; saved search recreated from URL query — **implemented; E2E pending**
- [ ] Unauthenticated users can browse but cannot RFQ/watchlist (401 → login redirect) — **implemented (authenticate + role gates); no-token live curl → 401 verified; login redirect is frontend behavior**
- [ ] All new endpoints validated; pagination on every list response — **implemented; E2E pending**

> Verified without a DB (2026-09-01): lint + prettier clean in both apps; production build clean both apps; zod validators + `buildSearchFilter` unit-checked (search query coercion, lead rule, watchlist id, saved-search record, invalid-lead rejection); live curl — public `/listings/search` with DB down → clean 500 `INTERNAL_ERROR` envelope, no-token `POST /listings/:id/leads` / `/watchlist` / `/saved-searches` / `/leads/me` / `PATCH /leads/:id` → 401, 404 catch-all intact, Vite `/api` proxy + SPA `/catalog` deep-link → 200.

## ⏳ Remaining Tasks (to close this phase)

1. **Provide a reachable MongoDB** — local `mongod`, free Atlas M0, or `cd backend && npm run dev:db` (in-memory dev Mongo; needs normal internet).
2. `cd backend && npm run verify:buyer` → all PASS flips the acceptance criteria above to ✅.
3. (Also closes Phases 01 & 02: run `npm run seed:admin` then `npm run verify:auth` and `npm run verify:listings`.)
4. Tick the boxes, set Status `✅ DONE`, and complete the Phase Completion Protocol.

## 📦 Suggested Commits

```
feat(buyer): listing search, sort and pagination
feat(buyer): watchlist and saved searches
feat(buyer): lead/RFQ flow with farmer inbox
feat(frontend): catalog, compare tray, rfq and buyer dashboard
docs: close phase 03
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 04 — Market Intelligence** (the heart of the problem statement).
