# 🧱 PHASE 06 — Orders, Payments & Notifications

| | |
|---|---|
| **Status** | ⬜ NOT STARTED |
| **Depends on** | Phase 05 |
| **Builds (blueprint §3)** | Payment Service · Notification Service · order lifecycle |

## 🎯 Objective

Turn matches into transactions: **offer/counter-offer → confirmed order → dispatch → delivery**, with gateway payment (test mode), and real-time + email/SMS notifications at every step.

## ✅ Scope

### Backend — offers & orders
- [ ] `Offer` model: `listingId, farmerId, buyerId, quantity, pricePerUnit, message, side: buyer|farmer, status: pending|accepted|countered|rejected|withdrawn, parentId?, timestamps`
  - [ ] `POST /listings/:id/offers`, `POST /offers/:id/counter`, `POST /offers/:id/accept|reject|withdraw` (participants only)
- [ ] `Order` model: `listingId, farmerId, buyerId, offerId, quantity, pricePerUnit, total, status, payment { provider, refId, amount, status }, deliveryAddress, timeline[], timestamps`
- [ ] **State machine** (guard illegal transitions): `created → confirmed → dispatched → delivered → completed` · `cancelled (until dispatch)` · `disputed (after dispatch)`
  - [ ] `POST /orders` (from accepted offer — auto-accept offer path for fixed-price listings)
  - [ ] `POST /orders/:id/confirm` (farmer) · `/dispatch` (farmer, marks listing sold) · `/deliver` (buyer) · `/complete` (auto 48 h after deliver via cron) · `/cancel` · `/dispute`
  - [ ] `GET /orders/me` (role-aware: farmer sales / buyer purchases), `GET /orders/:id` (participants/admin)
- [ ] Listing quantity ledger: decrement/restore on dispatch/cancel (no overselling)

### Backend — payments
- [ ] Provider: **Razorpay test mode** (or stub adapter if key unavailable — same interface)
  - [ ] `POST /payments/create/:orderId` → provider order ref
  - [ ] `POST /payments/verify` — **server-side signature verification**
  - [ ] `POST /webhooks/razorpay` — verify webhook signature, update payment status idempotently
  - [ ] COD path allowed (payment.status = `cod`); invoices: simple HTML/PDF receipt endpoint

### Backend — notifications
- [ ] `services/notify/` — channel adapters: **Socket.io** (real-time), **email** (SMTP/Nodemailer), **SMS** (provider-agnostic adapter; mock in dev logs to console)
- [ ] Events: offer received/accepted, order confirmed/dispatched/delivered, dispute opened, **pending price alerts from Phase 4**
- [ ] `Notification` model (in-app inbox) + `GET /notifications/me`, `PATCH /notifications/:id/read`
- [ ] Socket auth (JWT in handshake); rooms per user

### Frontend
- [ ] Offer modal on listing (buyer) + offers tab (farmer) with accept/counter/reject
- [ ] Orders pages: farmer sales & buyer purchases with **status timeline** component
- [ ] Checkout: confirm order → pay (Razorpay test checkout) or COD → receipt
- [ ] Notification bell: unread count, dropdown, real-time updates, mark-read
- [ ] Email templates (text-first): offer, order confirmed, dispatched

## 🚫 Out of Scope

Real payouts/settlements, logistics booking UI (Phase 7 adds estimates), chat UI (offers' messages suffice).

## 🧪 Acceptance Criteria

- [ ] End-to-end: buyer offer → farmer counter → accept → order created → test payment verified (webhook or test signature) → dispatch → deliver → complete; timeline intact
- [ ] Illegal transition rejected (e.g., deliver before dispatch → 409)
- [ ] Cancel restores listing quantity; dispatch prevents overselling (parallel order test)
- [ ] Payment verification fails gracefully with tampered signature (400, order stays unpaid)
- [ ] Both parties receive: socket toast in real time **and** in-app inbox row; dev email visible in logs/Mailtrap
- [ ] No secrets client-side; Razorpay key id only in frontend if needed, secret stays server-side
- [ ] Env keys logged: `PAYMENT_API_KEY` (+`PAYMENT_API_SECRET`), `SMTP_*`, `SMS_API_KEY` in `.env.example` + `PROJECT_STATE.md`

## 📦 Suggested Commits

```
feat(orders): offer flow with counter-offers and state machine
feat(orders): order lifecycle endpoints with quantity ledger
feat(payments): razorpay test integration with server-side verification
feat(notify): socket.io, email and sms adapters with templates
feat(frontend): offers, checkout, order timelines and notification bell
docs: close phase 06
```

## 🏁 End of Phase

Phase Completion Protocol → **Phase 07 — Analytics, Maps & Admin**.
