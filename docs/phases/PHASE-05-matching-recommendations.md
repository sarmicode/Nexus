# 🧱 PHASE 05 — Matching & Recommendations (+ ML Service)

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 04 |
| **Builds (blueprint §3)** | Matching Service · Recommendation Service · Python ML API |

## 🎯 Objective

Close the loop between supply and demand: rank **best buyers for a lot** and **best lots for a buyer**, first with transparent rules, then enhanced by an optional Python ML microservice (also home of demand forecasting).

## ✅ Scope

### Backend — rule-based matching core
- [ ] `BuyerDemand` model (buyer intent profile): `buyerId, cropsWanted[], quantityNeeded {value, unit}, districts[] or maxDistanceKm, budgetPerUnit?, buyerType: consumer|wholesaler|processor|exporter, active`
  - [ ] `POST/GET/PATCH /api/v1/demand` (buyer role)
- [ ] `services/matching/engine.js` — score(listing, demand) 0–100, weights logged in code:
  - crop match (must) → quantity coverage → distance (haversine on geo, ≤ maxDistanceKm) → price alignment vs lot price & mandi modal (Phase 4 data) → freshness/readiness → buyer trust score
- [ ] Endpoints:
  - [ ] `GET /matches/listing/:id` — ranked buyers for a farmer's lot (with score breakdown)
  - [ ] `GET /matches/demand/:id` — ranked lots for a buyer's demand
  - [ ] `GET /matches/feed` — personalized buyer feed (top lots per their demands)
- [ ] Redis cache `cache:match:*` TTL 10 min; matches recomputed on listing/demand mutation

### Python ML microservice (`ml-service/`, FastAPI)
- [ ] `GET /health`; served on `:8000`; `requirements.txt` (fastapi, uvicorn, scikit-learn, pandas)
- [ ] `POST /score` — matching-score model (features = rule-engine features; train on seeded interactions or heuristic labels)
- [ ] `POST /forecast/demand` — crop+district demand forecast: moving-average baseline → optional gradient-boosted regression on price/arrival history from Phase 4
- [ ] Backend integration: `ML_SERVICE_URL` env; `services/ml/client.js` with timeout + **rule-based fallback** if ML is down; feature flag `USE_ML`

### Frontend
- [ ] Lot detail (farmer view): "Suggested buyers" panel with score bars & reasons
- [ ] Buyer home: personalized feed ("Matches for you") above catalog; "why this match" tooltips
- [ ] Demand form UI (crops, quantity, districts, budget) in Buyer Dashboard
- [ ] Admin/dev toggle or env-only `USE_ML` indicator (badge: "ML enhanced" vs "Rules")

## 🚫 Out of Scope

Learning from real clickstream (log events now, train later — hackathon demo uses seeded data).

## 🧪 Acceptance Criteria

- [ ] Seeded scenario: 1 tomato lot (Nadia, 40 qtl) → nearest/matching demands rank top with sensible scores; score breakdown visible
- [ ] Buyer feed differs meaningfully between two buyers with different demands
- [ ] With `ml-service` running: `/score` and `/forecast/demand` return predictions; kill the service → app still works via rules (no 500s)
- [ ] Match API < 300 ms p95 on seed data (cached)
- [ ] `ml-service` README (setup/run) committed; env keys `ML_SERVICE_URL`, `USE_ML` logged in `PROJECT_STATE.md`

## 📦 Suggested Commits

```
feat(match): buyer demand model and endpoints
feat(match): rule-based matching engine with score breakdown
feat(ml): fastapi service with scoring and demand forecast endpoints
feat(match): backend ml client with feature-flag fallback
feat(frontend): match panels, personalized feed and demand forms
docs: close phase 05
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 06 — Orders, Payments & Notifications**.
