# 💳 Alur Kerja Payment Gateway

**Studi kasus:** User membeli produk digital dan membayar menggunakan QRIS tanpa keluar dari website.

---

## Gambaran Umum Sistem

```
User (Frontend)
    ↕ HTTP / WebSocket
Backend (Next.js API)
    ↕ REST API
RamaShop Payment Gateway
    ↕ Webhook (POST callback)
Backend → Telegram Bot (notifikasi owner)
Backend → Frontend (update real-time)
```

---

## Alur Kerja Lengkap

### Langkah 1 — User Membuka Halaman Produk

User melihat produk di halaman `/products/[id]`:
```
Nama   : Premium 30 Hari
Harga  : Rp50.000
Status : Tersedia
```
User menekan tombol **[Beli Sekarang]**.

---

### Langkah 2 — Frontend Mengirim Request Pembuatan Order

Frontend mengirim request ke backend:
```http
POST /api/payment/create
Content-Type: application/json

{
  "productId": "prod_123",
  "userId": "user_abc"
}
```

> Catatan: Frontend tidak boleh mengirim harga. Harga diambil dari database di backend.

---

### Langkah 3 — Backend Memvalidasi & Membuat Order

Backend melakukan:
1. Validasi `productId` — apakah produk ada dan masih tersedia?
2. Validasi `userId` — apakah user sudah login?
3. Ambil harga produk dari database (bukan dari request)
4. Generate `orderId` unik (format: `ORD-YYYYMMDD-XXXXX`)
5. Simpan order ke database dengan status `PENDING`

```sql
INSERT INTO orders (id, user_id, product_id, amount, status, created_at)
VALUES ('ORD-20260615-001', 'user_abc', 'prod_123', 50000, 'PENDING', NOW())
```

**Error handling:**
- Produk tidak ditemukan → return `404 Product not found`
- User belum login → return `401 Unauthorized`
- Stok habis → return `400 Product out of stock`

---

### Langkah 4 — Backend Request Transaksi ke Payment Gateway

Backend mengirim request ke RamaShop:
```http
POST https://ramashop.my.id/api/transaction/create
Authorization: Bearer PAYMENT_API_KEY

{
  "order_id": "ORD-20260615-001",
  "amount": 50000,
  "product_name": "Premium 30 Hari",
  "customer_id": "user_abc",
  "expired_minutes": 15
}
```

---

### Langkah 5 — Payment Gateway Mengembalikan Data Pembayaran

RamaShop mengembalikan response:
```json
{
  "status": "success",
  "transaction_id": "TRX-RG-789",
  "qris_url": "https://ramashop.my.id/qris/TRX-RG-789.png",
  "expired_at": "2026-06-15T10:15:00Z"
}
```

Backend menyimpan `transaction_id` dan `expired_at` ke database.

---

### Langkah 6 — Backend Kirim Notifikasi Telegram (Status: Pending)

Backend mengirim pesan ke Telegram owner:
```
🟡 TRANSAKSI BARU

Order     : ORD-20260615-001
Produk    : Premium 30 Hari
Total     : Rp50.000
User      : user_abc
Waktu     : 15 Jun 2026, 10:00 WIB
Expired   : 15 Jun 2026, 10:15 WIB

Status    : ⏳ MENUNGGU PEMBAYARAN
```

---

### Langkah 7 — Backend Mengirim Data ke Frontend

Backend merespons request awal dari frontend:
```json
{
  "orderId": "ORD-20260615-001",
  "qrisUrl": "https://ramashop.my.id/qris/TRX-RG-789.png",
  "amount": 50000,
  "expiredAt": "2026-06-15T10:15:00Z"
}
```

---

### Langkah 8 — Frontend Menampilkan Halaman Pembayaran

Frontend di halaman `/checkout/ORD-20260615-001` menampilkan:
- QR Code QRIS (dari `qrisUrl`)
- Countdown timer hitung mundur ke `expiredAt`
- Nominal pembayaran (Rp50.000)
- Status saat ini: **Menunggu Pembayaran**
- Polling ke `/api/payment/status/ORD-20260615-001` setiap 5 detik

---

### Langkah 9 — User Melakukan Pembayaran

User scan QRIS menggunakan aplikasi mobile banking / dompet digital.

---

### Langkah 10 — Payment Gateway Mengirim Webhook

