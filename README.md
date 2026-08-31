# 🌾 FarmBridge — Farmer–Buyer Marketplace

> **Working title.** Rename freely (e.g., `MandiBridge`, `FasalDirect`) — just update `docs/PROJECT_STATE.md` when you do.

**Smart India Hackathon 2026 · Problem Statement [SIH26132](https://www.sih.gov.in) — Strengthening market linkages and price discovery for farmers**
Category: Software · Theme: Agriculture, FoodTech & Rural Development

A digital marketplace that connects **farmers and FPOs directly with consumers and bulk buyers**, cutting out unnecessary intermediaries, and provides **transparent real-time mandi price discovery** so farmers can decide *where, when, and at what price* to sell.

---

## 📌 The Problem

- Multiple intermediaries reduce farmers' earnings and increase consumer prices.
- Farmers lack transparent, real-time access to crop prices across different markets (mandis).
- Supply-chain delays and weak direct linkages between producers and bulk buyers (wholesalers, processors, exporters, retailers).

## ✅ Our Solution — Two Pillars

| Pillar | What we build |
|---|---|
| **Market Linkages** | Direct farmer/FPO ↔ buyer marketplace (search, compare, negotiate, transact) with logistics support and AI-assisted matching & route optimization |
| **Price Discovery** | Live aggregated mandi prices (AGMARKNET / eNAM / data.gov.in), trends, market comparison, and price alerts so farmers sell at the right place & time |

**Expected benefits:** better prices for farmers · lower prices for consumers · reduced supply-chain inefficiencies.

---

## 🚀 Key Features

- 👤 **Role-based access** — Farmer / Buyer / Admin (JWT + RBAC)
- 🌱 **Farmer module** — crop listings, quality/grade info, FPO profiles, image uploads
- 🔎 **Buyer module** — search, filter, compare lots & mandi prices, watchlist, RFQs
- 📈 **Market intelligence** — daily mandi price aggregation, district averages, 7/30/90-day trends, price alerts
- 🤝 **Smart matching** — rule-based + ML matching of supply ↔ demand (crop, quantity, distance, price)
- 🧠 **ML service (Python)** — demand forecasting & recommendation scoring as a separate API
- 💳 **Orders & payments** — offer/counter-offer, order lifecycle, gateway integration (test mode), invoices
- 🔔 **Notifications** — real-time (Socket.io), email & SMS
- 🗺️ **Maps & analytics** — Leaflet mandi maps, Chart.js dashboards for farmers/buyers/admin
- 🛡️ **Admin module** — user management, disputes, quality checks, platform metrics

---

## 🏗️ Architecture at a Glance

```
 CLIENT (React + Vite, Browser)
    │  HTTPS (Axios)  ·  Socket.io
 ▼
 API GATEWAY (Express.js) ─ routing · validation · JWT auth · rate limiting · CORS
    │
    ├─ Auth Service          ├─ Mandi Service (price aggregation)
    ├─ User Service          ├─ Matching Service
    ├─ Listing Service       ├─ Recommendation Service (ML / rule-based)
    ├─ Notification Service  ├─ Payment Service
    └─ Analytics Service
    │
    ├─ DATA:  MongoDB (primary) · Redis (cache/sessions)
    └─ EXTERNAL: Payment gateway · Maps API · Email/SMS API · Weather API · ML Model API
```

Full details (project structure, module map, data flow, env setup): **[docs/PROJECT_BLUEPRINT.md](docs/PROJECT_BLUEPRINT.md)**

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js (Vite), HTML/CSS/JS, Axios, Chart.js / Plotly, Leaflet / Google Maps |
| Backend | Node.js, Express.js, Mongoose (MongoDB), Redis, JWT, Multer, Socket.io |
| ML (optional microservice) | Python (Flask/FastAPI), scikit-learn, pandas — deployed as an API |
| DevOps / Tools | Git & GitHub, Postman, Render / Railway / Vercel, Docker (optional) |
| Data sources | AGMARKNET, eNAM, data.gov.in APIs |

> 💸 **Budget: ₹0.** The entire project runs on free tiers (Atlas M0, Upstash, Render, Vercel, Leaflet/OSM, Razorpay test mode, Brevo, Cloudinary) — see [docs/FREE_TIER_PLAN.md](docs/FREE_TIER_PLAN.md).

---

## 🗺️ Phase Roadmap

This repo is built **phase by phase, each phase in a fresh chat/agent session**. `PROMPT.md` always points to the current phase.

| Phase | Scope | Doc | Status |
|---|---|---|---|
| 0 | Foundation & repo bootstrap | [PHASE-00](docs/phases/PHASE-00-foundation.md) | ✅ |
| 1 | Auth & user management (JWT, RBAC) | [PHASE-01](docs/phases/PHASE-01-auth-users.md) | ⬜ |
| 2 | Farmer module (listings, FPO, uploads) | [PHASE-02](docs/phases/PHASE-02-farmer-module.md) | ⬜ |
| 3 | Buyer module (search, compare, watchlist) | [PHASE-03](docs/phases/PHASE-03-buyer-module.md) | ⬜ |
| 4 | Market intelligence & price discovery | [PHASE-04](docs/phases/PHASE-04-market-intelligence.md) | ⬜ |
| 5 | Matching & recommendations (+ ML API) | [PHASE-05](docs/phases/PHASE-05-matching-recommendations.md) | ⬜ |
| 6 | Orders, payments & notifications | [PHASE-06](docs/phases/PHASE-06-orders-payments-notifications.md) | ⬜ |
| 7 | Analytics, maps & admin | [PHASE-07](docs/phases/PHASE-07-analytics-admin-maps.md) | ⬜ |
| 8 | Hardening, CI & deployment | [PHASE-08](docs/phases/PHASE-08-hardening-deployment.md) | ⬜ |

Legend: ⬜ not started · 🟡 in progress · ✅ done — statuses live in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md)

