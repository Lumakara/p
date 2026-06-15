# Update V2 — Auth Migration, Payment, Chatbot & Examples

Catatan lengkap perubahan iterasi ke-2 berdasarkan permintaan:
ganti Clerk → Auth.js (Google/GitHub/email), wiring + test payment gateway,
chatbot GPT-3 → fallback GPT-4, `.env`, contoh produk, dan dokumentasi.

---

## 1. Yang Sudah Ditambahkan / Diubah

### Autentikasi — Clerk DIHAPUS, diganti Auth.js (NextAuth v5)
- **Dihapus:** `@clerk/nextjs`, `@clerk/themes`, `ClerkProvider`, `clerkMiddleware`,
  semua komponen Clerk (`SignedIn/SignedOut/UserButton/SignInButton/SignOutButton`),
  halaman catch-all `sign-in/[[...]]` & `sign-up/[[...]]`.
- **Ditambah:**
  - `src/auth.config.ts` — config edge-safe (provider Google & GitHub, callback JWT/session, admin by email).
  - `src/auth.ts` — config Node (Prisma adapter + Credentials/email-password + bcrypt + event sinkron role).
  - `src/app/api/auth/[...nextauth]/route.ts` — handler Auth.js.
  - `src/app/api/auth/register/route.ts` — registrasi email/password (bcrypt).
  - `src/types/next-auth.d.ts` — augmentasi `session.user.id` & `role`.
  - `src/components/auth/AuthForm.tsx` — form login/daftar (Google, GitHub, email/password).
  - `src/components/auth/UserMenu.tsx` — avatar dropdown (profil, pesanan, dashboard, keluar).
  - `src/app/sign-in/page.tsx` & `src/app/sign-up/page.tsx` — halaman kustom.
  - Middleware (`src/middleware.ts`) memakai Auth.js, proteksi `/dashboard`, `/orders`, `/api/admin`.
- **3 metode login** sesuai permintaan: **Google** (Google Cloud Console), **GitHub**, **Email/Password**.
- **Admin** ditentukan via `ADMIN_EMAILS` (otomatis jadi ADMIN saat login/daftar).
  Default sudah diisi `fakhulrohman2@gmail.com`.

### Database (Prisma)
- Model `User` dirombak untuk Auth.js: `password` (hash), `image`, `emailVerified`,
  plus model standar **Account**, **Session**, **VerificationToken**.
- Relasi `Order`/`Review` tetap kompatibel (User.id = cuid).

### Payment Gateway (RamaShop)
- Sudah terintegrasi penuh sesuai docs (`src/lib/payment.ts`): `deposit/create`,
  `deposit/status/{id}`, `balance` — header `X-API-Key`.
- **Hasil test live dengan API key Anda (`rg_5798...c8c`):**
  - `GET /balance` → **BERHASIL**: `{ balance: 0, username: "lumakara", email: "fakhulrohman2@gmail.com" }`
    → koneksi & autentikasi **terbukti bekerja**.
  - `POST /deposit/create` → server membalas **`"Deposit sedang maintenance, silakan coba lagi nanti."`**
    → ini **status maintenance di sisi RamaShop**, bukan bug kode. QR belum bisa
    dimunculkan SAAT INI karena endpoint deposit mereka sedang maintenance.
    Begitu maintenance selesai, alur QR otomatis berjalan (kode sudah siap).

### Chatbot AI (NeoXR)
- `src/lib/chat.ts`: **primary Chat GPT-3 → fallback Chat GPT-4 → pesan fallback**.
- **Hasil test live (key `3ch2qm`):**
  - `gpt4` (fallback) → **BERHASIL** mengembalikan jawaban.
  - Slug "Chat GPT-3" tidak ter-resolve di API live (mengembalikan halaman docs),
    jadi `CHATBOT_V1_ENDPOINT=gpt3` dan **otomatis fallback ke gpt4** yang sudah teruji.
    Chat tetap berfungsi end-to-end.

### File `.env`
- Dibuat `.env` (tidak di-commit) berisi semua key yang Anda berikan:
  `PAYMENT_API_KEY`, `CHATBOT_API_KEY=3ch2qm`, `AUTH_SECRET` (di-generate),
  `ADMIN_EMAILS`, plus placeholder Neon, Google, GitHub, Telegram, Turnstile, Cloudinary.
- `.env.example` diperbarui (variabel Clerk dihapus, variabel Auth.js ditambah).