Setelah pembayaran terdeteksi, RamaShop mengirim webhook ke backend:
```http
POST /api/webhook/payment
Content-Type: application/json
X-Signature: <HMAC-SHA256 dari payload>

{
  "event": "payment.success",
  "transaction_id": "TRX-RG-789",
  "order_id": "ORD-20260615-001",
  "amount_paid": 50000,
  "paid_at": "2026-06-15T10:08:32Z"
}
```

---

### Langkah 11 — Backend Memverifikasi Webhook

Backend melakukan validasi ketat:
```
✅ Validasi HMAC-SHA256 signature (cocokkan dengan PAYMENT_WEBHOOK_SECRET)
✅ Cocokkan order_id dengan database
✅ Pastikan amount_paid == amount di database (tidak boleh kurang)
✅ Pastikan status order masih PENDING (cegah double-processing)
```

Jika semua validasi lolos:
- Update status order di database: `PENDING → PAID`
- Catat waktu pembayaran (`paid_at`)
- Kirim notifikasi Telegram (Langkah 12)
- Kirim update ke frontend (Langkah 13)

**Jika validasi gagal:**
- Log error ke sistem
- Return `400 Bad Request` ke payment gateway
- Jangan update status order

---

### Langkah 12 — Backend Kirim Notifikasi Telegram (Status: Berhasil)

```
🟢 PEMBAYARAN BERHASIL

Order     : ORD-20260615-001
Produk    : Premium 30 Hari
Total     : Rp50.000
User      : user_abc
Dibayar   : 15 Jun 2026, 10:08 WIB

Status    : ✅ LUNAS
```

---

### Langkah 13 — Backend Mengirim Update ke Frontend

Melalui WebSocket atau SSE (Server-Sent Events), backend mengirim:
```json
{
  "orderId": "ORD-20260615-001",
  "status": "PAID",
  "paidAt": "2026-06-15T10:08:32Z",
  "productKey": "KEY-XXXX-YYYY-ZZZZ"
}
```

---

### Langkah 14 — Frontend Menampilkan Halaman Sukses

Frontend redirect ke `/success/ORD-20260615-001` dan menampilkan:
- ✅ Icon sukses
- Detail produk yang dibeli
- Product key / kode aktivasi (jika ada)
- Tombol "Lihat Riwayat Transaksi"
- Countdown sebelum auto-redirect ke `/products`

---

## ❌ Skenario: Pembayaran Expired atau Gagal

**Trigger:** Countdown habis ATAU payment gateway kirim event `payment.expired` / `payment.failed`

### Notifikasi Telegram:
```
🔴 TRANSAKSI EXPIRED/GAGAL

Order     : ORD-20260615-001
Produk    : Premium 30 Hari
Total     : Rp50.000
User      : user_abc

Status    : ❌ EXPIRED
Alasan    : Waktu pembayaran habis (15 menit)
Log Error : [isi detail error dari payment gateway jika ada]
```

### Update Frontend:
```json
{
  "orderId": "ORD-20260615-001",
  "status": "EXPIRED",
  "reason": "Payment timeout after 15 minutes",
  "canRetry": true
}
```

Frontend di halaman `/failed/ORD-20260615-001` menampilkan:
- ❌ Icon gagal
- Alasan kegagalan
- Log error (jika ada)
- Tombol **[Coba Lagi]** — membuat order baru dengan produk yang sama

---

## 🔐 Keamanan (Wajib Diimplementasikan)

| Area | Aturan |
|---|---|
| **Frontend** | Tidak boleh menentukan harga atau status pembayaran |
| **Frontend** | Tidak boleh menyimpan API key payment gateway |
| **Backend** | Wajib verifikasi HMAC signature di setiap webhook |
| **Backend** | Wajib validasi nominal — tolak jika `amount_paid < amount` |
| **Backend** | Wajib cek idempotency — jangan proses webhook yang sama dua kali |
| **Backend** | Simpan semua webhook log ke database untuk audit |
| **Env** | Semua credential di `.env`, tidak di-hardcode |

---

## Skema Database (Tabel `orders`)

```sql
CREATE TABLE orders (
  id            VARCHAR PRIMARY KEY,       -- ORD-YYYYMMDD-XXXXX
  user_id       VARCHAR NOT NULL,
  product_id    VARCHAR NOT NULL,
  amount        INTEGER NOT NULL,           -- dalam Rupiah
  status        VARCHAR DEFAULT 'PENDING', -- PENDING | PAID | EXPIRED | FAILED
  transaction_id VARCHAR,                  -- ID dari payment gateway
  paid_at       TIMESTAMP,
  expired_at    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
```
NOTE : SEMUA ENDPOINT SESUAIKAN DARI DOCS PAYMENT GATEWAY NYA