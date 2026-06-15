# Digital Store — Next.js Developer Guide

Arsitektur teknis & alur kerja untuk developer.

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| State (client) | Zustand (cart, theme color, language, music, chat user id) |
| Theme | next-themes (dark/light) + CSS var color schemes |
| Auth | Clerk (`@clerk/nextjs` v6) |
| DB | PostgreSQL (Neon) via Prisma 6 |
| Payment | RamaShop (QRIS deposit + polling) |
| Chatbot | NeoXR (Kimi v1 → GPT-4 v2 fallback) |
| Notifications | Telegram Bot API |
| Captcha | Cloudflare Turnstile |
| Media | Cloudinary (`next-cloudinary`) |
| Hosting | Vercel |

## Perintah

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # prisma generate + next build
npm run start      # production server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run db:push    # push schema ke DB (tanpa migrasi file)
npm run db:migrate # buat migrasi dev
npm run db:seed    # seed produk + setting
npm run db:studio  # Prisma Studio
```

## Struktur Folder

```
prisma/
  schema.prisma        # model DB
  seed.ts              # data awal
src/
  middleware.ts        # Clerk middleware + proteksi /dashboard & /api/admin
  app/
    layout.tsx         # ClerkProvider + ThemeProvider
    providers.tsx      # next-themes + sonner Toaster
    globals.css
    (store)/           # halaman publik dengan Header + BottomNav + ChatWidget
      page.tsx                 # / (home)
      products/page.tsx        # /products
      products/[id]/page.tsx   # detail
      cart/ orders/ profile/ support/
    checkout/[orderId]/  success/[orderId]/  failed/[orderId]/
    sign-in/  sign-up/
    dashboard/         # admin (layout server-guarded)
      page.tsx products/ orders/ users/ settings/
    api/
      payment/create            POST  buat order + QRIS
      payment/status/[orderId]  GET   polling status (validasi + idempotent)
      chat/ai                   POST  AI v1->v2->fallback
      chat/owner                POST  forward ke Telegram
      chat/messages             GET   polling balasan owner
      telegram/webhook          POST  terima balasan owner
      products, products/[id], products/[id]/reviews
      orders                    GET   riwayat user
      support                   POST  tiket -> Telegram
      admin/*                   semua diproteksi withAdmin()
  components/
    ui/                # shadcn
    store/             # Header, BottomNav, ChatWidget, ProductCard, ProductDetailClient, ThemeColorSync
    dashboard/         # DashboardShell, CloudinaryUpload
    TurnstileWidget.tsx
  lib/
    prisma, auth, payment, chat, telegram, turnstile, cloudinary,
    data (server fetch), api (admin wrapper), i18n, format, utils, audio
  store/appStore.ts
  types/index.ts
```

## Alur Pembayaran (RamaShop, polling)

1. User klik **Beli** → `POST /api/payment/create` (harga diambil dari DB, bukan request).
2. Backend buat order `PENDING`, panggil RamaShop `deposit/create`, simpan QRIS + `transactionId`.
3. Notifikasi Telegram "Transaksi Baru" dikirim.
4. Frontend `/checkout/[orderId]` menampilkan QRIS + countdown, polling
   `GET /api/payment/status/[orderId]` tiap 5 detik.
5. Status route memanggil RamaShop `deposit/status`; bila `success`/`already`
   dan nominal valid → order `PAID`, generate product key, notifikasi Telegram,
   redirect ke `/success`. Bila lewat waktu → `EXPIRED` → `/failed`.

Keamanan: harga selalu dari DB, validasi nominal (`paidAmount >= totalAmount`),
idempotensi (status terminal tidak diproses ulang), semua dicatat di `WebhookLog`.

## Alur Chat

- **AI:** `POST /api/chat/ai` → coba v1 (kimi), timeout 5s / error → v2 (gpt4),
  gagal keduanya → pesan fallback. Riwayat disimpan di DB.
- **Owner:** `POST /api/chat/owner` → forward ke Telegram. Owner membalas di
  Telegram → `POST /api/telegram/webhook` menyimpan balasan. Widget polling
  `GET /api/chat/messages` tiap 5 detik untuk menampilkan balasan owner.

## Catatan Implementasi

- Server pages (`getProducts`, dst.) memakai `force-dynamic` dan menelan error
  DB agar UI tetap render walau env belum lengkap.
- Real-time memakai **polling**, bukan WebSocket/SSE (cocok untuk serverless Vercel).
- Admin ditentukan oleh: Clerk `publicMetadata.role === "admin"` ATAU `ADMIN_USER_IDS`.
