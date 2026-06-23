# PROJECT CHANGES — Lumakara Digital Store

## Perubahan yang Dilakukan

### 1. Bug Fixes

#### `config.js`
- **Bug**: `NEXT_PUBLIC_FIREBASE_API_KEY` dikomentari (`#NEXT_PUBLIC_FIREBASE_API_KEY=...`) — Firebase auth tidak bisa init di server
- **Bug**: Chatbot endpoints salah: `V1=kimi` (harusnya `gpt4`), `V2=gpt4` (harusnya `claude`)
- **Fix**: Uncomment Firebase key, ubah endpoints ke `gpt4` dan `claude`

#### `src/integrations/payment.ts`
- **Bug**: `getDepositStatus()` cek `body?.status !== true` tapi RamaShop API return `{ success: true }` bukan `{ status: true }` — semua status check akan throw error
- **Bug**: `RamaStatus` type tidak include `"expired"` dan `"failed"` yang bisa dikirim API
- **Fix**: Accept keduanya (`status === true || success === true`); tambah `"expired" | "failed"` ke type

#### `src/app/api/payment/status/[orderId]/route.ts`
- **Bug**: Tidak handle status `"expired"` dari RamaShop — order tetap `PENDING` padahal sudah expired di gateway
- **Fix**: Tambah handler untuk `"expired"` dan `"failed"` dari RamaShop, mark order jadi `EXPIRED`

#### `src/app/api/auth/sync/route.ts`
- **Bug**: Gunakan `require("@/lib/auth")` (CommonJS) di dalam ESM module — pola ini bisa menyebabkan masalah circular resolution
- **Fix**: Ubah ke proper `import { adminIds } from "@/lib/auth"` di top of file

#### `next.config.mjs`
- **Bug**: `img.clerk.com` masih ada di `remotePatterns` — project sudah migrasi dari Clerk ke Firebase Auth
- **Tambah**: `larabert-qrgen.hf.space` — domain QR image dari RamaShop QRIS
- **Fix**: Remove Clerk domain, add QRIS image domain

#### `tsconfig.json`
- **Bug**: `config.js` (file env shell-style) ikut di-typecheck → ratusan TypeScript error yang tidak relevan
- **Bug**: `baseUrl` deprecated di TypeScript 7.0 tanpa `ignoreDeprecations`
- **Fix**: Exclude `config.js`, tambah `ignoreDeprecations: "6.0"`

#### `.env` / `.env.local` / `config.js`
- **Bug**: `TELEGRAM_WEBHOOK_SECRET` tidak ada di env — Telegram webhook endpoint selalu return 503
- **Fix**: Tambah `TELEGRAM_WEBHOOK_SECRET=lumakara_tg_wh_secret_2024` ke semua env files

---

## File yang Ditambah / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `config.js` | Diubah | Fix Firebase key + chatbot endpoints + tambah webhook secret |
| `src/integrations/payment.ts` | Diubah | Fix status check + RamaStatus type |
| `src/app/api/payment/status/[orderId]/route.ts` | Diubah | Handle expired/failed dari RamaShop |
| `src/app/api/auth/sync/route.ts` | Diubah | Replace require() dengan import |
| `next.config.mjs` | Diubah | Fix image domains |
| `tsconfig.json` | Diubah | Exclude config.js, fix deprecation |
| `.env` | Diubah | Tambah TELEGRAM_WEBHOOK_SECRET |
| `.env.local` | Diubah | Tambah TELEGRAM_WEBHOOK_SECRET |
| `.env.example` | Diubah | Tambah TELEGRAM_WEBHOOK_SECRET template |
| `PROJECT_CHANGES.md` | Baru | File ini |

---

## Arsitektur Sistem (Status Saat Ini)

