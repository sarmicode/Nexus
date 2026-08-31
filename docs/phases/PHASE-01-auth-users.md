# 🧱 PHASE 01 — Authentication & User Management

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 00 |
| **Builds (blueprint §3)** | Authentication, User Service (roles) |

## 🎯 Objective

Full JWT auth with **role-based access (Farmer / Buyer / Admin)**, user profiles, and frontend auth flow — the trust layer every other module depends on.

## ✅ Scope

### Backend
- [ ] `User` model: `name, phone (unique), email (unique, optional), passwordHash, role: farmer|buyer|admin, language (default 'en'), location { village, district, state, geo: [lat, lng] }, isFpoMember, fpoId, status: active|blocked, timestamps`
- [ ] Indexes: phone, email, role; `bcrypt` cost 10 in `middleware/` or model hook
- [ ] Endpoints (`/api/v1/auth`, `/api/v1/users`):
  - [ ] `POST /auth/register` (role selectable: farmer|buyer only) — validate phone (Indian 10-digit), password ≥ 8 chars
  - [ ] `POST /auth/login` (phone or email + password) → access token (15 min) + refresh token (7 d)
  - [ ] `POST /auth/refresh`, `POST /auth/logout`
  - [ ] `GET /users/me` (auth), `PATCH /users/me` (profile, location, language)
  - [ ] Admin seed script: creates first admin from env (`ADMIN_PHONE`, `ADMIN_PASSWORD`)
- [ ] `middleware/auth.js` (verify JWT) + `middleware/roles.js` (`requireRole('admin')` etc.)
- [ ] Strict rate limits on `/auth/login|register|refresh` (e.g., 10/15 min per IP)
- [ ] Validators (zod/joi) on every route; consistent error envelope from Phase 0 helper
- [ ] Postman collection `docs/postman/auth.json` committed

### Frontend
- [ ] Pages: Login, Register (role toggle Farmer/Buyer), with client-side validation + server error display
- [ ] `AuthContext` + `UserContext`: login/logout, token storage (localStorage access, memory/httpOnly-pattern refresh), `isAuthed`, `role`
- [ ] Axios interceptors: attach bearer; on 401 → one silent refresh → retry, else logout
- [ ] `ProtectedRoute` + `RoleRoute` components; navbar adapts to role; profile page (edit location/language)
- [ ] Registration captures district/state (dropdown) + optional geo ("use my location")

## 🚫 Out of Scope

OTP login, FPO CRUD (Phase 2), any listings.

## 🧪 Acceptance Criteria

- [ ] Register → login → `GET /users/me` round-trip works for farmer and buyer roles
- [ ] Farmer token cannot call admin-only route (403); no token → 401
- [ ] Expired access token auto-refreshes without user noticing
- [ ] Passwords stored only as bcrypt hashes; no password in any response/log
- [ ] Wrong-credentials rate limiting verified (429 after threshold)
- [ ] UI: register → auto-login → role-aware navbar → logout → protected route redirects to login
- [ ] Postman collection passes end-to-end

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
