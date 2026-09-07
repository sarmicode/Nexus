# 🧠 PROJECT_STATE.md — Living Memory of the Project

> **The next chat session knows ONLY what is written here.** Update this file at the end of every phase (see `PROMPT.md` → Phase Completion Protocol). Last updated: **2026-09-07 (All Phases Complete)**

## Current Snapshot

| | |
|---|---|
| **Active phase** | — PROJECT COMPLETE — |
| **Phase status** | ✅ All 8 phases implemented |
| **App runs?** | ✅ Yes — backend `:5000` + frontend `:5173` |
| **Deployed?** | Ready for deployment (see `docs/DEPLOYMENT.md`) |
| **Live URLs** | — |
| **Session branch** | `arena/01a07a6c-nexus` |

## Completed Phases

| Phase | Completed | Summary |
|---|---|---|
| 00 — Foundation & Repo Bootstrap | 2026-08-31 | Express 5 gateway, health endpoint, Mongo retry-on-start, Vite 6 + React 19 shell, ESLint + Prettier |
| 01 — Auth & User Management | 2026-09-07 | User model (RBAC), JWT access + rotating refresh tokens, register/login/refresh/logout, admin seed, strict rate limiter, frontend auth flow |
| 02 — Farmer Module | 2026-09-07 | CropListing + Fpo models, listing CRUD, image uploads (Multer), public filters, soft-delete, Farmer Dashboard UI |
| 03 — Buyer Module | 2026-09-07 | Watchlist, SavedSearch, Lead (RFQ) models; search with full-text; buyer dashboard; farmer lead inbox |
| 04 — Market Intelligence | 2026-09-07 | PriceRecord model, mandi directory, latest prices, trends (7/30/90d), multi-crop compare, price alerts, seed script (90 days × 12 mandis × 12 crops) |
| 05 — Matching & Recommendations | 2026-09-07 | BuyerDemand model, rule-based matching engine (crop/qty/distance/price/freshness/grade scoring 0-100), personalized feed |
| 06 — Orders, Payments & Notifications | 2026-09-07 | Offer model (counter-offers), Order model (state machine: created→confirmed→dispatched→delivered→completed), stub payments, Socket.io + in-app notifications |
| 07 — Analytics, Admin & Maps | 2026-09-07 | Farmer/buyer/admin analytics, user management, dispute resolution, quality checks, audit trail, logistics estimates, mandi map |
| 08 — Hardening, CI & Deployment | 2026-09-07 | Docker + docker-compose, GitHub Actions CI, demo seeder, deployment docs, v1.0.0 |

## Environment Variables

| Key | Service | Status |
|---|---|---|
| `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET` | backend | ✅ live (Phase 00) |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | backend | ✅ live (Phase 01) |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | backend | ✅ live (Phase 01) |
| `REDIS_URL` | backend | ✅ in config (Phase 04 caching) |
| `CORS_ORIGIN` | backend | ✅ live (Phase 00) |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | backend | ✅ live (Phase 00) |
| `PAYMENT_API_KEY`, `PAYMENT_API_SECRET` | backend | ✅ Phase 06 (Razorpay) |
| `DATA_GOV_IN_API_KEY`, `AGMARKNET_BASE_URL` | backend | ✅ Phase 04 (price ingestion) |
| `ML_SERVICE_URL`, `USE_ML` | backend | ✅ Phase 05 (ML microservice) |
| `EMAIL_API_KEY`, `SMS_API_KEY` | backend | ✅ Phase 06 |
| `MAPS_API_KEY` | backend | ✅ Phase 07 (optional, Leaflet/OSM free) |
| `VITE_API_BASE_URL`, `VITE_MAPS_API_KEY` | frontend | ✅ live (Phase 00) |

## Decisions Log (append-only)

| # | Date | Decision | Reason |
|---|------|----------|--------|
| 1–28 | 2026-08-31 to 2026-09-01 | *(existing decisions — see previous STATE)* | — |
| 29 | Phase 03 | Lead rate limiter: 20 per 15 min per IP; 24-hour duplicate block per buyer+listing | Anti-spam for enquiries |
| 30 | Phase 04 | In-memory cache as Redis stand-in (swappable when Redis available); TTLs: latest 6h, trends 24h | Zero-dependency caching that works without Redis |
| 31 | Phase 04 | Seed data: 90 days × 12 mandis × 12 crops via `npm run seed:prices`; source='seed' | Realistic demo data for judge presentation |
| 32 | Phase 05 | Matching weights: crop 30, quantity 20, distance 20, price 15, freshness 10, grade 5 (sum 100) | Transparent scoring breakdown |
| 33 | Phase 06 | Order state machine guards illegal transitions; cancel restores listing quantity | Prevents overselling; clean lifecycle |
| 34 | Phase 06 | Stub payment provider (dev mode) with Razorpay-compatible interface | Works without payment keys; real integration ready |
| 35 | Phase 06 | Notifications: in-app (Notification model) + Socket.io push + console log in dev | Real-time UX without external services in dev |
| 36 | Phase 07 | Admin audit trail: in-memory array (last 1000 entries) | Sufficient for demo; production should use a dedicated model |
| 37 | Phase 07 | Logistics: haversine distance × ₹3.5/tonne/km rate card; nearest-neighbor TSP | Deterministic estimates; ready for ML enhancement |
| 38 | Phase 08 | Docker Compose: mongo + redis + backend + frontend (nginx) | One-command full stack |
| 39 | Phase 08 | GitHub Actions CI: lint + build on PR, docker build on main | Automated quality gates |

