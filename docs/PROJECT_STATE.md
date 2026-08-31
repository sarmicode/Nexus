# 🧠 PROJECT_STATE.md — Living Memory of the Project

> **The next chat session knows ONLY what is written here.** Update this file at the end of every phase (see `PROMPT.md` → Phase Completion Protocol). Last updated: **initial scaffold (Phase 00 not started)**.

## Current Snapshot

| | |
|---|---|
| **Active phase** | Phase 00 — Foundation & Repo Bootstrap |
| **Phase status** | ⬜ Not started (docs scaffold committed) |
| **App runs?** | ❌ No application code yet |
| **Deployed?** | ❌ Not yet |
| **Live URLs** | — |

## Completed Phases

_None yet._

## In Progress / Remaining Tasks

- Phase 00: everything (see `docs/phases/PHASE-00-foundation.md`).

## Environment Variables Added So Far

| Key | Service | Status |
|---|---|---|
| `PORT`, `MONGO_URI`, `JWT_SECRET`, `REDIS_URL` | backend | planned (Phase 0/1) |
| `EMAIL_API_KEY`, `SMS_API_KEY`, `PAYMENT_API_KEY`, `MAPS_API_KEY` | backend | planned (Phase 6/7) |
| `VITE_API_BASE_URL`, `VITE_MAPS_API_KEY` | frontend | planned (Phase 0) |

## Decisions Log (append-only)

| # | Date | Decision | Reason |
|---|------|----------|--------|
| 1 | scaffold | MERN stack: React+Vite / Express / MongoDB / Redis | Per architecture blueprint; team familiarity; SIH timeline |
| 2 | scaffold | Monorepo `frontend/` + `backend/` (+ `ml-service/` later) | Single repo, simpler GitHub agent workflow |
| 3 | scaffold | Build phase-by-phase across chats via `PROMPT.md` self-update cycle | Continuity between AI sessions |
| 4 | scaffold | Working name "FarmBridge" (renameable) | Placeholder — team to finalize |
| 5 | scaffold | 🚫 Agents may NEVER merge branches/PRs — merge only on the owner's explicit order in the current chat | Owner keeps full control of what lands on `main` |
| 6 | scaffold | Entire project runs on **free tiers** per `docs/FREE_TIER_PLAN.md` (Atlas M0, Upstash, Render, Vercel, Leaflet/OSM, Razorpay test, Brevo, Cloudinary) | ₹0 budget; agents must pick free options and ask before any spend |

## Known Issues / TODO

- [ ] Finalize product name
- [ ] Choose payment gateway (suggested: Razorpay test mode)
- [ ] Choose SMS/email providers (free tiers fine)
- [ ] Decide ML scope: rule-based only vs. Python microservice (Phase 5)

## API Surface Built So Far

_None yet (planned: `/api/v1/health` in Phase 0)._
