# 🧠 PROJECT_STATE.md — Living Memory of the Project

> **The next chat session knows ONLY what is written here.** Update this file at the end of every phase (see `PROMPT.md` → Phase Completion Protocol). Last updated: **2026-09-01 (Phase 03 built, DB E2E pending)**.

## Current Snapshot

| | |
|---|---|
| **Active phase** | Phase 03 — Buyer Module (Discovery, Compare & Watchlist) |
| **Phase status** | 🟡 PARTIAL — code complete (backend + frontend), lint/build clean; DB-dependent acceptance criteria pending a reachable MongoDB (same egress blocker as Phases 01–02) |
| **App runs?** | ✅ Yes — backend `:5000` + frontend `:5173` (catalog/buyer/farmer pages render; data APIs need MongoDB) |
| **Deployed?** | ❌ Not yet (Phase 08) |
| **Live URLs** | — |
| **Session branch** | `arena/01a05c25-nexus` (Arena-pinned; NOT merged — owner's call) |

## Completed Phases

| Phase | Completed | Summary |
|---|---|---|
| 00 — Foundation & Repo Bootstrap | 2026-08-31 | Express 5 gateway, `GET /api/v1/health`, fail-fast env config, Mongo retry-on-start, `ApiError`/`asyncHandler`, Vite 6 + React 19 shell, ESLint 10 + Prettier, env templates. All acceptance criteria verified by running. |

## In Progress / Remaining Tasks

- **Phase 01 (🟡) — remaining:** DB-dependent E2E verification. Blocker: the build sandbox's egress allowlist blocks MongoDB's CDN (`fastdl.mongodb.org`), so no `mongod` binary is obtainable there (npm "prebuilt" packages download from the same CDN). On any machine with normal internet:
  1. start a real MongoDB (local, Atlas M0, or `cd backend && npm run dev:db` — in-memory dev server),
  2. `cd backend && npm run seed:admin` (needs `ADMIN_PHONE`/`ADMIN_PASSWORD` in `backend/.env`),
  3. `cd backend && npm run verify:auth` → all PASS,
  4. tick the Phase 01 acceptance boxes, set `✅ DONE`, run the Phase Completion Protocol (handoff to Phase 02).
- **Phase 02 (🟡) — remaining:** DB-dependent E2E verification (identical blocker):
  1. a reachable MongoDB (as above),
  2. `cd backend && npm run verify:listings` → all PASS (this is the committed Phase 02 acceptance matrix),
  3. tick the Phase 02 acceptance boxes, set `✅ DONE`, run the Phase Completion Protocol (handoff to Phase 03).
- **Phase 03 (🟡) — remaining:** DB-dependent E2E verification (identical blocker):
  1. a reachable MongoDB (as above),
  2. `cd backend && npm run verify:buyer` → all PASS (this is the committed Phase 03 acceptance matrix),
  3. tick the Phase 03 acceptance boxes, set `✅ DONE`, run the Phase Completion Protocol (handoff to Phase 04 — Market Intelligence).

## Environment Variables Added So Far

| Key | Service | Status |
|---|---|---|
| `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET` | backend | ✅ live (Phase 00) |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | backend | ✅ live (Phase 01) — defaults `15m` / `7d` (s/m/h/d or bare seconds) |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | backend | ✅ live (Phase 01) — `npm run seed:admin` |
| `REDIS_URL` | backend | ✅ in config, unused until Phase 04 |
| `CORS_ORIGIN` | backend | ✅ live (Phase 00) — production allowlist |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | backend | ✅ live (Phase 00) — API-wide limiter (100 / 15 min default) |
| `EMAIL_API_KEY`, `SMS_API_KEY`, `PAYMENT_API_KEY`, `MAPS_API_KEY` | backend | planned (Phase 6/7) |
| `VITE_API_BASE_URL`, `VITE_MAPS_API_KEY` | frontend | ✅ live (Phase 00) — base is `/api/v1` (versioned root) |

> Phase 02 adds **no new env keys** (uploads use local disk in dev; Cloudinary comes with Phase 08 deployment).

## Decisions Log (append-only)

| # | Date | Decision | Reason |
|---|------|----------|--------|
| 1 | scaffold | MERN stack: React+Vite / Express / MongoDB / Redis | Per architecture blueprint; team familiarity; SIH timeline |
| 2 | scaffold | Monorepo `frontend/` + `backend/` (+ `ml-service/` later) | Single repo, simpler GitHub agent workflow |
| 3 | scaffold | Build phase-by-phase across chats via `PROMPT.md` self-update cycle | Continuity between AI sessions |
| 4 | scaffold | Working name "FarmBridge" (renameable) | Placeholder — team to finalize |
| 5 | scaffold | 🚫 Agents may NEVER merge branches/PRs — merge only on the owner's explicit order in the current chat | Owner keeps full control of what lands on `main` |
| 6 | scaffold | Entire project runs on **free tiers** per `docs/FREE_TIER_PLAN.md` | ₹0 budget; agents must pick free options and ask before any spend |
| 7 | Phase 00 | Phase 00 work pushed to **`arena/01a05757-nexus`** instead of `phase/00-foundation` | Arena session pinned to that branch; no merge performed — branch ready for owner |
| 8 | Phase 00 | `VITE_API_BASE_URL=/api/v1` (relative, versioned root) + Vite dev proxy `/api` → `http://localhost:5000` | One config works for local dev and sandbox/preview hosts; services call version-relative paths |
| 9 | Phase 00 | `.env.example` ships with local dev defaults (no real secrets); config fails fast on missing/empty `MONGO_URI`/`JWT_SECRET` and rejects the dev JWT placeholder in production | Quick start works zero-config while SECURITY.md's "no real values committed" holds |
| 10 | Phase 00 | CORS: production enforces `CORS_ORIGIN` allowlist; development reflects the request origin | Dev/proxy/preview hosts vary per session; prod stays strict |
| 11 | Phase 00 | Rate limiting is API-wide on `/api/v1` (100/15 min default, env-tunable) | Abuse protection from day one |
| 12 | Phase 00 | Health endpoint returns `data: { status, uptime, ts, db }` | Mongo absence never blocks boot; demo-day readiness visible |
| 13 | Phase 00 | Deps: Express 5.2, Mongoose 9.9, Vite 6.4 + React 19.2 + react-router 7, ESLint 10 flat config, Prettier 3 | Current stable majors (2026-08-31); Vite 8 (rolldown) deliberately skipped |
| 14 | Phase 00 | Vite `server.allowedHosts: true` (dev only) | Preview hostname is dynamic per session; prod (Vercel) doesn't use the dev server |
| 15 | Phase 01 | Token design: short-lived JWT access (HS256, 15 m, `type: "access"`) + opaque rotating refresh tokens (48-byte random, 7 d, **SHA-256 hash stored**, single-use rotation, TTL index, wiped on logout) | A DB leak cannot be converted into usable sessions; rotation bounds a stolen refresh token's life to one use |
| 16 | Phase 01 | Tokens stored in localStorage (access + refresh) | Pure SPA can't do real httpOnly cookies without a server cookie flow; mitigations: refresh only ever sent to `/auth/refresh`, rotates every use, dies on logout. Revisit if cookie sessions are ever required |
| 17 | Phase 01 | Admins are created ONLY by `npm run seed:admin` (env-driven); register accepts farmer/buyer only; `GET /users` added as the minimal admin-only route | Self-registration can't mint admins; an admin-only route is required for the 403 acceptance criterion and feeds Phase 07 |
| 18 | Phase 01 | Dev-only `npm run dev:db` (mongodb-memory-server) + committed `npm run verify:auth` acceptance script (backend/scripts/verify-auth.js) | Sandboxes/CI without mongod still get a runnable stack and a one-command acceptance matrix |
| 19 | Phase 01 | Auth-specific strict limiter (10/15 min per IP) on register/login/refresh, on top of the API-wide limiter | Brute-force protection per SECURITY.md; verified live (429 on 11th attempt) |
| 20 | Phase 01 | DB-down requests return a clean 500 `INTERNAL_ERROR` "Database temporarily unavailable" (no driver/collection internals); `bufferTimeoutMS: 3000` | SECURITY.md: no internals leaked; fast failure instead of 10 s hangs |
| 21 | Phase 02 | Listing image storage = local `backend/uploads/listings/` (Multer), served at `/uploads` + Vite `/uploads` proxy; deployed envs swap to Cloudinary free tier | Render disk is ephemeral (FREE_TIER_PLAN); local disk is fine for dev/demo |
| 22 | Phase 02 | Listings soft-delete via a `deletedAt` timestamp (all queries filter `deletedAt: null`); `DELETE` also sets `status: draft` | Preserves history for Phase 07 analytics/admin; hides retired lots from the market |
| 23 | Phase 02 | Crop names stored trimmed + lowercased (title-cased in the UI); canonical crop list in `backend/common/constants/crops.js`, mirrored in `frontend/src/data/crops.js` — keep in sync | Consistent filtering; one source each side of the stack |
| 24 | Phase 02 | `Fpo.createdBy` added (not in the original field list) to power owner-only `PATCH /fpos/:id`; a listing may only attach one of the farmer's own FPOs | Ownership/authorization needs an owner; prevents attaching another farmer's FPO |
| 25 | Phase 02 | Added `GET /farmer/me/fpos` (own FPOs) and `GET /fpos/:id` (detail) beyond the original `POST/GET /fpos, PATCH /fpos/:id` | The listing form needs the caller's FPOs; the seller card needs an FPO lookup |
| 26 | Phase 02 | `GET /listings` & `GET /listings/:id` use `authenticateOptional`: public by default, but a valid token gets `isOwner` + draft visibility; drafts hidden from anonymous view | Public marketplace + owner tooling on the same endpoints |
| 27 | Phase 02 | Upload rules: jpg/png/webp only (MIME), ≤ 3 MB each, ≤ 5 per request AND ≤ 5 total on a listing; random filenames with extension derived from the whitelisted MIME type (never the client filename) | SECURITY.md upload policy; no extension spoofing |
| 28 | Phase 02 | `npm run verify:listings` — committed E2E acceptance matrix (backend/scripts/verify-listings.js) mirroring `verify:auth` | One-command acceptance for Phase 02; sandboxes/CI parity |
| 29 | Phase 03 | Search is a dedicated `GET /listings/search` (not overloading `/listings`); `q` regex-matches crop, variety and `location.district`, layered on the existing `buildFilter`. Added `qtyAsc`/`qtyDesc` to the shared sort map | Clean buyer-facing search surface; `q` is full-text-ish, exact filters stay on `/listings` |
| 30 | Phase 03 | Lead (RFQ) stores `quantityWanted` (Number) + `quantityUnit` (enum) rather than a nested quantity object | The RFQ form sends a plain amount + unit; keeps the model flat |
| 31 | Phase 03 | Anti-spam: lead creation under a strict 10/15-min per-IP limiter (mirrors Phase 01 auth limiter) + a 24 h duplicate-lead window (one buyer+listing) → 409 | Blocks enquiry spam while keeping the RFQ flow frictionless |
| 32 | Phase 03 | Lead status changes are farmer/admin-only, via a new `requireLeadOwner` middleware (loads the lead, verifies the target listing's `farmerId`); `GET /leads/me` added for the buyer's own enquiries | Buyer Dashboard needs the buyer's RFQs; one authorization path for the inbox |
| 33 | Phase 03 | Compare is purely a frontend concern (CompareTable): the API returns listings, the client builds the side-by-side & unit-normalizes price to ₹/kg; "mandi modal price" column is a Phase 4 placeholder | No duplication of listing data; comparison is presentation logic |
| 34 | Phase 03 | Saved searches store a loose `query` record (the exact `/listings/search` params) so the search can be recreated from the URL query string; `alertsEnabled` is stored now, used by Phase 4 | Phase 3 acceptance: "saved search recreated from URL query" |
| 35 | Phase 03 | Watchlist + saved-searches are available to any authenticated user (not buyer-only); **RFQ creation** is buyer-role-gated. Watchlist unique per buyer+listing | A farmer may also shortlist/research buyers; the RFQ itself is a buyer action |
| 36 | Phase 03 | `.content` width widened to 1000px (narrow cards keep their own max-width, so auth/profile pages stay centered) | The catalog + compare need a wider canvas than the original 760px |
| 37 | Phase 03 | `npm run verify:buyer` — committed E2E acceptance matrix (backend/scripts/verify-buyer.js) mirroring the prior verify scripts | One-command acceptance for Phase 03; sandboxes/CI parity |

## Known Issues / TODO

- [ ] **Close Phase 01:** run `npm run verify:auth` against a real MongoDB (see Remaining Tasks) — blocked in the build sandbox by egress (MongoDB CDN unreachable)
- [ ] **Close Phase 02:** run `npm run verify:listings` against a real MongoDB — same blocker
- [ ] **Close Phase 03:** run `npm run verify:buyer` against a real MongoDB — same blocker
- [ ] **Merge the Arena session branches into `main`** — owner's action; nothing has been merged. Phases 00–03 work lives on the Arena-pinned branches (`arena/01a05757-nexus`, `arena/01a05bc9-nexus`, `arena/01a05c25-nexus`); all are NOT merged.
- [ ] Photo removal on edit is add-only in Phase 2 (deleting an individual image lands with a later phase)
- [ ] Lead dedupe window is fixed at 24 h (hard-coded) and the lead limiter window/count are hard-coded (10/15 min) like the Phase 01 auth limiter — make env-tunable in a later hardening pass if needed
- [ ] `alertsEnabled` on saved searches is stored but not yet acted on (Phase 4 wires price alerts)
- [ ] Finalize product name
- [ ] Choose payment gateway (suggested: Razorpay test mode)
- [ ] Choose SMS/email providers (free tiers fine)
- [ ] Decide ML scope: rule-based only vs. Python microservice (Phase 5)

## Verification Ledger (what has actually been run)

| Verified | How | When |
|---|---|---|
| Health envelope, Helmet + `RateLimit-*` headers, 404/400/429 envelopes, Vite proxy path | live curl + browser-preview path | Phase 00 close |
| Auth strict limiter: 429 on 11th attempt, `RateLimit: limit=10;w=900` headers on `/auth/*` | live curl | Phase 01 build |
| Validation 400s (phone format, password length, field paths), 401 no-token, clean 500 on DB-down | live curl | Phase 01 build |
| JWT error paths: no token → 401, garbage → 401, **expired access → 401 "Access token expired"**, missing `type: "access"` → 401 | live curl with crafted signed JWTs | Phase 01 re-check |
| bcrypt cost-10 hash/compare round-trip | node script | Phase 01 build |
| `npm audit` — **0 vulnerabilities** in backend and frontend | npm | Phase 01 re-check |
| Lint (ESLint 10 + Prettier) + production build in both apps | npm scripts | every commit |
| **Phase 02:** zod validators (fixed-price rule, negotiable-no-price, query coercion, id guard), `isAllowedImageMime`, `buildFilter` | node unit checks (no DB) | Phase 02 build |
| **Phase 02:** live curl — `POST /listings` no-token/garbage-token → 401, bad `:id` → 400 `VALIDATION_ERROR`, public `GET /listings` with DB down → clean 500 envelope, 404 catch-all, `/uploads` static route | live curl | Phase 02 build |
| **Phase 02:** Vite `/api` + `/uploads` proxy confirmed live (health via proxy → 200); SPA deep-link serves index | live curl | Phase 02 build |
| **NOT yet verifiable here (Phase 02):** create listing + image upload round-trip, 403 RBAC on listings/fpos, pagination, dashboard stats, upload rejections live, image content-type | — | closes via `npm run verify:listings` |
| **Phase 03 lint/build:** ESLint 10 + Prettier + production build clean in both apps; `docs/postman/marketplace.json` (16 requests) validates | npm scripts | Phase 03 build |
| **Phase 03 unit checks (no DB):** `buildSearchFilter` (`q` → `$or` on crop/variety/district atop `buildFilter`), `searchListingsQuery` coercion (sort/page/limit), `createLeadSchema` (qty/price coercion + invalid-body rejection), `addWatchlistSchema` (id), `createSavedSearchSchema` (query record) | node scripts | Phase 03 build |
| **Phase 03 live curl (DB down):** public `GET /listings/search` → clean 500 `INTERNAL_ERROR` envelope; `POST /listings/:id/leads`, `/watchlist`, `/saved-searches`, `/leads/me`, `PATCH /leads/:id` all → 401 without token; 404 catch-all `/nope`; Vite `/api` proxy (health → 200) + `/catalog` SPA deep-link → 200 | live curl + Vite proxy | Phase 03 build |
| **NOT yet verifiable here (Phase 03):** search hits/sort correctness, RFQ inbox round-trip, watchlist persist, saved-search re-run, 409 dup lead/watchlist, 403 RBAC on leads | — | closes via `npm run verify:buyer` |

## API Surface Built So Far

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/v1/health` | none | `{ success, data: { status, uptime, ts, db } }` |
| POST | `/api/v1/auth/register` | none (strict limiter) | farmer/buyer only → 201 `{ user, accessToken, refreshToken }` |
| POST | `/api/v1/auth/login` | none (strict limiter) | phone **or** email + password → `{ user, accessToken, refreshToken }` |
| POST | `/api/v1/auth/refresh` | none (strict limiter) | body `{ refreshToken }` → rotated pair |
| POST | `/api/v1/auth/logout` | bearer | wipes all refresh tokens for the user |
| GET | `/api/v1/users/me` | bearer | public user (no passwordHash) |
| PATCH | `/api/v1/users/me` | bearer | partial: name / language / location |
| GET | `/api/v1/users` | bearer + `admin` | paginated `{ users, total, page, limit }` |
| POST | `/api/v1/listings` | bearer + `farmer` | create listing → 201 |
| GET | `/api/v1/listings` | optional | public filters `crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit` → `{ items, page, limit, total, totalPages }` |
| GET | `/api/v1/listings/:id` | optional | public detail; drafts owner/admin-only; `isOwner` when authed |
| PATCH | `/api/v1/listings/:id` | bearer + owner | partial update |
| DELETE | `/api/v1/listings/:id` | bearer + owner | soft-delete |
| POST | `/api/v1/listings/:id/images` | bearer + owner | multipart `images[]` (≤5, jpg/png/webp, ≤3 MB) |
| GET | `/api/v1/farmer/me/listings` | bearer + `farmer` | own listings (any status) + `stats { active, sold, avgPrice }` |
| GET | `/api/v1/farmer/me/fpos` | bearer + `farmer` | own FPOs |
| POST | `/api/v1/fpos` | bearer + `farmer` | create FPO |
| GET | `/api/v1/fpos` | optional | public list (district/state filters + pagination) |
| GET | `/api/v1/fpos/:id` | optional | FPO detail |
| PATCH | `/api/v1/fpos/:id` | bearer + owner | update FPO (verify lands in Phase 7) |
| GET | `/api/v1/listings/search` | optional | buyer search `q` across crop/variety/district + filters + sort (+`qtyAsc`/`qtyDesc`) + pagination → `{ items, page, limit, total, totalPages }` |
| POST | `/api/v1/watchlist` | bearer | add `{ listingId, note? }` (409 dup, 404 missing) |
| GET | `/api/v1/watchlist` | bearer | paginated watchlist (populated listing) |
| DELETE | `/api/v1/watchlist/:listingId` | bearer | remove entry |
| POST | `/api/v1/saved-searches` | bearer | `{ query, alertsEnabled? }` |
| GET | `/api/v1/saved-searches` | bearer | paginated saved searches |
| DELETE | `/api/v1/saved-searches/:id` | bearer + owner | delete |
| POST | `/api/v1/listings/:id/leads` | bearer + `buyer` | send RFQ `{ message, quantityWanted, quantityUnit, priceOffered? }` (24 h dedupe → 409; strict limiter) |
| GET | `/api/v1/farmer/me/leads` | bearer + `farmer` | farmer enquiry inbox (paginated, optional status filter) |
| GET | `/api/v1/leads/me` | bearer + `buyer` | buyer's own enquiries (paginated) |
| PATCH | `/api/v1/leads/:id` | bearer + owner/admin | move status `new|contacted|converted|dropped` |