## API Surface (complete)

| Method | Path | Auth | Phase |
|---|---|---|---|
| GET | `/api/v1/health` | none | 00 |
| POST | `/api/v1/auth/register` | none | 01 |
| POST | `/api/v1/auth/login` | none | 01 |
| POST | `/api/v1/auth/refresh` | none | 01 |
| POST | `/api/v1/auth/logout` | bearer | 01 |
| GET/PATCH | `/api/v1/users/me` | bearer | 01 |
| GET | `/api/v1/users` | admin | 01 |
| POST/GET | `/api/v1/listings` | farmer / optional | 02 |
| GET/PATCH/DELETE | `/api/v1/listings/:id` | optional / owner | 02 |
| POST | `/api/v1/listings/:id/images` | owner | 02 |
| POST/GET/PATCH | `/api/v1/fpos` | farmer / optional | 02 |
| GET | `/api/v1/farmer/me/listings` | farmer | 02 |
| GET | `/api/v1/farmer/me/fpos` | farmer | 02 |
| GET | `/api/v1/buyer/search` | optional | 03 |
| POST/GET/DELETE | `/api/v1/buyer/watchlist` | buyer | 03 |
| POST/GET/DELETE | `/api/v1/buyer/saved-searches` | buyer | 03 |
| POST | `/api/v1/buyer/listings/:id/leads` | buyer | 03 |
| GET | `/api/v1/buyer/leads` | buyer | 03 |
| GET/PATCH | `/api/v1/farmer/leads` | farmer | 03 |
| GET | `/api/v1/market/prices/latest` | none | 04 |
| GET | `/api/v1/market/prices/trends/:crop` | none | 04 |
| GET | `/api/v1/market/prices/compare` | none | 04 |
| GET | `/api/v1/market/prices/heatmap` | none | 04 |
| GET | `/api/v1/market/mandis` | none | 04 |
| GET | `/api/v1/market/mandis/geo` | none | 04 |
| POST/GET/DELETE | `/api/v1/market/alerts` | bearer | 04 |
| POST | `/api/v1/admin/prices/resync` | admin | 04 |
| POST/GET/PATCH | `/api/v1/demand` | buyer | 05 |
| GET | `/api/v1/matches/listing/:id` | optional | 05 |
| GET | `/api/v1/matches/demand/:id` | optional | 05 |
| GET | `/api/v1/matches/feed` | buyer | 05 |
| POST | `/api/v1/listings/:id/offers` | bearer | 06 |
| POST | `/api/v1/offers/:id/counter\|accept\|reject\|withdraw` | bearer | 06 |
| GET | `/api/v1/offers` | bearer | 06 |
| POST | `/api/v1/orders` | bearer | 06 |
| GET | `/api/v1/orders/me` | bearer | 06 |
| GET | `/api/v1/orders/:id` | bearer | 06 |
| POST | `/api/v1/orders/:id/confirm\|dispatch\|deliver\|complete\|cancel\|dispute` | bearer | 06 |
| POST | `/api/v1/payments/create/:id` | bearer | 06 |
| POST | `/api/v1/payments/verify` | bearer | 06 |
| GET | `/api/v1/notifications/me` | bearer | 06 |
| PATCH | `/api/v1/notifications/:id/read` | bearer | 06 |
| POST | `/api/v1/notifications/read-all` | bearer | 06 |
| GET | `/api/v1/analytics/farmer` | farmer | 07 |
| GET | `/api/v1/analytics/buyer` | buyer | 07 |
| GET | `/api/v1/analytics/admin/overview` | admin | 07 |
| GET/PATCH | `/api/v1/admin/users` | admin | 07 |
| POST | `/api/v1/admin/users/:id/block\|unblock` | admin | 07 |
| POST | `/api/v1/admin/fpos/:id/verify` | admin | 07 |
| GET | `/api/v1/admin/disputes` | admin | 07 |
| PATCH | `/api/v1/admin/disputes/:id/resolve` | admin | 07 |
| POST | `/api/v1/admin/quality/:id` | admin | 07 |
| GET | `/api/v1/admin/audit` | admin | 07 |
| GET | `/api/v1/logistics/estimate` | bearer | 07 |
| POST | `/api/v1/logistics/optimize` | bearer | 07 |

## Known Issues / TODO

- [ ] Run `npm run verify:auth` and `npm run verify:listings` with real MongoDB to close Phase 01/02 E2E
- [ ] Photo removal on edit (add-only in Phase 02)
- [ ] Real AGMARKNET/eNAM API integration (requires DATA_GOV_IN_API_KEY)
- [ ] Python ML microservice (optional — rule-based matching works without it)
- [ ] Razorpay real integration (stub works in dev)
- [ ] Email/SMS delivery (console-logged in dev)
- [ ] Finalize product name
- [ ] Add LICENSE file before making repo public
