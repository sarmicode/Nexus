# 🧱 PHASE 04 — Market Intelligence & Price Discovery

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 03 |
| **Builds (blueprint §3)** | Mandi Service (price aggregation) + price UX |
| **⚠️ This is the core of problem statement SIH26132 — price discovery. Give it your best work.** |

## 🎯 Objective

Aggregate daily mandi prices from **AGMARKNET / data.gov.in (primary)** and **eNAM (secondary)** for West Bengal & all-India crops; expose latest prices, trends and comparisons through cached APIs; surface them everywhere the user decides what to sell and where.

## ✅ Scope

### Backend — ingestion
- [ ] `PriceRecord` model: `source: agmarknet|enam, market { mandiName, district, state }, crop, variety?, grade?, minPrice, maxPrice, modalPrice (₹/quintal), arrivals { date, qtyTonnes? }, recordedOn, fetchedAt, timestamps`
- [ ] Index: `{ 'market.state', 'market.district', crop, recordedOn }` (compound) + `crop`
- [ ] `services/mandi/ingestService.js`: fetch & normalize AGMARKNET (data.gov.in API key or AGMARKNET endpoint) → upsert per (market, crop, date); log rejects
- [ ] Scheduled sync with `node-cron` (daily 06:00 IST) + `POST /api/v1/admin/prices/resync` (admin, manual, date-ranged)
- [ ] Graceful degradation: source down ⇒ keep serving last cached data, flag `staleSince`

### Backend — APIs (`/api/v1/market`)
- [ ] `GET /market/mandis?state&district&crop` — mandi directory w/ latest modal price
- [ ] `GET /market/prices/latest?crop&state&district` — latest modal/min/max per mandi + district avg + % change (1 d / 7 d)
- [ ] `GET /market/prices/trends/:crop?state&range=7|30|90` — daily series for charts
- [ ] `GET /market/prices/compare?crops=a,b&district` — multi-crop snapshot
- [ ] Redis caching: `price:latest:{crop}:{district}` TTL 6 h; trends TTL 24 h; cache-stampede guard (lock or single-flight)
- [ ] `PriceAlert` model (`userId, crop, district?, belowPrice?, abovePrice?`) → `POST/GET/DELETE /market/alerts`; cron checks & queues notifications (send logic lands Phase 6 — store `pendingAlerts` for now)

### Frontend
- [ ] **Market Comparison page** (from blueprint): mandi/crop selector, sortable table (modal, min, max, change %), district heatmap-style coloring (green ↑ / red ↓)
- [ ] **Trends chart** (Chart.js line, 7/30/90-day toggle) per crop & district
- [ ] **Price widget** embedded in: listing form (reference price for chosen crop+district), catalog cards & compare tray (lot price vs mandi modal delta %), listing detail
- [ ] Price alert form ("alert me above/below ₹X") + list of my alerts
- [ ] Data-freshness badge everywhere prices show ("as of {date}")

## 🚫 Out of Scope

Demand forecasting (Phase 5), sending emails/SMS (Phase 6), maps view (Phase 7).

## 🧪 Acceptance Criteria

- [ ] ≥ 3 crops × ≥ 5 mandis of real (or seeded fallback) price data visible after sync
- [ ] `/market/prices/latest` < 100 ms on cache hit; identical results on repeat calls
- [ ] Trends chart renders 7/30/90 ranges with no gaps rendered as zero
- [ ] Compare tray shows "lot vs mandi modal" delta for each lot
- [ ] Resync endpoint (admin-only) upserts without duplicates for the same market+crop+date
- [ ] Stale data clearly labeled; source-down scenario tested by pointing URL at bad host
- [ ] New env keys (`DATA_GOV_IN_API_KEY`, `AGMARKNET_BASE_URL`) in `.env.example` + `PROJECT_STATE.md`

## 📦 Suggested Commits

```
feat(mandi): price record model and agmarknet ingestion service
feat(mandi): price aggregation apis with redis caching
feat(mandi): cron sync, admin resync and price alerts
feat(frontend): market comparison page, trends charts and price widgets
docs: close phase 04
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 05 — Matching & Recommendations**.
