# 🤖 AGENTS.md — Instructions for AI Coding Agents

_You are an agent (GitHub Copilot coding agent, Cursor, or similar) working on this repo. Follow this file first._

## Read before doing anything

1. **`PROMPT.md`** — which phase is active right now
2. **`RULES.md`** — how to work (git, code, API, docs rules) — *binding*
3. **`docs/PROJECT_STATE.md`** — project memory
4. **`docs/phases/<active-phase>.md`** — your task list & acceptance criteria
5. **`docs/PROJECT_BLUEPRINT.md`** — target architecture

## The 7 rules that matter most

1. 🚫 **NEVER merge** a branch or PR without the owner's explicit order in the current chat — push your branch and report it ready for merge. Merging is human-only.
2. Build **only the active phase** — no future-phase features, no refactors of working code.
3. Conventional Commits, small and frequent; push **your phase branch** before the session ends.
4. API = `/api/v1/*`, envelope `{ success, data | error }`, validate all input, RBAC on protected routes.
5. Secrets only via `.env` (git-ignored). Update `.env.example` + `docs/PROJECT_STATE.md` when adding keys.
6. Never edit history in `docs/PHASE_LOG.md` (append-only) and never delete docs.
7. When the phase is done: run the **Phase Completion Protocol** in `PROMPT.md` — including regenerating `PROMPT.md` for the next phase.

## Definition of done

`code + .env.example + docs (STATE, LOG, PROMPT regenerated) + commit + push`
