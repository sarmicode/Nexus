# 🧱 PHASE 00 — Foundation & Repo Bootstrap

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Nothing (start here) |
| **Builds (blueprint §3)** | Repo skeleton, API gateway skeleton, tooling |

## 🎯 Objective

A running monorepo with an Express API skeleton, a Vite React shell, working linting, env templates, and docs wired into the phase workflow — so every later phase just adds modules.

## ✅ Scope

### Backend (`backend/`)
- [ ] `npm init` + deps: `express mongoose dotenv cors helmet morgan compression express-rate-limit`
- [ ] Dev deps: `nodemon eslint prettier`
- [ ] `src/server.js` — Express app: helmet, CORS (allow `http://localhost:5173`), morgan logging, rate limiter, JSON body limit (1 MB), central error handler, 404 catch-all
- [ ] `GET /api/v1/health` → `{ success: true, data: { status: "ok", uptime, ts } }`
- [ ] `src/config/index.js` reads & validates `.env` (fail fast if `MONGO_URI`/`JWT_SECRET` missing)
- [ ] Folders per blueprint §1: `config/ controllers/ models/ routes/ middleware/ services/ validators/`
- [ ] `common/constants/` + `common/utils/` created; add `ApiError` helper + async route wrapper
- [ ] `.env.example` with all keys from blueprint §6 (values blank)
- [ ] Mongo connection helper with retry-on-start logs (local MongoDB or Atlas free tier)
- [ ] `npm run dev` (nodemon) + `npm run lint`

### Frontend (`frontend/`)
- [ ] Scaffold Vite React app; folders: `assets/ components/ pages/ services/ context/ utils/`
- [ ] Shared axios instance in `services/api.js` using `VITE_API_BASE_URL`, with response-error normalizer
- [ ] Placeholder layout (navbar + outlet) and a health-check ping to the backend shown on the home page
- [ ] ESLint + Prettier; `.env.example` (`VITE_API_BASE_URL`, `VITE_MAPS_API_KEY`)
- [ ] `npm run dev` serves on `:5173` with zero console errors

### Repo & tooling
- [ ] `.editorconfig`; confirm `.gitignore` covers env/node_modules/dist/uploads
- [ ] Push to GitHub `main`; verify README quick start from a clean clone
- [ ] `backend/uploads/.gitkeep`

## 🚫 Out of Scope

Auth, models other than health, UI design system, Docker, CI (later phases).

## 🧪 Acceptance Criteria

- [ ] Clean clone → backend `npm install && npm run dev` → `GET localhost:5000/api/v1/health` returns ok JSON
- [ ] Clean clone → frontend `npm run dev` → page loads and shows backend health status
- [ ] `npm run lint` passes in both apps
- [ ] Folder tree matches blueprint §1; `.env.example` present in both apps, `.env` not committed
- [ ] Helmet + rate limiter active (verify response headers)
- [ ] All work committed & pushed to branch `phase/00-foundation` — **NOT merged** (merge only on the owner's explicit order)

## 📦 Suggested Commits

```
chore: scaffold backend with express gateway and health endpoint
chore: scaffold vite react frontend with axios service layer
chore: add eslint, prettier, editorconfig and env examples
docs: close phase 00
```

## 🏁 End of Phase

Run the **Phase Completion Protocol** in `PROMPT.md` (steps 1–8), then hand off to **Phase 01 — Auth & Users**.
