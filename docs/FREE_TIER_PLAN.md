# 💸 FREE_TIER_PLAN.md — Build & Run at ₹0 Cost

> **Binding guidance:** this project must be buildable and demoable **entirely on free tiers** (SIH context). Agents: whenever a phase needs a paid-looking service, pick the free option from this table. If a free tier is genuinely insufficient, stop and ask the owner before spending anything.

## The ₹0 Stack

| Need | Free choice | Limits / notes |
|---|---|---|
| Code hosting + CI | **GitHub** (free) + GitHub Actions | Unlimited CI minutes on public repos; 2,000 min/mo private |
| MongoDB | **MongoDB Atlas M0** | 512 MB, free forever, no credit card — enough for demo data (keep price data scoped: few states × few crops) |
| Redis | **Upstash free** | 256 MB, 10k commands/day — fine for `price:*` caching; design caches with this quota in mind |
| Backend hosting | **Render free web service** | 750 hrs/mo, 512 MB RAM, no card. **Sleeps after 15 min idle** (30–60 s cold start) |
| Frontend hosting | **Vercel** (or Netlify / GitHub Pages) | Free; use the free `*.vercel.app` subdomain |
| ML service (Phase 5) | Render 2nd free service or **Hugging Face Spaces** (free CPU) | Or keep `USE_ML=false` — rule-based fallback is the default |
| Mandi prices (Phase 4) | **data.gov.in / AGMARKNET** free API key | Rate-limited; cache aggressively in Redis; store only what's needed |
| Maps (Phase 7) | **Leaflet + OpenStreetMap tiles** | No API key, no cost — `VITE_MAPS_API_KEY` stays optional |
| Payments (Phase 6) | **Razorpay test mode** | ₹0; live mode has no setup fee, only ~2% per real transaction (not needed for demo) |
| Email (Phase 6) | **Brevo** 300/day (or Resend 3k/mo) via Nodemailer/SMTP | Free |
| SMS (Phase 6) | **Mock adapter** (logs to console) in dev/demo | No true free SMS in India; if ever needed: MSG91/Fast2SMS prepaid (~₹0.15–0.25/msg) — owner's call only |
| Weather | **Open-Meteo** | Free, no key |
| Image uploads (Phase 2) | **Cloudinary free** plan | Render disk is **ephemeral** — never rely on local `uploads/` in deployed envs |

## Demo-Day Checklist (cold starts!)

- [ ] Ping `GET /api/v1/health` on the backend ~5 min before presenting (wake Render)
- [ ] Open the frontend once beforehand too
- [ ] Keep a local backup of the stack running (`docker compose up` / `npm run dev`) in case venue Wi-Fi fails
- [ ] Demo data seeded (`npm run seed:demo`) the same day

## What Is NOT Free (only if the owner opts in later)

| Item | Approx cost | Needed for SIH? |
|---|---|---|
| Custom domain | ~₹700–1,000/yr | ❌ free subdomain is fine |
| Real SMS sending | prepaid credits | ❌ mock adapter suffices |
| Production scale (Atlas Flex/M10, Render paid, Upstash pay-as-you-go) | $5–10+/mo each | ❌ not for the demo |

## Deploy Topology (Phase 8 target)

```
Vercel (frontend, free)  →  Render free (Express API)  →  Atlas M0 (Mongo)
                                                      →  Upstash free (Redis)
Render free / HF Space (ml-service, optional)            ↗ Cloudinary (images, free)
```