### Payment Gateway (RamaShop)
- **Model**: Polling (TIDAK ada webhook dari RamaShop — konfirmasi dari docs)
- **Flow**: `POST /api/payment/create` → RamaShop deposit/create → simpan QRIS ke DB → frontend poll `/api/payment/status/{orderId}` tiap 5 detik → detect `success` → deliver `productKey`
- **Status yang mungkin dari API**: `pending`, `success`, `already`, `expired`, `failed`
- **API Key**: `rg_579817853049e312a0be8fd35a6c8c` (sudah aktif, balance 0)
- **Testing**: Sudah diverifikasi — `deposit/create` berhasil generate QRIS; `deposit/status` berhasil return status; `balance` endpoint OK

### AI Chatbot (NeoXR)
- **V1 (Primary)**: `https://api.neoxr.eu/api/gpt4` — GPT-4
- **V2 (Fallback)**: `https://api.neoxr.eu/api/claude` — Claude
- **Fallback logic**: Jika V1 timeout/error → coba V2 → jika keduanya gagal → return pesan fallback
- **API Key**: `3ch2qm` (sudah aktif, kedua endpoint berhasil ditest)

### Authentication (Firebase)
- **Email/Password** ✅
- **Google OAuth** ✅
- **GitHub OAuth** ✅
- **Forgot Password** ✅
- **JWT Token**: Firebase ID Token disimpan di cookie `firebase_token` (httpOnly partial - set via JS)
- **Protected Routes**: `ProtectedRoute` dan `PublicRoute` components
- **Admin Check**: Via `requireAdmin()` → cek cookie `firebase_token` → Firebase Admin verifyIdToken → cek ADMIN_USER_IDS atau DB role

### Telegram Bot
- **Notifikasi**: Order baru, pembayaran berhasil, transaksi expired, tiket support
- **Owner Chat Bridge**: User chat → `/api/chat/owner` → Telegram; Owner reply dengan format `U-{userId} : {text}` → webhook `/api/telegram/webhook` → simpan ke DB → SSE ke frontend
- **Webhook Secret**: Sudah dikonfigurasi via `TELEGRAM_WEBHOOK_SECRET`

---

## Setup Manual yang Masih Diperlukan

### 1. Firebase Console
- Aktifkan metode login: Email/Password, Google, GitHub di **Firebase Console → Authentication → Sign-in method**
- Tambahkan domain ke **Authorized domains**: `lumakara.biz.id`, `localhost`
- Untuk Google OAuth: pastikan **Authorized redirect URIs** di Google Cloud Console include `https://lumakara-store.firebaseapp.com/__/auth/handler`
- Untuk GitHub OAuth: set **Callback URL** di GitHub Developer Settings: `https://lumakara-store.firebaseapp.com/__/auth/handler`

### 2. Telegram Bot Webhook
Setelah deploy ke production, register webhook URL:
```
https://api.telegram.org/bot8921540894:AAGM-LoulcJPn7EeiJfngQnNfAqfbbFHz98/setWebhook?url=https://lumakara.biz.id/api/telegram/webhook&secret_token=lumakara_tg_wh_secret_2024
```
Set `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` di `.env` ke username bot Telegram (tanpa @).

### 3. Cloudflare Turnstile
- Verifikasi domain `lumakara.biz.id` di Cloudflare Turnstile dashboard
- Site key dan secret sudah dikonfigurasi di `.env`

### 4. RamaShop
- Balance akun saat ini: **Rp 0** — pastikan ada saldo sebelum produksi agar QRIS bisa di-generate
- QRIS baru otomatis kadaluarsa setelah **15 menit** (dapat diubah via `NEXT_PAYMENT_EXPIRY_MINUTES`)

### 5. Database (Neon PostgreSQL)
Jalankan migrasi jika schema berubah:
```bash
npm run db:migrate
# atau untuk sync cepat tanpa migration file:
npm run db:push
```

