# 📘 PROJECT_BLUEPRINT.md — Full Architecture (Source of Truth)

> This document is the text version of the original architecture diagram. If code and this document disagree, **this document wins** (or the decision to change it is logged in `PROJECT_STATE.md`).

**Project:** FarmBridge — Farmer–Buyer Marketplace
**Problem:** SIH 2026 · SIH26132 — Strengthening market linkages and price discovery for farmers
**Goal:** A digital marketplace connecting farmers/FPOs directly with consumers & bulk buyers, with logistics support and AI for demand forecasting and route optimization → better farmer prices, lower consumer prices, fewer supply-chain inefficiencies.

---

## 1. Project Structure (VS Code / monorepo)

```
farmer-buyer-marketplace/
├── frontend/                      # React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            # reusable UI
│   │   ├── pages/                 # Login/Register · FarmerDashboard · BuyerDashboard
│   │   │                          # · MarketComparison · Analytics · Mandi · Auth
│   │   ├── services/              # all API calls (axios)
│   │   ├── context/               # AuthContext, UserContext
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                       # VITE_API_BASE_URL, VITE_MAPS_API_KEY
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Node.js + Express
│   ├── src/
│   │   ├── config/                # env & service clients
│   │   ├── controllers/           # request handling (thin)
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # /api/v1 routers
│   │   ├── middleware/            # auth, roles, validation, errors
│   │   ├── services/              # business logic (mandi, matching, notify…)
│   │   ├── validators/            # zod/joi schemas
│   │   └── server.js              # gateway: routing, validation, JWT, rate limit, CORS
│   ├── common/                    # constants/ · utils/ shared helpers
│   ├── .env
│   └── package.json
│
├── ml-service/                    # (Phase 5, optional) Python FastAPI/Flask
│                                  # scikit-learn + pandas, deployed as an API
│
├── docs/                          # blueprint, state, phase log, phase docs
├── PROMPT.md · RULES.md · SECURITY.md · AGENTS.md · README.md
└── .gitignore
```

## 2. High-Level System Architecture

```
CLIENT (Browser: Farmer / Buyer / Admin)
        │ HTTPS (Axios) + Socket.io
        ▼
API GATEWAY (Express.js)  ── routing · request validation · JWT auth · rate limiting · CORS
        │
        ├── Auth Service            login/register · JWT · profiles
        ├── User Service            farmer / buyer / admin profiles
        ├── Product/Listing Service CRUD listings (crops/products)
        ├── Mandi Service           price aggregation from multiple mandis
        ├── Matching Service        buyer–farmer matching engine
        ├── Recommendation Service  ML / rule-based engine
        ├── Notification Service    email / SMS / WebSocket
        ├── Payment Service         payment tracking (gateway integration)
        └── Analytics Service       charts & aggregates
        │
        ├── DATA LAYER:  MongoDB (primary DB) · Redis (cache / sessions)
        │
        └── INTEGRATIONS: Payment gateway · Maps API · Email/SMS API
                          · Weather API · ML Model API
```

## 3. Module-Wise Architecture

| Module | Responsibility |
|---|---|
| **Authentication** | JWT, role-based access (Farmer / Buyer / Admin) |
| **Farmer** | Dashboard, crop listings, FPO details |
| **Buyer** | Search, compare, buy, orders |
| **Mandi** | Fetch prices from multiple mandis (APIs), aggregation |
| **Matching** | Logic/ML to match farmers with buyers |
| **Analytics** | Charts & graphs (Chart.js / Plotly) |
| **Recommendation** | ML-based or rule-based recommendations |
| **Notification** | Email / SMS / WebSocket notifications |
| **Payment** | Track transactions (payment-gateway integration) |
| **Admin** | Manage users, disputes, quality checks, etc. |

## 4. Data Flow (example request)

```
User (Browser)
  → Axios call from React frontend
  → HTTPS API request
  → Express.js API (gateway: routing → validation → JWT auth)
  → Business logic in services/
  → MongoDB (persist) / Redis (cache)
  → JSON response → React re-render
```

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js (Vite), HTML, CSS, JavaScript, Axios, Chart.js / Plotly, Leaflet / Google Maps |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Redis (cache/sessions), JWT (auth), Multer (file upload), Socket.io (notifications) |
| **ML (optional)** | Python (Flask/FastAPI), scikit-learn, pandas — deployed as an API |
| **DevOps / Tools** | Git & GitHub, Postman, Render / Railway / Vercel (deployment), Docker (optional) |
| **External APIs** | Payment, SMS, Maps, Weather, ML model |

## 6. Environment Setup

**Backend `.env` (example — keys only in `.env.example`)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
EMAIL_API_KEY=your_email_api_key
SMS_API_KEY=your_sms_api_key
PAYMENT_API_KEY=your_payment_key
MAPS_API_KEY=your_maps_key
```

**Frontend `.env` (example)**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPS_API_KEY=your_maps_key
```

## 7. Run Locally (VS Code terminal — two terminals)

```bash
# Terminal 1 — backend on :5000
cd backend && npm install && npm run dev

# Terminal 2 — frontend on :5173
cd frontend && npm install && npm run dev
# open http://localhost:5173
```

Notes: keep frontend & backend on different ports · use `.env` files for config · use Postman to test APIs.

## 8. Domain Data Sources (price discovery)

| Source | What it gives | Use |
|---|---|---|
| **AGMARKNET** (agmarknet.gov.in / data.gov.in API) | Daily commodity prices: min/max/modal, arrivals, for ~3,000+ mandis | Primary mandi price feed (Phase 4) |
| **eNAM** (enam.gov.in) | Electronic national mandi trade & prices | Secondary feed / validation |
| **data.gov.in** | Bundled AGMARKNET price APIs (free API key) | Structured access |
| **IMD / Weather APIs** | Weather data | Farmer advisories (optional) |

## 9. Phase → Module Map

| Phase | Builds (modules from §3) |
|---|---|
| 0 | Repo, gateway skeleton, tooling, docs |
| 1 | Authentication, User (roles) |
| 2 | Farmer (listings, FPO, uploads) |
| 3 | Buyer (search, compare, watchlist, RFQ) |
| 4 | Mandi (price ingestion, aggregation, Redis cache, trends, alerts) |
| 5 | Matching, Recommendation (+ Python ML service) |
| 6 | Payment, Notification, order lifecycle |
| 7 | Analytics, Maps/Leaflet, Admin |
| 8 | Testing, security hardening, Docker, CI, deployment |
