# Next Setup — Panduan Developer Berikutnya

Dokumen ini merangkum tahap pengembangan selanjutnya, fitur yang belum lengkap,
refactor yang disarankan, serta peningkatan performa & keamanan untuk **Digital Store**.
Disusun berdasarkan analisis spesifikasi di folder `docs/` vs. kode aktual.

---

## 1. Tahapan Pengembangan Berikutnya

1. **Realtime untuk chat & dashboard.** Saat ini chat (`/api/chat/messages`) dan
   notifikasi order pada admin di-*poll* (interval 5s / 15s). Spesifikasi
   (`Chat-Bot-Owner.md`, `Admin-Dashboard.md`) menyebut **WebSocket/SSE**.
   Migrasikan ke SSE (`text/event-stream`) atau WebSocket agar update instan dan
   beban DB turun.
2. **Rotasi & manajemen secret.** Lihat bagian Keamanan — kredensial lama masih
   ada di git history dan **wajib dirotasi**.
3. **Pengujian otomatis.** Belum ada test sama sekali. Tambahkan unit + integration test
   (lihat Technical Debt).

---

## 2. Fitur yang Perlu Dibuat / Dilengkapi

| Fitur | Status saat ini | Yang perlu dikerjakan |
| --- | --- | --- |
| Chat realtime (owner bridge) | Polling `/api/chat/messages` | SSE/WebSocket push, indikator status `delivered`/`read` |
| Auto-reply chat owner (3 menit) | Belum terlihat | Job/timer auto-reply sesuai `Chat-Bot-Owner.md` edge case |
| Retry Telegram (QUEUED + 3x) | Notifikasi best-effort (`.catch`) | Antrian + retry dengan backoff saat Telegram down |
| Dashboard realtime notif | Polling | WebSocket untuk PENDING/PAID/EXPIRED |
| Pengurangan stok | **Sudah ditambahkan** (decrement saat PAID) | Tambah UI peringatan stok habis + cegah checkout saat stok 0 |
| Manual status update (admin) | Endpoint ada | Validasi transisi status + audit log |
| Review produk | Route `reviews` ada | Anti review-bombing (verifikasi pembelian, rate limit) |
| Halaman Settings | Ada | Uji koneksi Telegram/payment, simpan konfigurasi website |

---

## 3. Refactor yang Disarankan

- **Tipe respons gateway terpusat.** `safeJson<T>()` di `src/lib/payment.ts`
  kini generic; lanjutkan pola yang sama untuk semua boundary eksternal
  (NeoXR, Telegram) agar tidak ada `any`.
- **Validasi input terpusat.** Tambahkan **Zod** untuk memvalidasi body request
  di API routes (saat ini validasi manual & tersebar). Sesuai prinsip
  *Validate at Boundaries* pada `Agent-Skill/`.
- **Helper auth admin.** Pusatkan pengecekan role ADMIN (Clerk metadata /
  `ADMIN_USER_IDS`) ke satu util agar konsisten di seluruh route admin.
- **Konstanta bersama.** Pindahkan angka ajaib (mis. batas 4000 karakter chat,
  interval polling) ke modul konstanta.
- **Migrasi `next lint` → ESLint CLI.** `next lint` deprecated di Next 16.
  Jalankan `npx @next/codemod@canary next-lint-to-eslint-cli .`.

---

## 4. Peningkatan Performa

- Ganti polling chat/dashboard dengan SSE/WebSocket (kurangi query berulang).
- Tambahkan indeks DB pada kolom yang sering difilter (`orders.status`,
  `orders.userId`, `chat_sessions.userId`).
- Pakai caching/ISR untuk halaman katalog produk publik (`/products`).
- Lazy-load komponen berat dashboard (chart) — `/dashboard` first-load JS ~228 kB.
- Pertimbangkan pagination server-side untuk daftar order & produk besar.

---

## 5. Peningkatan Keamanan

> **PENTING — rotasi kredensial.** File `.env` sebelumnya **ter-commit** ke repo.
> Walau kini sudah di-untrack, nilainya masih ada di **git history**. Rotasi semua:
> `DATABASE_URL`, `PAYMENT_API_KEY`, `CHATBOT_API_KEY`, `TELEGRAM_BOT_TOKEN`,
> `CF_TURNSTILE_SECRET`, dan key Clerk. Pertimbangkan membersihkan history
> (`git filter-repo` / BFG) bila repo bersifat publik.

Sudah diperbaiki pada iterasi ini:

- Endpoint status pembayaran kini **wajib login** dan **owner-only** (401/403).
- Transisi `PENDING → PAID` kini **atomik & idempotent** (anti double-fulfillment).
- Webhook Telegram kini **fail-closed** bila `TELEGRAM_WEBHOOK_SECRET` kosong.
- Order ID & product key kini memakai **CSPRNG** (`crypto`), bukan `Math.random()`.
- Batas panjang pesan chat (4000 karakter).

Masih disarankan:

- **Rate limiting** pada endpoint publik (chat, support, reviews) — belum ada.
  Gunakan mis. Upstash Ratelimit atau middleware token-bucket.
- **Autentikasi endpoint chat.** Sesuai spesifikasi, chat memang anonim
  (userId dari localStorage). Bila ingin lebih ketat, ikat sesi chat ke
  identitas Clerk untuk user yang login.
- **Verifikasi pembelian** sebelum boleh menulis review (anti review-bombing).
- **Audit log** untuk aksi admin (update status order, blokir user).
- **Validasi amount pada webhook/polling** sudah ada; pertahankan saat refactor.

---

## 6. Technical Debt

- **Tidak ada test.** Tambahkan:
  - Unit test untuk `src/lib/payment.ts` (generateOrderId/ProductKey, safeJson),
    `src/lib/chat.ts` (fallback v1→v2), `src/lib/telegram.ts` (parseOwnerReply).
  - Integration test untuk alur pembayaran (idempotency PAID, auth status route).
- **`next lint` deprecated** (Next 16) — migrasi ke ESLint CLI.
- **Git history mengandung secret** — perlu rotasi + (opsional) pembersihan history.
- **Realtime masih polling** — beban DB & latensi.
- **Boundary eksternal lain masih longgar** — terapkan tipe + Zod secara menyeluruh.
- **Tidak ada CI** — tambahkan pipeline (lint + typecheck + build + test) di GitHub Actions.
