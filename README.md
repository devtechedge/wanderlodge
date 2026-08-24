# WanderLodge

Peer-to-peer marketplace for subalpine cabins and lodges. Search sensory-scored stays, book as a traveler or host as a provider, then run a trip workspace with group expenses, in-stay cabin controls, and a wilderness log.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://wanderlodge-taupe.vercel.app)
[![CI](https://github.com/devtechedge/wanderlodge/actions/workflows/ci.yml/badge.svg)](https://github.com/devtechedge/wanderlodge/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Live Demo

**https://wanderlodge-taupe.vercel.app**

> **Status:** Portfolio demo. Listings and bookings live in an in-memory JSON store (`/tmp` on Vercel, so writes reset). Gemini herb/Q&A/adventure calls fall back to canned payloads when `GEMINI_API_KEY` is unset. Auth is an unsigned demo cookie, not JWT or NextAuth. Payments are simulated.

Demo accounts (password `password123`):

| Role | Email |
|------|-------|
| Traveler | `marcus@wanderlodge.com` |
| Provider | `evelyn@wanderlodge.com` |

This is the **only** public repo for the project.

---

## Screenshots

<p align="center">
  <img src="docs/social-preview.png" alt="WanderLodge" width="800">
</p>

| Explore | Property |
|---------|----------|
| ![Lodge grid on the explore home](docs/screenshots/01-explore-lodges.png) | ![Property detail and booking card](docs/screenshots/02-property-detail.png) |

| Search | Trip workspace |
|--------|----------------|
| ![Search results with map](docs/screenshots/03-search-map.png) | ![Group coordination hub](docs/screenshots/04-trip-workspace.png) |

---

## Features

- Curated lodge grid with category chips, eco-score, and EV badges
- Search + map with amenity, price, guest, and sensory filters (decibel, astrophotography, solitude, fragrance-free)
- Traveler / provider demo auth with a one-click role switch
- Booking card: nights, 50% day-retreat, pantry upgrades, 30/70 deposit split
- Trip workspace: host chat, co-traveler expense split, in-stay cabin controls, wilderness log
- Optional Gemini botanist / concierge — mocked on the public demo

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind 4 |
| Motion | Motion (`motion/react`) |
| Data | JSON file store in `lib/db.ts` (not Prisma, not Mongo) |
| Auth | HttpOnly user-id cookie (`lib/session.ts`) — demo only |
| AI | Optional `@google/genai` with canned fallback |
| Hosting | Vercel |
| CI | GitHub Actions — Vitest, `tsc`, Playwright |

---

## Quick Start

```bash
git clone https://github.com/devtechedge/wanderlodge.git
cd wanderlodge
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:3000**. Gemini is optional.

```bash
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

---

## Security

Portfolio demo: public passwords, unsigned session cookie, ephemeral JSON on Vercel. Details: **[SECURITY.md](SECURITY.md)**.

---

## License

MIT. See [LICENSE](LICENSE).
