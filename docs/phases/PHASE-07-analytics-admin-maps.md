# 🧱 PHASE 07 — Analytics, Maps & Admin

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 06 |
| **Builds (blueprint §3)** | Analytics Service · Admin module · Maps · logistics support |

## 🎯 Objective

Make the platform *observable and trustworthy*: dashboards for farmers/buyers, Leaflet maps of mandis & lots, demand forecasts surfaced, and admin tooling for users, disputes, and quality checks — plus delivery/logistics estimates (route-optimization groundwork).

## ✅ Scope

### Backend — analytics (`/api/v1/analytics`)
- [ ] `GET /analytics/farmer` — my sales, avg realized price vs mandi modal (Phase 4), active/sold lots, enquiry funnel
- [ ] `GET /analytics/buyer` — purchases, spend, savings vs mandi modal, top crops
- [ ] `GET /analytics/admin/overview` — users by role, GMV, orders by status, active lots, top districts, dispute rate
- [ ] `GET /analytics/price-heatmap?crop` — district → latest avg modal (feeds map layer)
- [ ] All analytics read aggregates (Mongo aggregations), Redis-cached 15 min

### Backend — maps & logistics
- [ ] `GET /market/mandis/geo` — mandis with lat/lng + latest price (static seed of WB/all-India mandis)
- [ ] `GET /logistics/estimate?from&to&qtyTonnes` — haversine distance × rate card → ETA & cost band (stub ready for ML route optimization later)
- [ ] `POST /logistics/optimize` — TSP-lite nearest-neighbor multi-stop route suggestion (optional: call `ml-service`)

### Backend — admin (`/api/v1/admin`, admin role)
- [ ] `GET/PATCH /admin/users` — list, block/unblock, verify FPO (`fpo.verified`)
- [ ] `GET /admin/disputes` + `PATCH /admin/disputes/:id/resolve` (refund/cancel/complete + note)
- [ ] `GET /admin/quality/:listingId` — flag/pass quality check on a listing (visible badge)
- [ ] Audit trail: `AdminAction` model (who, what, when) on every admin mutation

### Frontend
- [ ] **Analytics pages** (Chart.js): farmer dashboard charts, buyer insights, admin overview (line/bar/doughnut)
- [ ] **Map page** (Leaflet + OpenStreetMap tiles; `VITE_MAPS_API_KEY` optional): mandi markers colored by price delta, lot origins, buyer↔lot distance lines; popup = latest prices
- [ ] **Demand forecast card** on crop/market pages (from `ml-service /forecast/demand`, graceful hide if off)
- [ ] **Admin console** pages: users table (actions), disputes queue, quality checks, platform metrics
- [ ] Logistics estimate widget on order confirm ("delivery ≈ X km, ₹Y–Z")

## 🚫 Out of Scope

Real transport booking, live driver tracking, A/B-tested UI.

## 🧪 Acceptance Criteria

- [ ] Farmer sees realized vs mandi-modal price chart for own sales (seeded data)
- [ ] Admin overview numbers reconcile with DB counts for seeded scenario
- [ ] Map renders ≥ 10 mandi markers with fresh prices & working popups; lot markers cluster at district level
- [ ] Logistics estimate returns deterministic cost for fixed inputs; optimize suggests ordered route for 3 stops
- [ ] Admin can block a user (their token rejected on next request) and resolve a dispute (order state updated)
- [ ] Every admin action appears in the audit trail
- [ ] Non-admin gets 403 on all `/admin` routes

## 📦 Suggested Commits

```
feat(analytics): farmer, buyer and admin aggregate endpoints
feat(analytics): price heatmap and map geo endpoints
feat(admin): user management, dispute resolution, quality checks with audit trail
feat(logistics): distance, cost estimate and route suggestion
feat(frontend): analytics dashboards, leaflet map page and admin console
docs: close phase 07
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 08 — Hardening, CI & Deployment**.
