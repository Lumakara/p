---

[2026-06-25] Review Env, Payment Gateway, OAuth & Prisma

Objective
Mengecek kesesuaian `.env` dengan kode, mengecek fungsionalitas variabel terutama pada payment gateway (RamaShop), menjelaskan folder `prisma`, memverifikasi alur OAuth (Google & GitHub) terkait redirect URLs, dan membuat laporan dokumentasi.

Changes Made
- Menemukan dan memperbaiki bug kecil pada rute admin `/api/admin/payment/history/route.ts` yang membaca `process.env.PAYMENT_API_KEY` secara langsung tanpa melalui modul tersentralisasi (`@/config/env`). Modul ini sekarang menggunakan `env.payment.apiKey`.
- Mengecek status Payment Gateway RamaShop. Key API aktif dan merespon `200 OK` (terverifikasi melalui pemanggilan `GET /balance`).
- Melakukan verifikasi flow OAuth. Tidak diperlukan redirect URL dari `http://localhost:3000/api/auth/callback/...` karena NextAuth tidak digunakan. Autentikasi Firebase via _Popup Client-side_ telah diimplementasikan sepenuhnya di `src/hooks/useAuth.ts`.
- Menganalisis folder `prisma`. Folder tersebut berisi definisi model tabel (schema) database (PostgreSQL - Neon DB) dan seed data awal, yang akan ditranslasikan otomatis oleh prisma client menjadi fungsi CRUD Typescript yang type-safe.

Files Modified
- src/app/api/admin/payment/history/route.ts

Database Changes
- None

Environment Variables
- None

Validation
- npm run lint
- npm run typecheck
- npm run build

Result:
PASS

Manual Testing
1. Curl manual ke API Ramashop (`/api/public/balance`) dengan header `X-API-Key` merespon status HTTP 200.
2. `npm run typecheck` mengembalikan exit code 0.

Security Review
Terdapat satu file (`src/services/chat.ts`) yang membaca API Key tanpa modul ENV terpusat, namun hal ini tidak mengekspos resiko sekuriti langsung, hanya *technical debt*.

Performance Review
Tidak ada isu performance yang ditemukan.

Known Issues
- Linter memunculkan peringatan (warning) tentang `any` dan `unused variables` pada beberapa file React komponen dan hooks (`useAuth.ts`).
- `src/services/chat.ts` belum menggunakan file `@/config/env.ts` untuk memuat variabel.

Recommended Next Steps
Priority High:
- Menyempurnakan pembersihan _typing_ (`any`) dan variabel yang tidak digunakan (ESLint warnings) di dalam folder `src/`.

Priority Medium:
- Memigrasikan semua pemanggilan `process.env` langsung di dalam folder `src/services` agar menggunakan object `env` dari `@/config/env`.

Priority Low:
- Mengonfigurasi _Custom Domain_ pada console Firebase Authentication untuk memastikan Pop-up popup auth Google / GitHub tidak tertahan (blocked) pada environtment *production*.

Setup Notes
Untuk OAuth Google dan GitHub, tidak perlu _Redirect URI_ ke `localhost:3000` di setup konsol provider. Cukup arahkan Redirect URI di konsol Google/GitHub ke `https://<firebase-project-id>.firebaseapp.com/__/auth/handler` seperti yang tercatat di dokumentasi Firebase, karena webapp ini menggunakan Firebase Auth.

---
