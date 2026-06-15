# Digital Store

Platform produk & layanan digital full-stack. Pembayaran QRIS instan,
AI chatbot dengan fallback, chat owner real-time via Telegram, dan admin
dashboard yang lengkap.

- **Live:** https://www.lumakara.biz.id/
- **Repo:** https://github.com/Lumakara/p

## Tech Stack

**Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
**Backend:** Next.js API Routes (TypeScript), Prisma ORM, PostgreSQL (Neon Cloud)
**Auth:** Auth.js / NextAuth v5 (Google, GitHub, Email/Password)
**Payment:** RamaShop (QRIS deposit + polling)
**AI Chatbot:** NeoXR (Kimi K2 v1 → GPT‑4 v2 fallback)
**Notifikasi:** Telegram Bot (pusat notifikasi owner + chat bridge)
**Captcha:** Cloudflare Turnstile
**Media:** Cloudinary
**Hosting:** Vercel

## Fitur

- Katalog produk + tier pricing, review & rating dengan avatar
- Checkout QRIS tanpa keluar halaman + status real-time (polling)
- Riwayat transaksi, dark/light mode, multi-bahasa (ID/EN), musik latar
- Mobile-first + bottom navigation, widget chat (AI + Owner)
- Admin dashboard: statistik + grafik, CRUD produk, manajemen order & user,
  pengaturan, notifikasi real-time

## Quick Start

```bash
cp .env.example .env          # isi kredensial (lihat MANUAL-SETUP.md)
npm install
npm run db:push               # buat tabel di Neon
npm run db:seed               # isi produk contoh
npm run dev                   # http://localhost:3000
```

Dashboard admin: `/dashboard` (set admin via `ADMIN_EMAILS` di `.env`).

## Dokumentasi

- [`MANUAL-SETUP.md`](./MANUAL-SETUP.md) — setup kredensial semua layanan
- [`NEXT-SETUP.md`](./NEXT-SETUP.md) — arsitektur & panduan developer
- [`CHANGES.md`](./CHANGES.md) — changelog & keterbatasan yang diketahui
- [`docs/`](./docs) — spesifikasi fitur (payment, chat, admin)

## Deploy ke Vercel

1. Import repo di Vercel.
2. Tambahkan semua env dari `.env` ke Project Settings.
3. Build command: `npm run build` (otomatis `prisma generate`).
4. Daftarkan Telegram webhook ke `https://DOMAIN/api/telegram/webhook`.
