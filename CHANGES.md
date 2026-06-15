# CHANGES — Migrasi Digital Store ke Next.js

Dokumen ini mencatat semua perubahan yang diterapkan, fitur baru, dan
bug/keterbatasan yang masih ada.

## Ringkasan

Project di-**rombak total** dari **Vite + React SPA (client-only, localStorage,
Supabase/Firebase/EmailJS, Pakasir)** menjadi **Next.js 15 full-stack** sesuai
spesifikasi di `docs/`.

---

## Yang Dihapus (stack lama)

- Vite (`vite.config.ts`, `index.html`, `src/main.tsx`, `tsconfig.app/node.json`)
- `src/App.tsx`, `src/AdminApp.tsx`, `src/App.css`
- React Router, Supabase, Firebase, EmailJS, Pakasir (dari `package.json`)
- Section/hook/komponen lama yang terikat react-router & lib lama
  (`src/sections/*`, `src/pages/*`, `useCart/usePayment/useProducts/useSupport`,
  `Header/BottomNav/Sidebar/ProductReviews/PromoModal/WelcomeScreen` versi lama)

## Yang Ditambahkan (stack baru)

### Infrastruktur
- Next.js 15 App Router + React 19 + TypeScript
- Tailwind + shadcn/ui (dipertahankan), next-themes (dark/light)
- Prisma 6 + skema lengkap untuk Neon PostgreSQL (`prisma/schema.prisma`)
- Seed data 6 produk (`prisma/seed.ts`)
- `.env.example` lengkap + `.gitignore`

### Autentikasi (Clerk)
- `ClerkProvider`, middleware proteksi `/dashboard` & `/api/admin`
- Halaman `/sign-in`, `/sign-up` (mendukung GitHub, Google, Email/Username/Phone)
- Role admin via `publicMetadata.role` atau `ADMIN_USER_IDS`
- Sinkronisasi user Clerk → DB

### Payment Gateway (RamaShop)
- Integrasi sesuai docs resmi: **QRIS deposit + polling** (header `X-API-Key`)
- `POST /api/payment/create`, `GET /api/payment/status/[orderId]`
- Harga diambil dari DB, validasi nominal, idempotensi, log webhook
- Halaman checkout (QRIS + countdown + polling), success, failed
- Health check saldo di dashboard settings

### AI Chatbot (NeoXR)
- AI v1 (`/api/kimi`) → fallback otomatis ke v2 (`/api/gpt4`) → pesan fallback
- Riwayat chat tersimpan di DB

### Chat Owner (Telegram bridge)
- Forward pesan user ke Telegram, owner balas (`U-<id> :` atau reply)
- Webhook `/api/telegram/webhook` + widget polling balasan

### Notifikasi Owner (Telegram)
- Notifikasi otomatis: transaksi baru, lunas, expired/gagal, tiket support
- Tombol test notifikasi di dashboard

### Captcha (Cloudflare Turnstile)
- Widget client + verifikasi server pada create payment & support
- Dilewati otomatis jika belum dikonfigurasi (mode dev)

### Media (Cloudinary)
- Upload gambar produk dari dashboard via `next-cloudinary`

### Halaman Publik
- Home (hero + produk populer), Products (filter kategori + search),
  Product detail (tier, beli, review + rating dengan avatar),
  Cart, Orders (riwayat), Profile (pengaturan), Support
- Dark/Light mode, multi-bahasa (ID/EN), musik latar opsional
- Mobile-first + bottom navigation, chat widget mengambang

### Admin Dashboard (`/dashboard`)
- Overview: 8 kartu statistik, grafik revenue 7 hari, top produk,
  transaksi terbaru, notifikasi real-time (polling + toast)
- Produk: CRUD + upload Cloudinary + toggle aktif + hapus aman
- Pesanan: filter/search + detail + log webhook + update status manual
- Pengguna: daftar + blokir/aktifkan + statistik order
- Pengaturan: status integrasi, konfigurasi situs, test Telegram

---

## Bug / Keterbatasan yang Masih Ada

1. **Real-time pakai polling, bukan WebSocket/SSE.** Chat owner & notifikasi
   dashboard memakai polling (5s untuk chat, 15s untuk dashboard). Sesuai untuk
   Vercel serverless. Untuk real-time penuh, perlu layanan terpisah (Pusher/Ably).

2. **Pembayaran QRIS = 1 produk per transaksi.** RamaShop deposit dibuat per
   nominal. Checkout multi-item dari keranjang memproses item pertama saja
   (ada peringatan). Multi-item butuh pemecahan order / agregasi nominal.

3. **API key contoh mungkin tidak aktif.** Saat development, key NeoXR contoh
   (`3ch2qmp`) mengembalikan "apikey is not registered" — ganti dengan key aktif.
   Key RamaShop perlu diverifikasi saldo/akun aktif.

4. **Status pembayaran via polling status, bukan webhook.** Docs RamaShop tidak
   menyediakan webhook; route `/api/webhook/payment` di spec lama TIDAK dibuat.
   Deteksi pembayaran terjadi saat user di halaman checkout (polling). Jika user
   menutup tab sebelum bayar, status diperbarui saat ada GET status berikutnya
   (mis. dari dashboard atau halaman orders). Pertimbangkan cron untuk
   rekonsiliasi order PENDING yang ditinggalkan.

5. **Gambar produk default** (`/images/products/*.svg`) belum disertakan sebagai
   file fisik di `public/`. Tambahkan asset atau gunakan upload Cloudinary.
   Gambar yang hilang akan tampil rusak sampai diganti.

6. **Telegram webhook butuh URL publik.** Di localhost gunakan tunnel
   (mis. cloudflared/ngrok) agar balasan owner masuk.

7. **Migrasi data lama tidak dilakukan.** Data localStorage SPA lama (cart/orders
   lokal) tidak dipindahkan; data sekarang di PostgreSQL.

8. **Blokir user** menandai status di DB (`BLOCKED`) dan dicek aplikasi; belum
   memutus sesi Clerk secara paksa. Untuk blokir penuh, integrasikan Clderk
   Backend API (ban user).

---

## Langkah Selanjutnya (disarankan)

- [ ] Tambahkan asset gambar produk ke `public/images/products/`
- [ ] Cron/route rekonsiliasi order PENDING (mis. Vercel Cron)
- [ ] Multi-item checkout (agregasi 1 QRIS)
- [ ] Ban user via Clerk Backend API saat status BLOCKED
- [ ] Unit/integration test untuk route pembayaran
- [ ] Upgrade real-time ke SSE/WebSocket bila perlu

> Setup kredensial: lihat `MANUAL-SETUP.md`. Arsitektur: lihat `NEXT-SETUP.md`.
