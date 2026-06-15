# Manual Setup — Digital Store

Panduan setup manual lengkap untuk menjalankan project **Digital Store** (Next.js 15 full-stack) dari nol sampai production.

---

## 1. Persyaratan Sistem (System Requirements)

| Kebutuhan | Versi / Catatan |
| --- | --- |
| Node.js | **v22.x** (diuji pada v22.12.0). Minimal v18.18+. |
| npm | v10+ (diuji pada v10.8.3) |
| PostgreSQL | Database di **Neon Cloud** (serverless PostgreSQL) |
| Git | untuk clone & deploy |
| OS | Linux / macOS / Windows (WSL direkomendasikan di Windows) |

Akun layanan eksternal yang dibutuhkan:

- **Clerk** (authentication) — https://clerk.com
- **Neon** (PostgreSQL) — https://neon.com
- **RamaShop** (QRIS payment gateway) — https://ramashop.my.id
- **NeoXR** (AI chatbot) — https://api.neoxr.eu
- **Telegram Bot** (notifikasi owner + chat bridge) — via @BotFather
- **Cloudflare Turnstile** (captcha) — https://dash.cloudflare.com
- **Cloudinary** (media/image CDN) — https://cloudinary.com
- **Vercel** (hosting) — https://vercel.com

---

## 2. Instalasi Dependencies

```bash
# 1. Clone repository
git clone https://github.com/Lumakara/p.git
cd p

# 2. Install dependencies
npm install
```

> `npm install` menjalankan `postinstall` yang otomatis menjalankan `prisma generate`.
> Jika `.env` belum ada / `DATABASE_URL` belum diisi, `prisma generate` tetap berhasil (hanya men-generate client, tidak konek DB).

---

## 3. Environment Variables

1. Salin template:

   ```bash
   cp .env.example .env
   ```

2. Isi nilai sebenarnya. **`.env` TIDAK boleh di-commit** (sudah ada di `.gitignore`).

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL aplikasi (mis. `http://localhost:3000` saat dev) |
| `DATABASE_URL` | ✅ | Connection string Neon **pooled** (`-pooler`) |
| `DIRECT_URL` | ✅ | Connection string Neon **direct** (untuk migrasi) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Publishable key Clerk |
| `CLERK_SECRET_KEY` | ✅ | Secret key Clerk |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | ✅ | Route sign-in / sign-up |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `..._SIGN_UP_...` | ✅ | Redirect setelah auth |
| `ADMIN_USER_IDS` | ⛔ opsional | Comma-separated Clerk user IDs yang selalu ADMIN |
| `PAYMENT_BASE_URL` | ✅ | Base URL RamaShop (`https://ramashop.my.id/api/public`) |
| `PAYMENT_API_KEY` | ✅ | API key RamaShop |
| `PAYMENT_EXPIRY_MINUTES` | ⛔ | Expiry order QRIS (default 15) |
| `CHATBOT_API_KEY` | ✅ | API key NeoXR |
| `CHATBOT_BASE_URL` / `CHATBOT_V1_ENDPOINT` / `CHATBOT_V2_ENDPOINT` | ⛔ | Default sudah diisi |
| `TELEGRAM_BOT_TOKEN` | ✅ | Token bot dari @BotFather |
| `TELEGRAM_CHAT_ID` | ✅ | Chat ID owner |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ | **Wajib** — webhook ditolak (503) jika kosong (fail-closed) |
| `NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY` / `CF_TURNSTILE_SECRET` | ✅ | Kunci Cloudflare Turnstile |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ | Kredensial Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ⛔ | Unsigned upload preset (opsional) |

> **Catatan build:** Clerk memvalidasi *format* publishable key bahkan saat build-time prerender.
> `.env.example` sudah memakai **dummy key berformat valid** (`pk_test_Y2xlcmsuZXhhbXBsZS5jb20k`) agar `npm run build` tidak crash. Ganti dengan key asli sebelum production.