### Contoh Produk
- `prisma/seed.ts` diperbarui: **8 contoh produk** lengkap harga, deskripsi, tier,
  rating, badge, stok, dan **gambar yang langsung tampil** (placeholder placehold.co):
  WiFi Install, CCTV, Code Repair, Photo/Video Editing, VPS, Website Dev,
  Streaming Premium (diskon), Design Tool Pro (diskon).

### Frontend & Backend
- Semua section disesuaikan ke Auth.js dan tetap build bersih (40 route).
- `tsc --noEmit` ✓ dan `next build` ✓.

---

## 2. Yang HARUS Di-setup Manual

1. **Neon (database)** — wajib agar app jalan:
   - Buat project di https://console.neon.tech, salin connection string ke
     `DATABASE_URL` (pooled) & `DIRECT_URL` (direct) di `.env`.
   - Jalankan: `npm run db:push` lalu `npm run db:seed`.
2. **Google OAuth (Google Cloud Console):**
   - APIs & Services → Credentials → Create OAuth client ID (Web).
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
     (dan domain produksi `/api/auth/callback/google`).
   - Isi `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`.
3. **GitHub OAuth:**
   - GitHub → Settings → Developer settings → OAuth Apps → New.
   - Callback URL: `http://localhost:3000/api/auth/callback/github`.
   - Isi `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`.
4. **Telegram** (opsional, untuk notifikasi owner): isi `TELEGRAM_BOT_TOKEN` &
   `TELEGRAM_CHAT_ID`, lalu set webhook ke `/api/telegram/webhook`.
5. **Cloudinary / Turnstile** (opsional): isi jika ingin upload gambar & captcha.
6. **Payment**: API key sudah diisi. Tunggu maintenance RamaShop selesai untuk QR.

> Untuk produksi (Vercel): tambahkan semua variabel `.env` ke Project Settings,
> set `NEXT_PUBLIC_APP_URL`, dan tambahkan redirect URI OAuth domain produksi.

---

## 3. Bug / Keterbatasan yang Diketahui

1. **Deposit RamaShop maintenance** — `deposit/create` mengembalikan pesan
   maintenance, jadi QR belum bisa diverifikasi live sekarang (sisi server mereka).
2. **Slug "Chat GPT-3" tidak pasti** — fallback ke `gpt4` (teruji). Jika Anda tahu
   slug GPT-3 yang benar, cukup ubah `CHATBOT_V1_ENDPOINT` di `.env`.
3. **Butuh DATABASE_URL** — tanpa Neon terisi, login/registrasi/seed tidak jalan
   (build tetap sukses, halaman publik tetap render kosong).
4. **Real-time pakai polling** (chat 5 dtk, dashboard 15 dtk), bukan WebSocket/SSE.
5. **Checkout QRIS 1 produk per transaksi** (deposit per nominal).
6. **Verifikasi email** belum diaktifkan (registrasi langsung aktif). Bisa ditambah
   provider Email/Resend bila perlu.
7. **Blokir user** menandai status `BLOCKED` di DB + mencegah login credentials;
   sesi OAuth aktif belum diputus paksa.

---

## 4. Next Step (disarankan)

- [ ] Isi `.env` (Neon, Google, GitHub) → `npm run db:push && npm run db:seed`.
- [ ] Tes login Google/GitHub/email + cek role admin (`fakhulrohman2@gmail.com`).
- [ ] Setelah maintenance RamaShop selesai, tes beli produk → QR muncul → bayar.
- [ ] Set Telegram webhook untuk balasan owner & notifikasi.
- [ ] (Opsional) Tambah verifikasi email, multi-item checkout, cron rekonsiliasi
      order PENDING, dan real-time SSE/WebSocket.

---

## 5. Ringkasan Test

| Item | Perintah / Endpoint | Hasil |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | ✓ bersih |
| Build | `npx next build` | ✓ 40 route |
| Payment auth | `GET /api/public/balance` | ✓ akun `lumakara` |
| Payment QR | `POST /api/public/deposit/create` | ⚠️ maintenance (sisi RamaShop) |
| Chatbot fallback | `GET /api/gpt4?...&apikey=3ch2qm` | ✓ jawaban AI |

> Setup detail lain: lihat `MANUAL-SETUP.md`, arsitektur: `NEXT-SETUP.md`,
> changelog awal: `CHANGES.md`.
