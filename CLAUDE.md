# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

npm run db:push      # Push schema changes (no migration file)
npm run db:migrate   # Create + run migration
npm run db:seed      # Seed database (prisma/seed.ts)
npm run db:studio    # Prisma Studio GUI
```

Env vars live in `config.js` (not `.env`). DB uses Neon PostgreSQL via `NEXT_DATABASE_URL` (pooled) and `NEXT_DIRECT_URL` (direct, for migrations).

## Architecture

**Stack**: Next.js 15 App Router + React 19, Prisma 6 (PostgreSQL/Neon), Firebase Auth, Radix UI + Tailwind (shadcn pattern), Zustand, Cloudinary, Turnstile captcha.

**App structure** (`src/app/`):
- `(store)/` — public storefront (product listings, detail pages)
- `checkout/` → `success/` / `failed/` — payment flow
- `dashboard/` — admin panel (products, orders, users, settings)
- `account/` — user account pages
- `login/` / `register/` / `forgot-password/` — auth pages
- `api/` — API routes: `auth/`, `chat/ai|messages|owner`, `orders/`, `payment/create|status`, `products/`, `admin/`, `support/`, `telegram/`

**Service layer** (`src/services/`):
- `payment.ts` — RamaShop payment gateway integration (QRIS/transfer), order lifecycle
- `chat.ts` — AI chat logic with fallback strategy
- `chatJobs.ts` — job queue for async chat processing
- `audio.ts` — audio service
- `telegram.ts` — Telegram bot notifications

**Key patterns**:
- DB queries centralized in `src/db/` (Prisma client + query helpers)
- Auth: Firebase client (`src/config/firebase.ts`) + Firebase Admin (`src/config/firebaseAdmin.ts`); `AuthContext` in `src/context/`; `useAuth` hook
- External integrations in `src/integrations/`: payment gateway, Telegram webhooks, Turnstile CAPTCHA
- Global state: Zustand store at `src/store/appStore`
- i18n utilities in `src/lib/`

**Data model** (key entities):
- `User` — Firebase uid as PK, role USER|ADMIN, status ACTIVE|BLOCKED
- `Product` — tiers (JSON array), optional stock, discountPrice
- `Order` — status PENDING→PAID|EXPIRED|FAILED; stores QR/QRIS data; `uniqueCode` for transfer disambiguation; `productKey` delivered after payment
- `ChatSession` + `ChatMessage` — AI or OWNER mode; message status tracking
- `WebhookLog` — logs incoming payment + Telegram webhooks
- `AdminLog` — audit trail for admin actions
- `Setting` — key/value store for runtime config

**Payment flow**: `api/payment/create` → RamaShop → customer pays QRIS/transfer → webhook hits `api/payment/` → order marked PAID → `productKey` delivered → Telegram notification sent.

## Agent Rules

`.agents/rules/00-system.md`: always use RTK commands (`rtk git`, `rtk ls`, `rtk grep`) instead of bare equivalents. Auto-fix build errors, auto-install missing deps, don't stop at first error.