---

## 🤖 How This Repo Is Built (Multi-Chat Agent Workflow)

Every phase is developed in a **different chat session** with an AI coding agent. Continuity is maintained by four files:

```
┌────────────────────────────────────────────────────────────────────┐
│  1. PROMPT.md            ← paste into every new chat. Self-updates │
│  2. RULES.md             ← non-negotiable dev & agent rules        │
│  3. docs/PROJECT_STATE.md← living memory of the project            │
│  4. docs/PHASE_LOG.md    ← append-only history of every phase      │
└────────────────────────────────────────────────────────────────────┘
New chat → agent reads PROMPT.md → does the phase work → commits & pushes its
phase branch → updates STATE + LOG → REGENERATES PROMPT.md for the next phase
(old prompt content is destroyed and replaced — "self-destructing").
```

> 🚫 **Strict rule — the agent never merges.** In any chat, the agent must **not merge any branch or PR** without the owner's explicit order in that chat. It pushes the phase branch and reports it *ready for merge*; **merging is a human-only action** (see `RULES.md`).

➡️ **To start working: open [PROMPT.md](PROMPT.md) and copy its Boot Prompt into a fresh chat.**

## 💻 Quick Start (local dev)

```bash
# Backend  (http://localhost:5000)
cd backend
npm install
cp .env.example .env      # local dev defaults included — set real values for real environments
npm run dev

# Frontend (http://localhost:5173) — new terminal
cd frontend
npm install
cp .env.example .env
npm run dev
# open http://localhost:5173 — the home page shows a live ping to the API
```

> Run frontend and backend on separate ports. Use Postman for API testing. Never commit `.env` files.
> The frontend calls the API at the **relative** path `/api/v1/…`; the Vite dev server proxies
> `/api` → `http://localhost:5000` (see `frontend/vite.config.js`). A local MongoDB (or free
> Atlas M0) makes `GET /api/v1/health` report `db: "connected"` — the API boots either way.

### Environment variables

**Backend** (`backend/.env`)

| Key | Example |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `development` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/farmbridge` |
| `JWT_SECRET` | *strong random secret (≥ 32 chars) in real environments* |
| `REDIS_URL` | `redis://localhost:6379` |
| `CORS_ORIGIN` | `http://localhost:5173` (production allowlist) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `900000` / `100` |
| `EMAIL_API_KEY` | `your_email_api_key` |
| `SMS_API_KEY` | `your_sms_api_key` |
| `PAYMENT_API_KEY` | `your_payment_key` |
| `MAPS_API_KEY` | `your_maps_key` |

**Frontend** (`frontend/.env`)

| Key | Example |
|---|---|
| `VITE_API_BASE_URL` | `/api/v1` (relative — Vite proxies to `:5000`; or a full URL for a deployed backend) |
| `VITE_MAPS_API_KEY` | *(optional — Leaflet/OSM needs no key)* |

---

## 📂 Repository Structure

```
farmer-buyer-marketplace/
├── frontend/          # React (Vite) client
│   └── src/ (components, pages, services, context, utils)
├── backend/           # Node.js + Express API
│   └── src/ (config, controllers, models, routes, middleware, services, validators)
├── docs/
│   ├── PROJECT_BLUEPRINT.md    # full architecture (source of truth)
│   ├── PROJECT_STATE.md        # current snapshot of the build
│   ├── PHASE_LOG.md            # history of completed phases
│   └── phases/                 # one doc per phase (used across chats)
├── PROMPT.md          # ⚡ self-updating agent boot prompt
├── RULES.md           # development + agent rules
├── SECURITY.md        # security policy & practices
└── README.md
```

## 🤝 Contributing

Read [RULES.md](RULES.md) first — it covers branches, commit style, API conventions, and the phase workflow.

## 🔒 Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately; never open issues for security problems.

## Team

- _Add team members & roles here_

## License

_TBD — add a LICENSE file before making the repo public._
