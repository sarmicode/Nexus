# 📏 RULES.md — Non-Negotiable Rules (Humans + AI Agents)

> Every contributor — human or AI — must read this file **before writing any code**.
> These rules exist so the project stays consistent when built **phase by phase across different chat sessions**.

---

## 🚫 ABSOLUTE RULE — NO MERGE WITHOUT THE OWNER'S ORDER

**In any chat session, the agent must NEVER merge a branch or a pull request — not into `main`, not into any branch — unless the project owner explicitly orders that merge in the current chat.**

- Finishing a phase is **not** permission to merge.
- CI green / all checks passed is **not** permission to merge.
- "Keeping `main` green" is **not** permission to merge.
- The agent **commits and pushes only its phase/feature branch**, then reports: *"branch `phase/XX` pushed — ready for merge."*
- **Merging is a human-only action**, performed by the owner — or done by the agent only when the owner's order to merge that specific branch/PR is stated explicitly in that chat.
- Violating this rule invalidates the session's Phase Completion Protocol.

---

## 0. Prime Directives

1. **`docs/PROJECT_BLUEPRINT.md` is the architecture source of truth.** Never invent a conflicting structure.
2. **`docs/PROJECT_STATE.md` is the memory of the project.** If it's not written there, the next chat doesn't know it happened.
3. **`PROMPT.md` always points to the current phase.** At the end of a phase it is *regenerated* (old content destroyed, next-phase content written). Follow its **Phase Completion Protocol**.
4. Never delete or rewrite `docs/PHASE_LOG.md` history — append only.
5. Never skip an acceptance criterion. A phase is done when its checklist is 100% ✅.

## 1. Required Reading Order (start of every session)

```
1. PROMPT.md                     → what phase am I on?
2. RULES.md                      → how do I work?
3. docs/PROJECT_STATE.md         → what exists & what decisions were made?
4. docs/phases/PHASE-XX-*.md     → what exactly do I build now?
5. docs/PROJECT_BLUEPRINT.md     → how does it fit the architecture?
```

## 2. Git Rules

- **Branches:** one branch per phase or feature.
  `phase/01-auth`, `feature/price-trends`, `fix/listing-pagination`
- **Commits — Conventional Commits, imperative mood:**
  `feat: add JWT refresh endpoint`
  `feat(auth): role-based access middleware`
  `fix(mandi): handle missing modal price`
  `docs: update phase 2 status`
  `chore: add eslint config`
- **Commit often** — one logical change per commit, never "stuff".
- **Push to GitHub** at the end of every working session — **push your phase/feature branch only**. Never merge into `main` (see 🚫 Absolute Rule above); `main` changes only when the owner merges.
- **Never** rewrite history on `main`, never force-push shared branches, **never merge a branch or PR without the owner's explicit order in the current chat**.
- PRs: opening one when a phase is done is fine (base: `main`) — but **never merge it yourself**, never self-approve. Leave it open and tell the owner it's ready.

## 3. Repository Structure Rules

- Exactly two apps: `frontend/` (React+Vite) and `backend/` (Express), plus optional `ml-service/` (Python) from Phase 5.
- Follow the folder layout in `docs/PROJECT_BLUEPRINT.md` §1. New top-level folders are forbidden without a note in `docs/PROJECT_STATE.md`.
- Keep `README.md` quick start **always working**. If ports/steps change, update it in the same commit.

## 4. Backend Rules (Node.js + Express)

- **API base path:** `/api/v1/*` (mounted in `server.js`).
- **Layers:** `routes → controllers → services → models`. Controllers stay thin; business logic lives in `services/`.
- **Response envelope (always):**
  ```json
  { "success": true,  "data": { } }
  { "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
  ```
- **HTTP codes:** 200/201 success · 400 validation · 401 unauthenticated · 403 forbidden · 404 missing · 409 conflict · 500 unexpected.
- **Validate every input** (`zod` or `joi`) at route/controller level — never trust the client.
- **Central error handler** in `server.js`; no leaked stack traces in production responses.
- **Config only from env** (`src/config/index.js` reading `.env`). No hardcoded secrets, ports, or URLs.
- Every new endpoint gets at least a manual **Postman check**; automated tests from Phase 8.
- Add new env keys to `.env.example` **and** `docs/PROJECT_STATE.md` in the same commit.

## 5. Frontend Rules (React + Vite)

- All API calls go through `src/services/*` using a shared **axios instance** — no fetch/axios scattered in components.
- Global state only via `src/context/` (auth, user). Component-local state stays local.
- Pages in `src/pages/`, reusable UI in `src/components/` — components stay dumb where possible.
- Never call `localhost` URLs inline — always `import.meta.env.VITE_API_BASE_URL`.
- No secrets in frontend env files — `VITE_*` variables are public by definition.
- Loading / empty / error states are mandatory on every data view.

## 6. Database Rules (MongoDB + Redis)

- Mongoose models in `src/models/`, `timestamps: true` on everything.
- Index every field you filter or sort by (crop, district, status, createdAt…).
- Breaking schema changes ⇒ write a short migration note in `docs/PROJECT_STATE.md`.
- Redis keys are namespaced: `price:latest:*`, `cache:match:*` … always with a TTL.

## 7. Security Rules (summary — full policy in SECURITY.md)

- Passwords: `bcrypt` (cost ≥ 10). Tokens: short-lived JWT access + refresh.
- `helmet`, CORS allowlist, and rate limiting stay enabled from Phase 0 onward.
- Uploads: type/size-validated, stored under `backend/uploads/`, served safely.
- **Never** commit `.env`, keys, tokens, or real user data. Never disable security middleware "temporarily".
- Any new third-party API key ⇒ `.env.example` placeholder + `docs/PROJECT_STATE.md` entry.

## 8. Quality Gates (per phase)

- [ ] Code runs via README quick start with no errors
- [ ] All phase acceptance criteria checked
- [ ] `npm run lint` clean (from Phase 0)
- [ ] No console errors on manual happy-path test
- [ ] Docs updated (`PROJECT_STATE.md`, `PHASE_LOG.md`, `PROMPT.md` regenerated)

## 9. Agent-Specific Rules

- Work **only** on the active phase in `PROMPT.md` — no drive-by features from future phases.
- **Never merge branches or PRs** — the owner's explicit order in the current chat is the only exception. Push the branch, report it ready.
- If a phase can't be fully completed, finish what's possible, then mark the phase 🟡 and list **remaining tasks** in `docs/PROJECT_STATE.md` and the regenerated `PROMPT.md`.
- Never fabricate "done". Verify by running commands where possible before claiming success.
- Ask the human when a decision is **irreversible** (product name, paid API, public deploy). Everything else: decide and log it in the decisions table.
- Keep responses and commits scoped; don't touch unrelated files.

## 10. Definition of Done (any task)

`code + env example + docs updated + committed + pushed` — all five, every time.
