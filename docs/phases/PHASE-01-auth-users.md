# 🧱 PHASE 01 — Authentication & User Management

| | |
|---|---|
| **Status** | 🟡 PARTIAL (2026-08-31) — fully implemented & lint/build-verified; DB-dependent E2E verification pending (no MongoDB reachable from the build sandbox) |
| **Depends on** | Phase 00 |
| **Builds (blueprint §3)** | Authentication, User Service (roles) |

## 🎯 Objective

Full JWT auth with **role-based access (Farmer / Buyer / Admin)**, user profiles, and frontend auth flow — the trust layer every other module depends on.

## ✅ Scope

### Backend
- [x] `User` model: `name, phone (unique), email (unique, optional), passwordHash, role: farmer|buyer|admin, language (default 'en'), location { village, district, state, geo: [lat, lng] }, isFpoMember, fpoId, status: active|blocked, timestamps`
- [x] Indexes: phone, email, role; `bcrypt` cost 10 in model hook
- [x] Endpoints (`/api/v1/auth`, `/api/v1/users`):
  - [x] `POST /auth/register` (role selectable: farmer|buyer only) — validate phone (Indian 10-digit), password ≥ 8 chars
  - [x] `POST /auth/login` (phone or email + password) → access token (15 min) + refresh token (7 d)
  - [x] `POST /auth/refresh`, `POST /auth/logout`
  - [x] `GET /users/me` (auth), `PATCH /users/me` (profile, location, language)
  - [x] Admin seed script: creates first admin from env (`ADMIN_PHONE`, `ADMIN_PASSWORD`)
- [x] `middleware/auth.js` (verify JWT) + `middleware/roles.js` (`requireRole('admin')` etc.)
- [x] Strict rate limits on `/auth/login|register|refresh` (10/15 min per IP)
- [x] Validators (zod) on every route; consistent error envelope from Phase 0 helper
- [x] Postman collection `docs/postman/auth.json` committed

### Frontend
- [x] Pages: Login, Register (role toggle Farmer/Buyer), with client-side validation + server error display
- [x] `AuthContext` + `UserContext`: login/logout, token storage (localStorage; httpOnly cookie flow out of scope for an SPA — logged in decisions), `isAuthed`, `role`
- [x] Axios interceptors: attach bearer; on 401 → one silent refresh → retry, else logout
- [x] `ProtectedRoute` + `RoleRoute` components; navbar adapts to role; profile page (edit location/language)
- [x] Registration captures district/state (dropdown) + optional geo ("use my location")

## 🚫 Out of Scope

OTP login, FPO CRUD (Phase 2), any listings.

## 🧪 Acceptance Criteria

- [ ] Register → login → `GET /users/me` round-trip works for farmer and buyer roles — **implemented; E2E pending a reachable MongoDB**
- [ ] Farmer token cannot call admin-only route (403); no token → 401 — **401 verified live; 403 implemented, E2E pending**
- [ ] Expired access token auto-refreshes without user noticing — **implemented (interceptor + rotation); E2E pending**
- [ ] Passwords stored only as bcrypt hashes; no password in any response/log — **cost-10 hash/compare verified; responses scrubbed via `select: false` + `toPublic()`; DB write path pending**
- [x] Wrong-credentials rate limiting verified (429 after threshold) — verified live: 429 + `RATE_LIMITED` envelope on the 11th auth attempt (10/15 min budget)
- [ ] UI: register → auto-login → role-aware navbar → logout → protected route redirects to login — **implemented; E2E pending**
- [ ] Postman collection passes end-to-end — **collection committed (19 requests, asserts + token extraction); run pending**

## ⏳ Remaining Tasks (to close this phase)

1. **Provide a reachable MongoDB** — local `mongod`, free Atlas M0, or run `npm run dev:db`
   (in-memory dev Mongo; needs normal internet for the one-time binary download).
2. `cd backend && npm run seed:admin` (after `ADMIN_PHONE`/`ADMIN_PASSWORD` are set in `backend/.env`).
3. `cd backend && npm run verify:auth` → all PASS flips every acceptance criterion above to ✅.
4. Optionally run `docs/postman/auth.json` in Postman.
5. Tick the boxes, set Status `✅ DONE`, and complete the Phase Completion Protocol.

## 📦 Suggested Commits

```
feat(auth): user model with roles and bcrypt hashing
feat(auth): register, login, refresh, logout endpoints with rate limiting
feat(auth): jwt + role middleware
feat(frontend): auth pages, contexts, interceptors, protected routes
docs: close phase 01
```

## 🏁 End of Phase

Phase Completion Protocol → hand off to **Phase 02 — Farmer Module**. Log env keys added (`ADMIN_PHONE`, `ADMIN_PASSWORD`) in `PROJECT_STATE.md`.
