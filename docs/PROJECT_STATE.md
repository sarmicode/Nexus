# 🧠 PROJECT_STATE.md — Living Memory of the Project

> **The next chat session knows ONLY what is written here.** Update this file at the end of every phase (see `PROMPT.md` → Phase Completion Protocol). Last updated: **2026-08-31 (Phase 00 complete)**.

## Current Snapshot

| | |
|---|---|
| **Active phase** | Phase 01 — Authentication & User Management |
| **Phase status** | ⬜ Not started (Phase 00 ✅ complete, ready for merge) |
| **App runs?** | ✅ Yes — backend `:5000` + frontend `:5173` via README quick start |
| **Deployed?** | ❌ Not yet (Phase 08) |
| **Live URLs** | — |
| **Session branch** | `arena/01a05757-nexus` (Arena-pinned session branch; NOT merged — owner's call) |

## Completed Phases

| Phase | Completed | Summary |
|---|---|---|
| 00 — Foundation & Repo Bootstrap | 2026-08-31 | Express 5 gateway (helmet, CORS, morgan, compression, rate limit, 1 MB body limit, central error handler, 404 catch-all), `GET /api/v1/health`, fail-fast env config, Mongo retry-on-start helper, `ApiError` + `asyncHandler`, Vite 6 + React 19 shell (navbar/outlet layout, axios service layer with error normalizer, live health ping page), ESLint 10 + Prettier in both apps, env templates, `.editorconfig`, `.gitignore`. Verified: health JSON, Helmet + `RateLimit-*` headers, 429 envelope, 404 envelope, Vite proxy `/api` → `:5000`, production build. |

## In Progress / Remaining Tasks

- Phase 01: everything (see `docs/phases/PHASE-01-auth-users.md`).

## Environment Variables Added So Far

| Key | Service | Status |
|---|---|---|
| `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET` | backend | ✅ live (Phase 00) |
| `REDIS_URL` | backend | ✅ in config, unused until Phase 04 |
| `CORS_ORIGIN` | backend | ✅ live (Phase 00) — production allowlist |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | backend | ✅ live (Phase 00) — API-wide limiter (100 / 15 min default) |
| `EMAIL_API_KEY`, `SMS_API_KEY`, `PAYMENT_API_KEY`, `MAPS_API_KEY` | backend | planned (Phase 6/7) |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | backend | planned (Phase 01 admin seed) |
| `VITE_API_BASE_URL`, `VITE_MAPS_API_KEY` | frontend | ✅ live (Phase 00) — base is `/api/v1` (versioned root) |

## Decisions Log (append-only)

| # | Date | Decision | Reason |
|---|------|----------|--------|
| 1 | scaffold | MERN stack: React+Vite / Express / MongoDB / Redis | Per architecture blueprint; team familiarity; SIH timeline |
| 2 | scaffold | Monorepo `frontend/` + `backend/` (+ `ml-service/` later) | Single repo, simpler GitHub agent workflow |
| 3 | scaffold | Build phase-by-phase across chats via `PROMPT.md` self-update cycle | Continuity between AI sessions |
| 4 | scaffold | Working name "FarmBridge" (renameable) | Placeholder — team to finalize |
| 5 | scaffold | 🚫 Agents may NEVER merge branches/PRs — merge only on the owner's explicit order in the current chat | Owner keeps full control of what lands on `main` |
| 6 | scaffold | Entire project runs on **free tiers** per `docs/FREE_TIER_PLAN.md` (Atlas M0, Upstash, Render, Vercel, Leaflet/OSM, Razorpay test, Brevo, Cloudinary) | ₹0 budget; agents must pick free options and ask before any spend |
| 7 | Phase 00 | Phase 00 work pushed to **`arena/01a05757-nexus`** instead of `phase/00-foundation` | Arena session is pinned to that branch (cannot create/push others); no merge performed — branch ready for owner |
| 8 | Phase 00 | `VITE_API_BASE_URL=/api/v1` (relative, versioned root) + Vite dev proxy `/api` → `http://localhost:5000` | Relative URL + proxy works for local dev **and** sandbox/preview hosts with one config (browser never calls `localhost` directly); supersedes blueprint §6 example value `http://localhost:5000/api` — services call version-relative paths (`/health`, `/users/…`) |
| 9 | Phase 00 | `.env.example` ships with **local dev defaults** (no real secrets); config still fails fast on missing/empty `MONGO_URI`/`JWT_SECRET`, and rejects the dev `JWT_SECRET` placeholder when `NODE_ENV=production` | README quick start must work zero-config (RULES.md §3) while SECURITY.md's "no real values committed" holds — dev placeholders are not credentials |
| 10 | Phase 00 | CORS: production enforces `CORS_ORIGIN` allowlist; development reflects the request origin | Dev/proxy/preview hosts vary per session; prod stays strict per SECURITY.md |
| 11 | Phase 00 | Rate limiting is API-wide on `/api/v1` (100 req / 15 min default, env-tunable); Phase 01 adds a stricter auth-specific limiter | Abuse protection from day one; auth routes need tighter limits per SECURITY.md |
| 12 | Phase 00 | Health endpoint returns `data: { status, uptime, ts, db }` — `db` added beyond the spec | Lets the UI (and demo-day checklist) show Mongo readiness; Mongo absence never blocks boot (retry-on-start, 5×3 s) |
| 13 | Phase 00 | Deps: Express 5.2, Mongoose 9.9, Vite 6.4 + React 19.2 + react-router 7, ESLint 10 flat config (ESLint 9 is deprecated), Prettier 3 | Current stable majors as of 2026-08-31; Vite 8 (rolldown) deliberately skipped for stability |
| 14 | Phase 00 | Vite `server.allowedHosts: true` (dev only) | Sandbox/preview hostname is dynamic per session (`{port}-{sandboxId}.e2b.app`); can't be allowlisted statically. Production deploy (Vercel, Phase 08) doesn't use the dev server |

## Known Issues / TODO

- [ ] **Merge `arena/01a05757-nexus`** (Phase 00) into `main` — owner's action; nothing has been merged
- [ ] No local MongoDB in the build sandbox — health shows `db: "disconnected"` here; connect a real Mongo (local or Atlas M0) before Phase 01
- [ ] Finalize product name
- [ ] Choose payment gateway (suggested: Razorpay test mode)
- [ ] Choose SMS/email providers (free tiers fine)
- [ ] Decide ML scope: rule-based only vs. Python microservice (Phase 5)

## API Surface Built So Far

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/v1/health` | none | `{ success: true, data: { status: "ok", uptime, ts, db } }` |
