# Bug Report

## Bug yang Diperbaiki
- **Double Toasting pada Dashboard:** Polling `setInterval` di Dashboard berpotensi melakukan toast ganda jika order dire-fetch. **Solusi:** Terselesaikan dengan migrasi ke SSE yang merender toast langsung pada *event message* via `knownOrderIds`.
- **ESLint Flat Config Conflict:** Next.js 15+ dengan eslint-config-next memunculkan TypeError (not iterable) saat migrasi otomatis codemod. **Solusi:** Menerapkan `@eslint/eslintrc` `FlatCompat` sebagai pembungkus kompatibilitas flat config.

## Isu yang Tersisa
- **Keterbatasan Serverless untuk Cron:** Karena berjalan di *Vercel Edge/Serverless*, *background worker* untuk Chat Jobs diimplementasikan secara *opportunistic* di dalam SSE stream (bergantung pada koneksi terbuka dari klien).
- **Rekomendasi:** Bila beban aplikasi tinggi, gunakan layanan penjadwalan eksternal seperti Vercel Cron atau Upstash QStash untuk memanggil endpoint secara konsisten setiap 1 menit guna menjalankan `processChatBackgroundJobs()`.
