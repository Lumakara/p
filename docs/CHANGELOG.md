# Changelog

## 2026-06-16 (Implementasi Sesuai NEXT_SETUP.md)

### Added
- Realtime Server-Sent Events (SSE) untuk update Chat Messages (`/api/chat/messages`).
- Realtime SSE untuk notifikasi Admin Dashboard (`/api/admin/stats/stream`).
- Peringatan stok habis di halaman detail produk dan pencegahan checkout jika stok `0`.
- Anti review-bombing: verifikasi status pembelian (`PAID`) sebelum user dapat memberikan ulasan produk.
- Auto-reply (3 menit) untuk owner chat yang belum terbalas.
- Mekanisme antrean/retry untuk pengiriman notifikasi Telegram (`status: "QUEUED"`).
- Audit log & validasi transisi status serta pengurangan stok manual di Admin Dashboard (`PATCH /api/admin/orders/[id]`).

### Changed
- Migrasi `next lint` ke `eslint .` (ESLint CLI) menggunakan FlatCompat di `eslint.config.mjs`.
- Extract utilitas respons generik `safeJson` ke file tersendiri (`src/lib/fetch.ts`).
- Seeding data disempurnakan dengan list produk yang lebih realistis.

### Fixed
- Error pemanggilan `setInterval` yang kurang stabil dalam serverless environment Next.js diatasi menggunakan *opportunistic background jobs* yang dijalankan pada saat *tick* SSE.
- Tipe data `any` pada berbagai tempat (Chat Widget, Dashboard, Admin API) telah diperbaiki dengan penyesuaian tipe `unknown` atau typing interface spesifik.
