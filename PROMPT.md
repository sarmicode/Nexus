# ⚡ PROMPT.md — Self-Updating Agent Boot Prompt

> **How this file works**
> This file is **destroyed and regenerated at the end of every phase** (that's the "self-destruct" mechanism).
> It always contains exactly one thing: everything a **brand-new chat with zero memory** needs to continue the project.
>
> **User workflow:** start a new chat → paste the *Boot Prompt* below (or tell the agent: *"Read PROMPT.md in this repo and follow it exactly"*) → agent completes the phase → agent runs the *Phase Completion Protocol* at the bottom → this file is rewritten for the next phase.

---

## 📌 CURRENT STATUS

| | |
|---|---|
| **Project** | FarmBridge — Farmer–Buyer Marketplace (SIH 2026 · SIH26132) |
| **Active phase** | `PHASE-01 — Authentication & User Management` (PARTIAL — finishing) |
| **Phase doc** | [`docs/phases/PHASE-01-auth-users.md`](docs/phases/PHASE-01-auth-users.md) |
| **Build state** | Phase 01 **code is complete** (User/RefreshToken models, JWT + rotating refresh, RBAC, zod validation, strict auth rate limit, admin seed, Login/Register/Profile UI with silent refresh) — lint/build clean, pushed. **Remaining: DB-dependent E2E verification + closing the phase.** ⚠️ Blocker in the build sandbox: egress blocks MongoDB's CDN, so no `mongod` binary is downloadable there (verified: fastdl/downloads.mongodb.org unreachable; all npm "prebuilt" packages use the same CDN). On any machine with normal internet the finish is 3 commands — see "Remaining tasks" below. |
| **Repo** | Monorepo: `frontend/` (React+Vite) · `backend/` (Express) — see `docs/PROJECT_BLUEPRINT.md` |

---

## 🤖 BOOT PROMPT

_Copy everything between the lines into a new chat:_

---

You are the development agent for **FarmBridge**, a farmer–buyer marketplace solving **SIH 2026 problem statement SIH26132 — "Strengthening market linkages and price discovery for farmers."** You are working inside the GitHub repo `farmer-buyer-marketplace`.

**Your setup, in order — read these files before writing any code:**

1. `RULES.md` — non-negotiable development & agent rules
2. `docs/PROJECT_STATE.md` — everything built so far + decisions log
3. `docs/phases/PHASE-01-auth-users.md` — **the phase you must FINISH now** (its "Remaining Tasks" section)
4. `docs/PROJECT_BLUEPRINT.md` — the architecture you must conform to (MERN: React+Vite frontend, Node/Express backend, MongoDB + Redis, optional Python ML service)

**Your job this session — finish Phase 01:**

- Get a MongoDB running that the API can reach, in order of preference:
  (a) a `MONGO_URI` the owner provides (local or free Atlas M0 — put it in `backend/.env`),
  (b) `cd backend && npm run dev:db` (in-memory dev Mongo; downloads the official binary once — needs normal internet),
  (c) if **no** MongoDB is reachable, do the rest of the work and keep the phase 🟡 with the same blocker noted (never fabricate "done").
- Run `cd backend && npm run seed:admin` (needs `ADMIN_PHONE`/`ADMIN_PASSWORD` in `backend/.env` — set dev values if blank).
- Run `cd backend && npm run verify:auth` — the scripted acceptance matrix. Fix any FAIL at the source (code, not the script) and re-run until all PASS.
- Optionally run `docs/postman/auth.json` in Postman (same matrix, human-driven).
- Then: tick the Phase 01 acceptance boxes in its doc, set Status `✅ DONE`, and run the full Phase Completion Protocol (steps 1–8) — that closes Phase 01 and regenerates this file for **Phase 02 — Farmer Module**.
- Follow every rule in `RULES.md` (branch + commit style, API envelope `/api/v1`, validation, security, docs).
- 🚫 **HARD RULE — NEVER MERGE:** do not merge any branch or PR (into `main` or anywhere else). Work on your phase branch, commit and push **that branch only**, and tell the user it is ready for merge. The only exception is an explicit merge order from the user in the current chat.
- Keep the README quick start working at all times.
- Commit and push your work to GitHub (your phase branch — not `main`).

**When the phase is complete, you MUST run the Phase Completion Protocol defined at the bottom of `PROMPT.md` — including regenerating `PROMPT.md` for the next phase (destroying its old content).**

If something blocks you (missing API key, ambiguous decision), do everything else, mark the phase 🟡 in-progress in `docs/PROJECT_STATE.md`, and list the blockers in the regenerated `PROMPT.md` under "CURRENT STATUS".

---

## 🏁 PHASE COMPLETION PROTOCOL

_Agent: execute every step, in order, at the end of each phase. Do not skip steps 7–8 — they are what makes the multi-chat workflow possible._

1. **Verify** every acceptance criterion in the phase doc by actually running the app/commands. Fix gaps before proceeding.
2. **Tick** all checkboxes in the phase doc (`docs/phases/PHASE-XX-*.md`) and mark its status `✅ DONE` (or `🟡 PARTIAL` with remaining tasks listed).
3. **Update `docs/PROJECT_STATE.md`:**
   - move the phase to "Completed", set the next phase as active;
   - append to the decisions log anything you chose (libs, ports, schemas, env keys);
   - update "Known issues / TODO".
4. **Append one row to `docs/PHASE_LOG.md`** — never delete old rows.
5. **Update `README.md`** roadmap table (⬜/🟡/✅) and quick start if anything changed.
6. **Commit & push everything to the phase branch** (`docs: close phase XX, update state`). 🚫 **Do NOT merge** the branch/PR into `main` — merging requires the user's explicit order in the current chat (Absolute Rule in `RULES.md`). Leave the branch/PR open and report it as *ready for merge*.
7. **REGENERATE THIS FILE (self-destruct):** delete the current contents of `PROMPT.md` and rewrite it from the **Regeneration Template** below, filled in for the **next** phase (or, if partial, for the remaining tasks of this phase). The old boot prompt must not survive.
8. **Hand off:** end the session by telling the user:
   > "Phase XX complete ✅. Branch `phase/XX` is pushed and ready for merge — I have NOT merged it (merge only when you order it). When you're ready, open PROMPT.md and paste its Boot Prompt into a new chat to start Phase YY."

---

## 🔁 REGENERATION TEMPLATE

_Agent: when you rewrite `PROMPT.md`, keep this template at the bottom (unchanged) and fill the top sections for the next phase._

```markdown
# ⚡ PROMPT.md — Self-Updating Agent Boot Prompt

> **How this file works**
> This file is **destroyed and regenerated at the end of every phase** (that's the "self-destruct" mechanism).
> It always contains exactly one thing: everything a **brand-new chat with zero memory** needs to continue the project.
>
> **User workflow:** start a new chat → paste the *Boot Prompt* below (or tell the agent: *"Read PROMPT.md in this repo and follow it exactly"*) → agent completes the phase → agent runs the *Phase Completion Protocol* at the bottom → this file is rewritten for the next phase.

## 📌 CURRENT STATUS

| | |
|---|---|
| **Project** | FarmBridge — Farmer–Buyer Marketplace (SIH 2026 · SIH26132) |
| **Active phase** | `PHASE-XX — <name>` |
| **Phase doc** | `docs/phases/PHASE-XX-<slug>.md` |
| **Build state** | <1–3 lines: what exists, what this phase adds, any blockers/remaining tasks> |
| **Repo** | Monorepo: `frontend/` (React+Vite) · `backend/` (Express) — see `docs/PROJECT_BLUEPRINT.md` |

## 🤖 BOOT PROMPT

<same boot prompt as before, with the PHASE-XX references updated — the 🚫 HARD RULE — NEVER MERGE bullet must be preserved verbatim in every regeneration>

## 🏁 PHASE COMPLETION PROTOCOL

<copy the 8 steps verbatim from the previous PROMPT.md>

## 🔁 REGENERATION TEMPLATE

<copy this template verbatim — it must always survive>
```

---

*Last regenerated: 2026-08-31 · Phase 01 PARTIAL — code complete, DB E2E verification pending (MongoDB unreachable from build sandbox; dev:db retried, JWT error paths + npm audit verified live)*
