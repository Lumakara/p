# Implementasi Fitur

Daftar perubahan yang dilakukan pada fase ini:

1. **Migrasi Realtime**
   - File: `src/app/api/chat/messages/route.ts` dan `src/components/store/ChatWidget.tsx`
   - Mengubah mekanisme polling HTTP (dengan `setInterval`) menjadi Server-Sent Events (SSE) menggunakan `EventSource`.
   - File: `src/app/api/admin/stats/stream/route.ts` dan `src/app/dashboard/page.tsx`
   - Menerapkan SSE untuk notifikasi pesanan baru (PENDING, PAID, EXPIRED) ke admin.

2. **Chatbot & Telegram Retry**
   - File: `src/lib/chat-jobs.ts`
   - Membuat fungsi utilitas untuk memeriksa pesan antrean (`QUEUED`) dan mem-forward ulang ke Telegram.
   - Mengirim auto-reply setelah 3 menit jika owner tidak membalas.
   - Dipanggil setiap detak SSE di `src/app/api/chat/messages/route.ts`.
   - File: `src/app/api/chat/owner/route.ts` diubah untuk membuat pesan dengan status `QUEUED` secara default dan update ke `SENT` bila Telegram sukses.

3. **Penyempurnaan Checkout & Stok**
   - File: `src/components/store/ProductDetailClient.tsx`
   - Menambahkan pengecekan `product.stock === 0` dan mendisable tombol "Beli Sekarang" serta keranjang.
   
4. **Anti Review-Bombing**
   - File: `src/app/api/products/[id]/reviews/route.ts`
   - Menambahkan verifikasi `prisma.order.findFirst({ where: { status: 'PAID' } })` agar hanya pembeli yang bisa me-review.

5. **Manual Status Update & Audit Log**
   - File: `src/app/api/admin/orders/[id]/route.ts`
   - Menambahkan validasi log transisi status, *product key generation*, dan *stock decrement* saat admin mengubah status order menjadi `PAID` secara manual.

6. **Refactor Code & Linting**
   - Mengubah `eslint.config.mjs` untuk mendukung FlatCompat.
   - Sentralisasi respons fetch dengan `src/lib/fetch.ts` (`safeJson`).
   - Seeding data produk yang realistis di `prisma/seed.ts`.
