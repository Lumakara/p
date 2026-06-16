# Manual Setup Guide

## Dependencies
- Node.js >= 18
- PostgreSQL (Neon Cloud or local)

## Environment Variables (.env.local)
Create a `.env.local` file with the following variables:
```
# Database
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

# Payment Gateway (RamaShop)
PAYMENT_API_KEY="..."

# Telegram Bot
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."
```

## Setup Steps
1. Install dependencies: `npm install`
2. Push database schema: `npx prisma db push`
3. Seed database: `npm run db:seed`
4. Run development server: `npm run dev`

## Deployment Guide (Vercel)
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Set all the environment variables from `.env.local` in Vercel settings.
4. Add a build command if needed (default: `npm run build` which runs `prisma generate && next build`).
5. Deploy.
