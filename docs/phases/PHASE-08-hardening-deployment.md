# 🧱 PHASE 08 — Hardening, CI & Deployment

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phases 00–07 |
| **Builds (blueprint §3)** | Quality gates · DevOps (CI, Docker, deploy) · demo readiness |

## 🎯 Objective

Ship it: tests green, security hardened, CI on every PR, one-command Docker local stack, deployed URLs, seeded demo data, and a judge-ready demo. This phase closes the project for SIH submission.

## ✅ Scope

### Testing
- [ ] Backend: Jest + Supertest — auth flow, listing CRUD + ownership, order state machine, payment verify (happy + tampered), price aggregation math
- [ ] Frontend: React Testing Library smoke tests (login, catalog renders, offer modal)
- [ ] `ml-service`: pytest for `/score` & `/forecast` with fixture data
- [ ] Test scripts wired: `npm test` all three apps; seed + test DB separate from dev

### Security hardening
- [ ] `express-mongo-sanitize`, CORS allowlist for prod domain, body limits re-checked
- [ ] Audit: every route has auth/roles as designed; no user enumerable endpoints leaking PII
- [ ] `npm audit` (backend, frontend) + `pip-audit` (ml) — zero high/critical
- [ ] Error responses scrubbed (no stacks/internals in prod); logs use levels (winston), no PII in logs
- [ ] Secrets rotated; `.env` values only in deployment dashboards; final `SECURITY.md` checklist pass

### Performance
- [ ] DB indexes reviewed vs all query patterns (`explain()` on hot queries)
- [ ] Redis cache audit (hit rates logged); pagination everywhere; images compressed on upload (sharp, optional)

### Docker & CI
- [ ] `backend/Dockerfile`, `frontend/Dockerfile` (or static build), `ml-service/Dockerfile`
- [ ] `docker-compose.yml` — backend, mongo, redis, ml-service (+ frontend) — one command up
- [ ] GitHub Actions: `.github/workflows/ci.yml` — on PR: lint + test (backend/frontend/ml), on main: build images

### Deployment
- [ ] Backend → Render free tier (with Mongo Atlas M0 + Upstash Redis free); frontend → Vercel; ml-service → Render free / Hugging Face Spaces (or skip if `USE_ML=false`) — full free-tier map in `docs/FREE_TIER_PLAN.md`
- [ ] Prod env set in dashboards; CORS + `VITE_API_BASE_URL` point to real URLs; webhooks configured (Razorpay)
- [ ] Health checks up; custom domain optional
- [ ] `docs/DEPLOYMENT.md` — exact steps, env matrix, rollback note

### Demo & submission readiness
- [ ] `backend/src/seeders/demo.js` — demo world: 1 admin, 4 farmers (2 FPO), 3 buyers (wholesaler/processor/consumer), 12 lots, price history 90 days, 3 orders in different states; `npm run seed:demo`
- [ ] Demo credentials in `README` (seeded-only) & demo script: problem → price discovery → match → transaction
- [ ] 3-min demo video script + screen-record; screenshots in `docs/screenshots/`
- [ ] README final polish: live links, screenshots, architecture image, team; LICENSE added; tag `v1.0.0`

## 🧪 Acceptance Criteria

- [ ] `npm test` green across backend & frontend; pytest green in ml-service
- [ ] CI passes on a fresh PR (visible on GitHub)
- [ ] `docker compose up` → whole stack healthy on one machine
- [ ] Live URLs: frontend loads, health OK, demo login works, one full demo transaction recorded on video
- [ ] Zero high/critical audit findings; SECURITY.md checklist fully ✅
- [ ] `docs/DEPLOYMENT.md` complete enough that a teammate can redeploy from scratch
- [ ] Repo tagged `v1.0.0`; README shows live demo link + team

## 📦 Suggested Commits

```
test: backend integration and frontend smoke tests
chore(security): sanitize, audit fixes and header hardening
chore(docker): dockerfiles and compose stack
ci: github actions lint and test pipeline
chore(deploy): deploy configs and deployment docs
docs: seed data, demo script, final readme, v1.0.0
```

## 🏁 End of Phase

Run the Phase Completion Protocol one final time — in the regenerated `PROMPT.md`, set **Active phase** to `— PROJECT COMPLETE —` with a maintenance note (bug fixes → `fix/*` branches, RULES still apply). 🎉