---

## 4. Setup Database (Neon + Prisma)

1. Buat project PostgreSQL di [Neon](https://neon.com), ambil **pooled** dan **direct** connection string → isi `DATABASE_URL` & `DIRECT_URL`.

2. Push schema ke database (development cepat, tanpa file migrasi):

   ```bash
   npm run db:push
   ```

   atau buat migrasi yang ter-versioning:

   ```bash
   npm run db:migrate
   ```

3. (Opsional) Seed data awal:

   ```bash
   npm run db:seed
   ```

4. (Opsional) Buka Prisma Studio untuk inspeksi data:

   ```bash
   npm run db:studio
   ```

---

## 5. Menjalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000.

Validasi cepat selama development:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (flat config, non-interaktif)
```

---

## 6. Build Production

```bash
npm run build       # menjalankan: prisma generate && next build
npm run start       # menjalankan server production hasil build
```

`npm run build` harus selesai dengan **exit code 0**. Jika gagal dengan
`The publishableKey passed to Clerk is invalid`, berarti `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
tidak berformat valid — gunakan key asli atau dummy berformat valid dari `.env.example`.

---

## 7. Deployment (Vercel)

1. Import repository ke Vercel.
2. Set **semua** environment variables (bagian 3) di **Project → Settings → Environment Variables**.
   Jangan mengandalkan file `.env` di repo — file tersebut tidak di-commit.
3. Build command default Vercel (`next build`) cukup; project sudah menjalankan
   `prisma generate` lewat script `build` dan `postinstall`.
4. Set `NEXT_PUBLIC_APP_URL` ke domain production (mis. `https://www.lumakara.biz.id`).
5. Konfigurasi webhook eksternal setelah deploy:
   - **Telegram:** panggil `setWebhook` ke `https://<domain>/api/telegram/webhook`
     dengan `secret_token = TELEGRAM_WEBHOOK_SECRET`.
   - **RamaShop:** model polling (tidak butuh webhook inbound).

---

## 8. Troubleshooting Umum

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Build gagal: `publishableKey ... is invalid (key=pk_test_xxx)` | Placeholder Clerk berformat tidak valid | Pakai key asli / dummy valid dari `.env.example` |
| `npm run lint` berhenti minta pilih config | Tidak ada ESLint config (ESLint 9 butuh flat config) | Sudah diperbaiki: `eslint.config.mjs` tersedia |
| `prisma generate` error saat install | — | Pastikan `prisma` ter-install; jalankan `npx prisma generate` manual |
| Migrasi gagal / timeout | `DIRECT_URL` salah | Gunakan connection string **direct** (tanpa `-pooler`) untuk migrasi |
| Webhook Telegram balas `503 Webhook not configured` | `TELEGRAM_WEBHOOK_SECRET` kosong | Set secret tersebut (fail-closed by design) |
| Chat balas `400 Pesan terlalu panjang` | Pesan > 4000 karakter | Persingkat pesan |
| `/api/payment/status/...` balas `401`/`403` | Belum login / bukan pemilik order | Login sebagai pemilik order |
| Order ter-bayar tapi stok tidak berkurang | Produk `stock = null` (unlimited) | Set stok numerik bila ingin di-decrement |

---

## 9. Referensi Script (package.json)

| Script | Perintah | Fungsi |
| --- | --- | --- |
| `npm run dev` | `next dev` | Development server |
| `npm run build` | `prisma generate && next build` | Build production |
| `npm run start` | `next start` | Jalankan hasil build |
| `npm run lint` | `next lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` | Type checking |
| `npm run db:push` | `prisma db push` | Sync schema → DB (tanpa migrasi) |
| `npm run db:migrate` | `prisma migrate dev` | Buat & terapkan migrasi |
| `npm run db:seed` | `tsx prisma/seed.ts` | Seed data |
| `npm run db:studio` | `prisma studio` | GUI database |