### 6. Environment Variables untuk Production
Pastikan semua variable berikut ada di server production:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_FIREBASE_CLIENT_EMAIL
NEXT_FIREBASE_PRIVATE_KEY
NEXT_DATABASE_URL
NEXT_DIRECT_URL
NEXT_PAYMENT_API_KEY
NEXT_CHATBOT_API_KEY
NEXT_TELEGRAM_BOT_TOKEN
NEXT_TELEGRAM_CHAT_ID
TELEGRAM_WEBHOOK_SECRET
NEXT_CLOUDINARY_CLOUD_NAME
NEXT_CLOUDINARY_API_KEY
NEXT_CLOUDINARY_API_SECRET
NEXT_TURNSTILE_SECRET
```

---

## Bug yang Ditemukan dan Diperbaiki

1. **[KRITIS] RamaShop status check salah** — `body.status !== true` sementara API return `body.success = true` → semua payment status check throw error → transaksi tidak pernah bisa selesai
2. **[KRITIS] Config Firebase key dikomentari** — Firebase Auth tidak bisa init di environment yang baca `config.js`
3. **[KRITIS] TELEGRAM_WEBHOOK_SECRET hilang** — webhook Telegram return 503, owner tidak bisa balas chat user
4. **[MEDIUM] Chatbot endpoints salah di config.js** — `kimi` bukan endpoint yang ada; harusnya `gpt4`
5. **[MEDIUM] RamaStatus type incomplete** — TypeScript tidak kenal `"expired"` dan `"failed"` dari API → runtime type errors
6. **[MEDIUM] Payment expired dari gateway tidak dihandle** — jika RamaShop mark deposit expired sebelum local timer, order tetap PENDING selamanya
7. **[LOW] CommonJS require() di ESM** — circular dependency risk di auth/sync route
8. **[LOW] img.clerk.com di next.config** — legacy Clerk domain, project sudah pakai Firebase
9. **[LOW] config.js di-typecheck** — ratusan TS errors palsu karena file env terbaca sebagai JS

---

## Rekomendasi Pengembangan Berikutnya

### Prioritas Tinggi
1. **Cookie security**: Cookie `firebase_token` saat ini di-set via JavaScript (`document.cookie`) — rentan XSS. Migrasikan ke `httpOnly` cookie via server route `/api/auth/set-cookie` yang menerima token dan set cookie server-side.

2. **Rate limiting**: Endpoint `/api/payment/create` dan `/api/chat/ai` tidak ada rate limiting per user/IP. Bisa disalahgunakan. Implementasikan dengan `upstash/ratelimit` atau middleware sederhana berbasis Redis/KV.

3. **Error monitoring**: Tambahkan Sentry atau similar untuk track error production.

4. **RamaShop webhook** (jika tersedia nanti): Saat ini menggunakan polling setiap 5 detik. Jika RamaShop menambah webhook support di masa mendatang, ganti polling dengan event-driven untuk efisiensi.

### Prioritas Medium
5. **Payment retry**: Saat ini jika order expired, user harus beli ulang dari awal (order baru). Implementasikan flow retry yang re-use productId dan tier.

6. **Email notifikasi**: Kirim email ke customer saat pembayaran berhasil (product key delivery).

7. **Admin 2FA**: Dashboard admin tidak ada 2FA. Tambahkan TOTP atau magic link untuk keamanan.

8. **Cloudinary optimization**: Gunakan Cloudinary transformations untuk auto-resize gambar produk.

### Prioritas Rendah
9. **PWA support**: Tambahkan `manifest.json` dan service worker untuk pengalaman mobile yang lebih baik.

10. **SEO metadata**: Halaman produk tidak ada Open Graph tags. Tambahkan untuk social sharing.

11. **Analytics**: Integrasikan Google Analytics atau Plausible untuk tracking conversion.

12. **Migrasikan baseUrl ke paths-only**: TypeScript 7.0 akan remove `baseUrl`. Gunakan hanya `paths` dengan `"@/*": ["./src/*"]`.
