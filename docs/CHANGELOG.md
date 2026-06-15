# Changelog & Bug Report — Digital Store

Catatan seluruh perubahan yang diterapkan pada iterasi hardening ini, file yang
dimodifikasi, bug yang diperbaiki, bug yang masih tersisa, dan rekomendasi solusi.

Pendekatan: **Analyze First → Plan → Implement → Validate** (sesuai aturan di
folder `Agent-Skill/`). Tidak ada perubahan kode sebelum analisis selesai 100%.

---

## [Unreleased] — Spec-driven hardening

### Ditambahkan (Added)
- `eslint.config.mjs` — flat config standar Next.js (`next/core-web-vitals` +
  `next/typescript`). Membuat `npm run lint` jalan **non-interaktif** (sebelumnya
  hang menunggu pemilihan config karena ESLint 9 butuh flat config).
- `src/lib/payment.ts` → `generateProductKey()` terpusat berbasis CSPRNG.
- Pengurangan **stok produk** otomatis saat order menjadi `PAID`.
- `docs/MANUAL_SETUP.md`, `docs/NEXT_SETUP.md`, `docs/CHANGELOG.md`.

### Diperbaiki (Fixed / Security)
- **Auth bypass status pembayaran** — `GET /api/payment/status/[orderId]` kini
  mewajibkan login (`401`) dan hanya pemilik order (`403`). Sebelumnya cek
  kepemilikan ter-*short-circuit* saat user tidak login sehingga siapa pun bisa
  membaca status order + product key orang lain.
- **Race condition konfirmasi pembayaran** — transisi `PENDING → PAID` kini
  **atomik & idempotent** via `updateMany` berkondisi di dalam `$transaction`.
  Hanya satu request yang "menang" dan melakukan fulfillment (mint key, kurangi
  stok, notifikasi); request lain mengembalikan state yang sudah tersimpan.
  Sebelumnya dua poll bersamaan bisa sama-sama memproses → duplikasi product key
  & notifikasi ganda.
- **Telegram webhook fail-open** — `POST /api/telegram/webhook` kini **fail-closed**:
  jika `TELEGRAM_WEBHOOK_SECRET` tidak diset, request ditolak `503`. Sebelumnya
  seluruh verifikasi dilewati saat secret kosong → injeksi balasan owner palsu.
- **ID & key dapat ditebak** — `generateOrderId()` dan product key tidak lagi
  memakai `Math.random()`; kini memakai `crypto.randomInt` / `crypto.randomBytes`.
- **Secret ter-commit** — `.env` (berisi kredensial asli) **di-untrack** dari repo
  (`git rm --cached .env`; sudah ada di `.gitignore`). Placeholder bocor di
  `.env.example` (`PAYMENT_API_KEY`, `CHATBOT_API_KEY`) diganti menjadi placeholder.
- **Build gagal di prerender** — `.env.example` kini memakai **dummy Clerk key
  berformat valid** (`pk_test_Y2xlcmsuZXhhbXBsZS5jb20k`). Penyebab kegagalan build
  / deploy sebelumnya: Clerk menolak format `pk_test_xxx` saat prerender statis.
- **Validasi input chat** — `/api/chat/ai` & `/api/chat/owner` menolak pesan
  > 4000 karakter (`400`).
- **Type-safety (`no-explicit-any`)** — menghilangkan `any` di `src/lib/payment.ts`
  (envelope generic untuk respons gateway), `src/lib/chat.ts` (`extractMessage`),
  `src/lib/telegram.ts` (`parseOwnerReply`). Menghapus directive
  `eslint-disable` yang tidak terpakai di `src/app/dashboard/page.tsx`.

### File yang Dimodifikasi
| File | Perubahan |
| --- | --- |
| `.env` | Di-untrack dari git (kredensial tidak lagi di repo) |
| `.env.example` | Dummy Clerk key valid + sanitasi `PAYMENT_API_KEY`/`CHATBOT_API_KEY` |
| `src/lib/payment.ts` | CSPRNG IDs, `generateProductKey`, `safeJson<T>` + envelope, guard malformed |
| `src/app/api/payment/status/[orderId]/route.ts` | Auth owner-only, transisi PAID atomik/idempotent, decrement stok, pakai key terpusat |
| `src/app/api/telegram/webhook/route.ts` | Fail-closed saat secret kosong |
| `src/app/api/chat/ai/route.ts` | Batas panjang pesan 4000 |
| `src/app/api/chat/owner/route.ts` | Batas panjang pesan 4000 |
| `src/lib/chat.ts` | Hapus `any` di `extractMessage` |
| `src/lib/telegram.ts` | Tipe `TelegramUpdate` untuk `parseOwnerReply` |
| `src/app/dashboard/page.tsx` | Hapus `eslint-disable` tak terpakai |
| `eslint.config.mjs` | **Baru** — flat config ESLint |
| `docs/MANUAL_SETUP.md`, `docs/NEXT_SETUP.md`, `docs/CHANGELOG.md` | **Baru** — dokumentasi |

---

## Validasi

| Cek | Perintah | Hasil |
| --- | --- | --- |
| Type checking | `npm run typecheck` | ✅ exit 0 (tanpa error) |
| Lint | `npm run lint` | ✅ exit 0 — *No ESLint warnings or errors* |
| Build production | `npm run build` | ✅ exit 0 — semua route ter-compile & prerender |

---

## Bug Report

### Bug yang Berhasil Diperbaiki
1. Auth bypass endpoint status pembayaran (akses order milik orang lain).
2. Race condition fulfillment pembayaran (double product key / notifikasi ganda).
3. Telegram webhook menerima request tak terautentikasi saat secret kosong.
4. Order ID / product key dapat ditebak (`Math.random`).
5. Stok produk tidak pernah berkurang saat pembelian sukses.
6. Build/deploy gagal akibat format Clerk key tidak valid di `.env.example`.
7. `npm run lint` hang (tidak ada ESLint flat config).
8. Kredensial asli ter-commit (`.env`) + placeholder bocor di `.env.example`.
9. Pesan chat tanpa batas panjang.
10. Penggunaan `any` melanggar standar type-safety (3 titik).

### Bug / Error yang Masih Tersisa
| # | Masalah | Dampak | Rekomendasi Solusi |
| --- | --- | --- | --- |
| 1 | **Secret masih ada di git history** | Kredensial lama bisa diambil dari commit lama | **Rotasi semua key sekarang**; opsional bersihkan history dengan `git filter-repo`/BFG |
| 2 | Tidak ada **rate limiting** di endpoint publik (chat, support, reviews) | Rentan abuse/spam | Tambah Upstash Ratelimit / middleware token-bucket |
| 3 | Chat & dashboard masih **polling**, bukan realtime | Latensi + beban DB | Migrasi ke SSE/WebSocket sesuai spesifikasi |
| 4 | **Review-bombing** mungkin (belum verifikasi pembelian) | Rating tidak tepercaya | Wajibkan order PAID sebelum review + rate limit |
| 5 | Edge case chat owner (auto-reply 3 menit, retry Telegram 3x) belum lengkap | Pesan bisa hilang saat Telegram down | Implement antrian + retry backoff + auto-reply |
| 6 | **Tidak ada test & CI** | Regresi sulit terdeteksi | Tambah unit/integration test + GitHub Actions (lint/typecheck/build/test) |
| 7 | `next lint` deprecated (Next 16) | Akan berhenti bekerja | Migrasi ke ESLint CLI (`next-lint-to-eslint-cli`) |

> Detail tahapan lanjutan ada di [`docs/NEXT_SETUP.md`](./NEXT_SETUP.md).
