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
| **Active phase** | `PHASE-01 — Authentication & User Management` |
| **Phase doc** | [`docs/phases/PHASE-01-auth-users.md`](docs/phases/PHASE-01-auth-users.md) |
| **Build state** | Phase 00 ✅ complete: running Express 5 gateway (`GET /api/v1/health`, helmet, CORS, rate limiting, central error handling) + Vite 6/React 19 shell (axios service layer, live health page), linting in both apps. Phase 00 work is on branch `arena/01a05757-nexus` — **not yet merged into `main`** (owner's call). ⚠️ No local MongoDB in the previous sandbox — connect a real Mongo (local or Atlas M0) before building the `User` model. |
| **Repo** | Monorepo: `frontend/` (React+Vite) · `backend/` (Express) — see `docs/PROJECT_BLUEPRINT.md` |

---

## 🤖 BOOT PROMPT

_Copy everything between the lines into a new chat:_

---

You are the development agent for **FarmBridge**, a farmer–buyer marketplace solving **SIH 2026 problem statement SIH26132 — "Strengthening market linkages and price discovery for farmers."** You are working inside the GitHub repo `farmer-buyer-marketplace`.

**Your setup, in order — read these files before writing any code:**

1. `RULES.md` — non-negotiable development & agent rules
2. `docs/PROJECT_STATE.md` — everything built so far + decisions log
3. `docs/phases/PHASE-01-auth-users.md` — **the phase you must complete now**
4. `docs/PROJECT_BLUEPRINT.md` — the architecture you must conform to (MERN: React+Vite frontend, Node/Express backend, MongoDB + Redis, optional Python ML service)

**Your job this session:**

- Implement the active phase listed above — its scope, acceptance criteria, and nothing more (no future-phase features).
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

*Last regenerated: 2026-08-31 · Phase 00 complete · Phase 01 pending*
