# 🧱 PHASE 00 — Foundation & Repo Bootstrap

| | |
|---|---|
| **Status** | ✅ DONE (2026-08-31) |
| **Depends on** | Nothing (start here) |
| **Builds (blueprint §3)** | Repo skeleton, API gateway skeleton, tooling |

## 🎯 Objective

A running monorepo with an Express API skeleton, a Vite React shell, working linting, env templates, and docs wired into the phase workflow — so every later phase just adds modules.

## ✅ Scope

### Backend (`backend/`)
- [x] `npm init` + deps: `express mongoose dotenv cors helmet morgan compression express-rate-limit`
- [x] Dev deps: `nodemon eslint prettier`
- [x] `src/server.js` — Express app: helmet, CORS (allow `http://localhost:5173`), morgan logging, rate limiter, JSON body limit (1 MB), central error handler, 404 catch-all
- [x] `GET /api/v1/health` → `{ success: true, data: { status: "ok", uptime, ts } }` (also reports `db` state)
- [x] `src/config/index.js` reads & validates `.env` (fail fast if `MONGO_URI`/`JWT_SECRET` missing)
- [x] Folders per blueprint §1: `config/ controllers/ models/ routes/ middleware/ services/ validators/`
- [x] `common/constants/` + `common/utils/` created; add `ApiError` helper + async route wrapper
- [x] `.env.example` with all keys from blueprint §6 (values blank)
- [x] Mongo connection helper with retry-on-start logs (local MongoDB or Atlas free tier)
- [x] `npm run dev` (nodemon) + `npm run lint`

### Frontend (`frontend/`)
- [x] Scaffold Vite React app; folders: `assets/ components/ pages/ services/ context/ utils/`
- [x] Shared axios instance in `services/api.js` using `VITE_API_BASE_URL`, with response-error normalizer
- [x] Placeholder layout (navbar + outlet) and a health-check ping to the backend shown on the home page
- [x] ESLint + Prettier; `.env.example` (`VITE_API_BASE_URL`, `VITE_MAPS_API_KEY`)
- [x] `npm run dev` serves on `:5173` with zero console errors

### Repo & tooling
- [x] `.editorconfig`; confirm `.gitignore` covers env/node_modules/dist/uploads
- [x] Push to GitHub `main`; verify README quick start from a clean clone
- [x] `backend/uploads/.gitkeep`

## 🚫 Out of Scope

Auth, models other than health, UI design system, Docker, CI (later phases).

## 🧪 Acceptance Criteria

- [x] Clean clone → backend `npm install && npm run dev` → `GET localhost:5000/api/v1/health` returns ok JSON
- [x] Clean clone → frontend `npm run dev` → page loads and shows backend health status
- [x] `npm run lint` passes in both apps
- [x] Folder tree matches blueprint §1; `.env.example` present in both apps, `.env` not committed
- [x] Helmet + rate limiter active (verify response headers)
- [x] All work committed & pushed to branch `phase/00-foundation` — **NOT merged** (merge only on the owner's explicit order)

> **Branch note (2026-08-31):** this session was pinned by the Arena platform to branch
> `arena/01a05757-nexus` (branched from `main`), so the phase work was pushed to that session
> branch instead of `phase/00-foundation`. Nothing was merged — the branch is ready for the
> owner to merge/rename. See `docs/PROJECT_STATE.md` decision #7.

## 📦 Suggested Commits

```
chore: scaffold backend with express gateway and health endpoint
chore: scaffold vite react frontend with axios service layer
chore: add eslint, prettier, editorconfig and env examples
docs: close phase 00
```

## 🏁 End of Phase

Run the **Phase Completion Protocol** in `PROMPT.md` (steps 1–8), then hand off to **Phase 01 — Auth & Users**. ✅ Protocol executed 2026-08-31 (see `docs/PHASE_LOG.md`).
