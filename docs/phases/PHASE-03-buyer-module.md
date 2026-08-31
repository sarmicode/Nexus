# 🧱 PHASE 03 — Buyer Module (Discovery, Compare & Watchlist)

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 02 |
| **Builds (blueprint §3)** | Buyer module (search · compare · buy-intent · orders start here) |

## 🎯 Objective

Buyers (consumers, wholesalers, processors, exporters) can **find, filter, compare, and express demand** — the demand side of the linkage, wired to Phase 2 supply.

## ✅ Scope

### Backend
- [ ] `GET /api/v1/listings/search` — full-text-ish search on crop/variety/district + existing filters + sort (price ↑/↓, newest, quantity) + pagination
- [ ] `Watchlist` model (`buyerId, listingId, note?`) → `POST/GET/DELETE /watchlist`
- [ ] `SavedSearch` model (`buyerId, query, alertsEnabled`) → `POST/GET/DELETE /saved-searches` (used by Phase 4 alerts)
- [ ] `Lead` model (buy-intent/RFQ): `listingId, buyerId, message, quantityWanted, priceOffered?, status: new|contacted|converted|dropped, timestamps`
  - [ ] `POST /listings/:id/leads` (buyer role) · `GET /farmer/me/leads` (farmer inbox) · `PATCH /leads/:id` status
- [ ] Rate limit lead creation (anti-spam); block duplicate lead per buyer+listing within 24 h
- [ ] Postman collection updated (`docs/postman/marketplace.json`)

### Frontend
- [ ] **Catalog page**: search bar, filter sidebar (crop, district, price range, organic, min qty), sort dropdown, result cards with image/price/quantity/district, pagination
- [ ] **Compare tray**: select 2–4 lots → side-by-side table (price/unit, qty, grade, district, readiness) with a "mandi modal price" column (placeholder until Phase 4)
- [ ] Listing detail: gallery, seller card, "Send enquiry (RFQ)" form (qty, message, optional offer price)
- [ ] **Buyer Dashboard**: watchlist grid, saved searches, my enquiries with status
- [ ] Farmer side: "Enquiries" tab in Farmer Dashboard (lead inbox with status actions)

## 🚫 Out of Scope

Real-time mandi prices in compare (Phase 4), matching scores (Phase 5), offers/negotiation & orders (Phase 6).

## 🧪 Acceptance Criteria

- [ ] Search "tomato" in district Nadia returns only matching active lots; sort by price works
- [ ] Compare tray renders 3 lots side-by-side with unit-normalized price (₹/kg vs ₹/quintal note)
- [ ] Buyer sends RFQ → farmer sees it in enquiries → marks "contacted"
- [ ] Watchlist add/remove persists; saved search recreated from URL query
- [ ] Unauthenticated users can browse but cannot RFQ/watchlist (401 → login redirect)
- [ ] All new endpoints validated; pagination on every list response

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
