# ⚡ PROMPT.md — Project Complete

> **FarmBridge — Farmer–Buyer Marketplace (SIH 2026 · SIH26132)**
> All 8 phases implemented. Project is ready for deployment.

## 📌 CURRENT STATUS

| | |
|---|---|
| **Project** | FarmBridge — Farmer–Buyer Marketplace (SIH 2026 · SIH26132) |
| **Status** | ✅ PROJECT COMPLETE — All phases (00–08) implemented |
| **Branch** | `arena/01a07a6c-nexus` |
| **Repo** | Monorepo: `frontend/` (React+Vite) · `backend/` (Express) — see `docs/PROJECT_BLUEPRINT.md` |

## 🚀 Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Seed price data (for market intelligence demo)
npm run seed:prices

# Seed demo users/orders
npm run seed:demo

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🐳 Docker (One-Command Stack)

```bash
docker compose up -d
```

## 🔑 Demo Credentials

After running `npm run seed:demo` + `npm run seed:admin`:

| Role | Phone | Password |
|---|---|---|
| Admin | 9876543210 | Admin@1234 |
| Farmer | 9000000001 | demo1234 |
| Buyer | 9000000003 | demo1234 |

## 📋 Maintenance

Bug fixes → `fix/*` branches. RULES.md still applies (no agent merges without owner's order).

## 📖 Documentation

- `docs/PROJECT_STATE.md` — full project state & decisions
- `docs/PHASE_LOG.md` — build history
- `docs/DEPLOYMENT.md` — deployment guide
- `docs/PROJECT_BLUEPRINT.md` — architecture source of truth
- `README.md` — project overview & quick start
