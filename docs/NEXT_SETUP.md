# Next Setup

## Fitur Mendatang
- **Integrasi Kurir:** Untuk pengiriman produk fisik jika di masa depan toko tidak hanya menjual produk digital.
- **Sistem Diskon/Kupon:** Fitur untuk admin membuat kode promo untuk pelanggan.
- **Subscription/Langganan:** Pembayaran berulang otomatis untuk produk "premium".

## Planned Refactors
- **Zod Validation Terpusat:** Melanjutkan implementasi Zod di semua endpoint API untuk validasi `req.body` yang seragam.
- **Pemisahan Service Layer:** Memisahkan logika bisnis dari route API handler ke dalam `src/services/` agar lebih mudah di-test.

## Performance & Security Improvements
- **Rate Limiting:** Menggunakan Upstash Redis atau in-memory rate limit pada endpoint publik seperti chat dan reviews.
- **Rotasi Secret Keys:** Melakukan rotasi secara berkala untuk key Clerk, database, Telegram, dan payment gateway.
- **Server-Side Pagination:** Mengubah tabel admin dari rendering semua order ke pagination (batas per halaman) untuk performa yang lebih baik.
