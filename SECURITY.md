# 🔒 Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| dev (`main`) | ✅ active development |

## 🐞 Reporting a Vulnerability

**Please do not open public issues for security problems.**

1. Contact a maintainer privately (add email: `security@yourdomain.example` or GitHub *Security Advisories* → "Report a vulnerability").
2. Include: description, steps to reproduce, affected endpoint/file, impact, suggested fix.
3. You'll get an acknowledgement within 72 hours and a fix timeline after triage.

## 🛡️ Security Requirements for This Project

This platform handles **farmers' personal data, phone numbers, and payments** — security is a feature, not an afterthought.

### Secrets & configuration
- All secrets live in `.env` — which is git-ignored. `.env.example` contains **keys only, never values**.
- Never commit real credentials, JWT secrets, API keys, or database URIs. If it happens: rotate the secret **immediately**, then clean history.
- Strong, random `JWT_SECRET` (≥ 32 chars) generated per environment.

### Authentication & authorization
- Passwords hashed with bcrypt (cost ≥ 10). No plaintext anything, ever.
- Short-lived JWT access tokens + refresh tokens; logout invalidates the session.
- **Role-based access control** on every protected route (`farmer` / `buyer` / `admin`) — server-side, never trust the client role.
- Rate limiting on auth endpoints (login/register/refresh) to block brute force.

### API hygiene
- Validate and sanitize **all** input (zod/joi); use `express-mongo-sanitize` to block NoSQL injection.
- Parameterized Mongoose queries only — never string-concatenate queries.
- CORS restricted to known origins (localhost in dev, deployed domain in prod).
- `helmet` enabled; disable `X-Powered-By`; safe HTTP headers everywhere.
- Central error handler — no stack traces or internals in production error responses.
- File uploads: whitelist MIME types + extensions, cap size, randomize stored filenames, never execute or inline-serve untrusted files.

### Payments
- Payment verification happens **server-side** (signature/webhook check) — never trust a "success" from the client.
- Store only payment references/status, never full card or bank details.

### Data protection
- Collect the minimum PII needed (name, phone, location). No Aadhaar/financial numbers in the database.
- Provide admin ability to delete/anonymize a user account (right-to-erasure ready).
- Seed/demo data must use fake names and numbers.

### Dependencies
- `npm audit` (and `pip-audit` for the ML service) before a phase branch is merged (merges happen only on the owner's order — see `RULES.md`); fix all *high/critical* findings first.
- Pin major versions; review new dependencies before adding (small, maintained, permissive license).

## ✅ Per-Phase Security Checklist

Run at the end of every phase (agent or human):

- [ ] No secrets/`.env` committed (`git log -p | grep -i "key\|secret"` sanity check)
- [ ] New endpoints have validation + auth as appropriate
- [ ] New user input is sanitized before DB or response
- [ ] `.env.example` updated with any new keys (placeholders only)
- [ ] `npm audit` — no high/critical vulnerabilities
- [ ] New third-party integration documented in `docs/PROJECT_STATE.md`

## 🏆 Recognition

Thanks for helping keep FarmBridge and its farmers' data safe. Responsible reporters will be credited (if they wish) in the release notes.
