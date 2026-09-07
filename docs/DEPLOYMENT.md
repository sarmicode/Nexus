# Deployment Guide

## Quick Deploy (Docker Compose)

```bash
# Clone the repository
git clone https://github.com/sarmicode/Nexus.git
cd Nexus

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Start the full stack
docker compose up -d

# Seed admin user
docker compose exec backend node src/scripts/seedAdmin.js

# Seed price data
docker compose exec backend node src/scripts/seedPrices.js

# (Optional) Seed demo data
docker compose exec backend node src/scripts/seedDemo.js
```

The frontend is available at http://localhost and the API at http://localhost:5000.

## Free-Tier Deployment (No Docker)

### Backend → Render.com

1. Create a free Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm ci`
4. Set start command: `cd backend && node src/server.js`
5. Add environment variables from `.env.example`

### Frontend → Vercel

1. Import the repository on Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_BASE_URL` to your Render backend URL

### Database → MongoDB Atlas M0 (Free)

1. Create a free cluster on Atlas
2. Set `MONGO_URI` in Render environment

### Cache → Upstash Redis (Free)

1. Create a free Redis instance on Upstash
2. Set `REDIS_URL` in Render environment

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `ADMIN_PHONE` | ❌ | Admin phone for seed:admin |
| `ADMIN_PASSWORD` | ❌ | Admin password for seed:admin |
| `REDIS_URL` | ❌ | Redis connection URL |
| `CORS_ORIGIN` | ❌ | Allowed CORS origins (comma-separated) |
| `PAYMENT_API_KEY` | ❌ | Razorpay key ID |
| `PAYMENT_API_SECRET` | ❌ | Razorpay key secret |
| `DATA_GOV_IN_API_KEY` | ❌ | Data.gov.in API key for AGMARKNET |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ❌ | API base URL (default: `/api/v1`) |

## Rollback

```bash
# Docker Compose
docker compose down
git checkout <previous-tag>
docker compose up -d --build
```

## Demo Credentials

After running `node src/scripts/seedDemo.js`:

| Role | Phone | Password |
|---|---|---|
| Farmer | 9000000001 | demo1234 |
| Farmer (FPO) | 9000000002 | demo1234 |
| Buyer (Wholesale) | 9000000003 | demo1234 |
| Buyer (Processor) | 9000000004 | demo1234 |
