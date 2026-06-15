# Digital Store — Manual Setup Guide

Panduan langkah demi langkah untuk menyiapkan semua kredensial dan layanan
eksternal. Lakukan ini **sekali** sebelum menjalankan aplikasi.

> Semua nilai rahasia disimpan di file `.env` (copy dari `.env.example`).
> Jangan pernah commit `.env` ke git.

---

## 0. Prasyarat

- Node.js >= 18 (disarankan 20+)
- Akun: Neon, Google Cloud (OAuth), GitHub (OAuth), RamaShop, Cloudflare, Cloudinary, Telegram, Vercel

```bash
cp .env.example .env
```

---

## 1. Database — Neon Cloud (PostgreSQL)

Docs: https://neon.com/docs/get-started/full-backend-quickstart

1. Buat project baru di https://console.neon.tech
2. Buka **Connection Details**.
3. Salin **Pooled connection string** → `DATABASE_URL`
4. Salin **Direct connection string** (matikan "Pooled") → `DIRECT_URL`
   - Prisma butuh `DIRECT_URL` untuk migrasi, `DATABASE_URL` (pooled) untuk runtime.
5. Pastikan diakhiri `?sslmode=require`.

Lalu jalankan:

```bash
npm run db:push     # buat tabel di Neon
npm run db:seed     # isi 6 produk contoh + setting default
```

---

## 2. Authentication — Auth.js (NextAuth v5)

Login via **Google**, **GitHub**, dan **Email/Password**.

1. Generate secret (sudah otomatis ada di `.env`, atau buat baru):
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` → `AUTH_SECRET`.
2. **Google (Google Cloud Console):**
   - https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth client ID (Web).
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
     (tambah juga domain produksi `/api/auth/callback/google`).
   - Isi `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`.
3. **GitHub:**
   - GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
   - Isi `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`.
4. **Email/Password** aktif otomatis (disimpan sebagai bcrypt hash di DB).
5. **Set admin:** isi `ADMIN_EMAILS` (pisahkan koma). Email tsb otomatis jadi ADMIN
   saat login/daftar. Default: `fakhulrohman2@gmail.com`.

> Middleware melindungi `/dashboard` & `/api/admin` (admin only) dan `/orders` (login).

---

## 3. Payment Gateway — RamaShop

Docs: https://ramashop.my.id/docs.html

1. Login ke https://ramashop.my.id (akun kamu).
2. Menu (☰) → **API Key** → **Generate API Key**.
3. Salin → `PAYMENT_API_KEY` (default contoh sudah diisi: `rg_579817853049e312a0be8fd35a6c8c`).
4. `PAYMENT_BASE_URL` sudah benar: `https://ramashop.my.id/api/public`.

> Model pembayaran RamaShop adalah **QRIS deposit + polling** (bukan webhook):
> aplikasi membuat deposit, menampilkan QRIS, lalu polling status tiap 5 detik.
> Pastikan saldo/akun aktif. Cek koneksi di **Dashboard → Pengaturan**.

---

## 4. AI Chatbot — NeoXR

- AI v1 (Kimi K2): `https://api.neoxr.eu/api/kimi`
- AI v2 (Chat GPT-4): `https://api.neoxr.eu/api/gpt4`

1. Dapatkan API key NeoXR yang aktif (beli/registrasi di https://api.neoxr.eu).
2. Isi `CHATBOT_API_KEY` (default contoh: `3ch2qmp`).
3. Endpoint default sudah benar di `.env.example`. Jika v1 gagal, sistem
   otomatis fallback ke v2, lalu ke pesan fallback bila keduanya gagal.

---

## 5. Owner Notifications & Chat Bridge — Telegram Bot

1. Chat **@BotFather** di Telegram → `/newbot` → ikuti instruksi.
2. Salin token bot → `TELEGRAM_BOT_TOKEN`.
3. Dapatkan **Chat ID** kamu: chat **@userinfobot** → salin `id` → `TELEGRAM_CHAT_ID`.
4. Buat string acak untuk `TELEGRAM_WEBHOOK_SECRET`.
5. Setelah aplikasi online (atau via tunnel), daftarkan webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://DOMAIN_KAMU/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

**Cara owner membalas chat user** (dari Telegram):
- Format teks: `U-<userId> : isi balasan`
- Atau **reply** langsung pada pesan notifikasi (bot mendeteksi userId otomatis).

---

## 6. Captcha — Cloudflare Turnstile

1. Buka https://dash.cloudflare.com → **Turnstile** → **Add site**.
2. Salin:
   - `Site Key` → `NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY`
   - `Secret Key` → `CF_TURNSTILE_SECRET`

> Jika kedua nilai kosong, captcha dilewati (mode dev). Isi untuk produksi.

---

## 7. Media CDN — Cloudinary

Docs: https://next.cloudinary.dev/installation

1. Daftar di https://cloudinary.com → ambil **Cloud name**, **API Key**, **API Secret**.
2. Isi `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Buat **unsigned upload preset** (Settings → Upload → Upload presets) →
   isi namanya ke `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
   - Dipakai untuk upload gambar produk dari Dashboard Admin.

---

## 8. Hosting — Vercel

1. Import repo `https://github.com/Lumakara/p` di https://vercel.com.
2. **Settings → Environment Variables**: tambahkan SEMUA variabel dari `.env`.
3. Build command default: `npm run build` (sudah menjalankan `prisma generate`).
4. Setelah deploy, sync env lokal kapan saja:

```bash
vercel env pull .env
```

5. Update `NEXT_PUBLIC_APP_URL` ke domain produksi.
6. Daftarkan ulang Telegram webhook ke domain produksi (lihat bagian 5).

---

## Checklist Cepat

- [ ] `.env` terisi semua
- [ ] `npm install`
- [ ] `npm run db:push && npm run db:seed`
- [ ] Set admin (`ADMIN_EMAILS` di `.env`)
- [ ] `npm run dev` → buka http://localhost:3000
- [ ] Dashboard admin: http://localhost:3000/dashboard
- [ ] Test pembayaran, chat AI, chat owner, notifikasi Telegram
