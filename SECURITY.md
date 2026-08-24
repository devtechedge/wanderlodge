# Security Assessment — WanderLodge

**Date:** 2026-08-24  
**Scope:** Auth, XSS, injection, CORS, secrets, payments, third-party APIs  
**Context:** Public deploy is a **portfolio demo** on Vercel. Listings, bookings, and chat persist in a JSON file under `/tmp` (ephemeral on serverless). Gemini is optional and mocked when `GEMINI_API_KEY` is unset.

---

## Executive summary

| Area | Risk | Notes |
|------|------|--------|
| Authentication | **Demo-only (accepted)** | Unsigned `wanderlodge_session_id` cookie holds a user id. Not JWT. Not NextAuth. |
| Authorization | **Demo-only** | Role is a field on the JSON user (`TRAVELER` / `PROVIDER`). The profile menu can switch it. |
| XSS | **Low** | No `dangerouslySetInnerHTML`. Lodge copy and chat render as React text. |
| Injection (SQL) | **N/A** | No Prisma, no SQL. Unused Mongo Prisma schema was removed this pass. |
| Secrets in repo | **Hardened** | `.env*` gitignored. `.env.example` has empty placeholders. |
| CORS | **N/A** | Same-origin App Router. |
| Payments | **Simulated** | 30/70 milestone split is math only. No Stripe, no card vault. |
| Gemini | **Optional** | Herb / Q&A / adventure routes fall back to canned JSON without a key. |

**Overall (public Vercel demo):** Low residual risk for a hiring-manager walkthrough. Do not treat this as a production marketplace.

---

## 1. Authentication & session

**Findings**
- Session cookie: `wanderlodge_session_id` = the JSON user id (`user-1`, `user-2`, …).
- Flags: `httpOnly`, `sameSite=lax`, `secure` in production, 7-day max-age.
- The cookie is **not signed**. Anyone who can set it to `user-1` becomes Evelyn.
- Login compares a plaintext password. Public demo accounts:

| Email | Password | Role |
|-------|----------|------|
| `marcus@wanderlodge.com` | `password123` | Traveler |
| `evelyn@wanderlodge.com` | `password123` | Provider |

The login route also accepts `password123` for any seeded user even if the stored string differs. That is intentional for the demo and is **accepted residual risk**.

**Verdict:** Do not claim NextAuth, JWT, OAuth, or bcrypt. These are demo cookies.

---

## 2. Authorization

- Providers may `POST /api/properties`. Travelers may `POST /api/reservations`.
- `GET /api/reservations` returns the traveler's own bookings or the provider's incoming ones.
- The navbar **Switch role** action flips `TRAVELER` ↔ `PROVIDER` on the same user record. Fine for a portfolio demo. Not acceptable as multi-tenant RBAC.

Helpers in `lib/rbac.ts` document the intended checks and are unit-tested.

---

## 3. XSS

- No `dangerouslySetInnerHTML`.
- User-authored strings (chat, Q&A, lodge titles) render as React text → default escaping.
- Lodge images load from `picsum.photos` via `next/image` remotePatterns.

---

## 4. Data store

`lib/db.ts` reads and writes `/tmp/wanderlodge_db.json`.

- Local `next dev`: the file survives restarts on that machine.
- Vercel: `/tmp` is per-instance and ephemeral. Bookings and new listings reset. That is the documented demo path.
- There is **no** Prisma client, **no** Mongo connection, **no** `DATABASE_URL`.

---

## 5. Gemini proxy

| Path | Auth | Missing key |
|------|------|-------------|
| `POST /api/identify-herb` | Session not required | Canned botanist payload |
| `POST /api/qa` | Mixed | Throws, client should handle |
| `POST /api/adventures` | None | Mock adventures |

The public Vercel project ships **without** `GEMINI_API_KEY`. Do not put the key in `NEXT_PUBLIC_*`.

---

## 6. Payments

Reservation totals use `lib/pricing.ts` (nightly rate, 50% day-retreat, 10% service fee, pantry add-ons, optional 30% deposit). No processor is called. "Held Securely" escrow is a label.

---

## 7. Dependency / supply chain

**This pass**
- Dropped unused Prisma schema (never imported, never in `package.json`).
- Dropped unused `firebase-tools`, `@hookform/resolvers`, `class-variance-authority`.
- Kept `@google/genai` (herb / Q&A / adventures).
- `ignoreBuildErrors` is **false**. Type errors fail CI.

```bash
npm audit --omit=dev
```

Do **not** run `npm audit fix --force` onto Next 16 to clear Next 15 advisories.

---

## 8. Residual risk & acceptance

**Accepted for portfolio demo**
- Public `password123` accounts.
- Unsigned user-id cookie.
- Ephemeral `/tmp` JSON on Vercel.
- Optional unauthenticated Gemini proxy (off unless a key is set).
- Simulated payments.

**Not accepted if this becomes a real marketplace**
- Unsigned cookies as identity.
- Filesystem JSON as the source of truth.
- Plaintext passwords.
- A public Gemini route without auth, rate limits, and cost caps.

---

## 9. How to re-test

```bash
npm install
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```
