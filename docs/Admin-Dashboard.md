# 🛠️ Admin Dashboard — Spesifikasi Fitur

Dashboard admin adalah halaman terpisah yang hanya bisa diakses oleh user dengan role `ADMIN`. Semua route `/dashboard/*` harus dilindungi oleh middleware autentikasi.

---

## Akses & Keamanan

- Autentikasi via Clerk (sama dengan user biasa)
- Role `ADMIN` disimpan di database / Clerk metadata
- Middleware Next.js mengecek role di setiap request ke `/dashboard/*`
- Jika bukan admin → redirect ke `/` atau tampilkan halaman `403 Forbidden`

---

## Halaman 1: Overview (`/dashboard`)

Menampilkan statistik utama dalam bentuk kartu ringkasan:

| Kartu | Data yang Ditampilkan |
|---|---|
| Total Revenue | Total pendapatan hari ini / bulan ini |
| Total Order | Jumlah order hari ini / bulan ini |
| Order Berhasil | Jumlah transaksi dengan status PAID |
| Order Gagal/Expired | Jumlah transaksi EXPIRED/FAILED |
| User Aktif | Jumlah user yang login hari ini |
| Produk Aktif | Jumlah produk yang sedang dijual |

**Grafik:**
- Line chart: Revenue per hari (7 hari terakhir)
- Bar chart: Jumlah order per produk (top 5)

**Tabel transaksi terbaru:**
- 10 transaksi terbaru dengan kolom: Order ID, User, Produk, Nominal, Status, Waktu

---

## Halaman 2: Manajemen Produk (`/dashboard/products`)

### Tampilan
- Tabel daftar produk dengan kolom: Nama, Harga, Stok, Status (Aktif/Nonaktif), Aksi

### Fitur
- **Tambah Produk** — form modal dengan field:
  - Nama produk
  - Deskripsi (rich text / markdown)
  - Harga (Rupiah)
  - Stok (angka atau "unlimited")
  - Gambar produk (upload via Cloudinary)
  - Status: Aktif / Nonaktif
  - Kategori

- **Edit Produk** — form yang sama, pre-filled dengan data existing

- **Hapus Produk** — konfirmasi dialog sebelum hapus; produk yang sudah punya order tidak bisa dihapus (hanya bisa dinonaktifkan)

- **Toggle Aktif/Nonaktif** — tombol langsung di tabel tanpa perlu buka modal

---

## Halaman 3: Manajemen Order (`/dashboard/orders`)

### Tampilan
- Tabel daftar semua order dengan filter dan search

### Kolom Tabel
| Kolom | Keterangan |
|---|---|
| Order ID | Kode unik transaksi |
| User | Nama / email buyer |
| Produk | Nama produk yang dibeli |
| Nominal | Harga yang dibayar |
| Status | PENDING / PAID / EXPIRED / FAILED |
| Waktu | Tanggal & jam order dibuat |
| Aksi | Tombol lihat detail |

### Filter
- Filter by status (dropdown)
- Filter by tanggal (date range picker)
- Search by Order ID atau nama user

### Detail Order
Klik Order ID membuka halaman detail:
- Semua informasi transaksi
- Timeline status (Pending → Paid / Expired)
- Log webhook yang diterima
- Tombol **Update Status Manual** (khusus untuk kasus edge case)

---

## Halaman 4: Manajemen User (`/dashboard/users`)

### Tampilan
- Tabel daftar semua user yang pernah registrasi

### Kolom Tabel
| Kolom | Keterangan |
|---|---|
| User ID | ID dari Clerk |
| Nama | Nama lengkap |
| Email | Alamat email |
| Provider | google / github / email |
| Total Order | Jumlah order yang pernah dibuat |
| Status | Aktif / Diblokir |
| Bergabung | Tanggal registrasi |

### Fitur
- **Lihat Detail User** — riwayat order user tersebut
- **Blokir User** — user tidak bisa login atau checkout
- **Aktifkan User** — membatalkan blokir

---

## Halaman 5: Pengaturan (`/dashboard/settings`)

### Pengaturan Website
- Nama website
- Logo (upload via Cloudinary)
- Deskripsi singkat (untuk SEO)
- Warna tema utama

### Pengaturan Notifikasi
- Toggle: aktifkan/nonaktifkan notifikasi Telegram
- Test kirim notifikasi Telegram
- Telegram Chat ID (editable)

### Pengaturan Pembayaran
- Status payment gateway (cek koneksi)
- Waktu expired pembayaran (default: 15 menit, bisa diubah)

---

## Notifikasi Real-Time di Dashboard

Admin dashboard menerima notifikasi real-time via WebSocket untuk:
- Transaksi baru masuk (🟡 PENDING)
- Transaksi berhasil dibayar (🟢 PAID)
- Transaksi expired/gagal (🔴 EXPIRED)

Notifikasi muncul sebagai toast/popup di pojok kanan atas halaman dashboard.

---

## Keamanan Admin Dashboard

- Semua endpoint `/api/admin/*` wajib verifikasi role ADMIN di server-side
- Log setiap aksi admin (siapa, apa, kapan) ke tabel `admin_logs`
- Tidak ada aksi destruktif (hapus semua, dll.) tanpa konfirmasi
- Session admin expire setelah 8 jam tidak aktif
