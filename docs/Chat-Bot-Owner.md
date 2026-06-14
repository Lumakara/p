# 💬 Alur Kerja Chat System

Website memiliki **dua mode chat** yang terintegrasi dalam satu UI:

| Mode | Keterangan |
|---|---|
| 🤖 **AI Chatbot** | Menjawab otomatis menggunakan NeoXR API |
| 👤 **Chat Owner** | Terhubung langsung ke owner via Telegram (real-time) |

User bisa beralih antar mode melalui tombol toggle di widget chat.

---

## Arsitektur Sistem

```
User (Browser)
    ↕ WebSocket / SSE
Backend (Next.js API)
    ↕ HTTP          ↕ Telegram Bot API
NeoXR AI API     Telegram (Owner)
```

---

## Bagian 1: AI Chatbot

### Alur Kerja

#### Langkah 1 — User Membuka Widget Chat

Saat website pertama dibuka:
- Sistem membuat `userId` unik (UUID) dan menyimpan ke `localStorage`
- Widget chat muncul di pojok kanan bawah (mode default: AI Chatbot)
- Tampilkan pesan sambutan: *"Halo! Ada yang bisa saya bantu?"*

#### Langkah 2 — User Mengirim Pesan

User mengetik pesan dan tekan kirim. Frontend mengirim:
```http
POST /api/chat/ai
Content-Type: application/json

{
  "userId": "user-uuid-abc123",
  "message": "Produk premium itu apa saja?",
  "sessionId": "session-xyz"
}
```

#### Langkah 3 — Backend Request ke NeoXR AI

Backend meneruskan ke AI v1 terlebih dahulu:
```http
POST https://api.neoxr.eu/...  (AI v1 endpoint)
Authorization: Bearer CHATBOT_API_KEY

{
  "message": "Produk premium itu apa saja?",
  "session_id": "session-xyz"
}
```

**Fallback ke AI v2:**
Jika AI v1 mengembalikan error (timeout >5 detik, status 5xx, atau koneksi gagal), backend otomatis retry ke AI v2 endpoint tanpa user perlu tahu.

```
AI v1 → error/timeout → AI v2 → jika masih error → return pesan fallback
```

**Pesan fallback jika kedua AI gagal:**
```
"Maaf, asisten AI sedang tidak tersedia. Silakan hubungi owner langsung melalui tombol Chat Owner."
```

#### Langkah 4 — Backend Mengembalikan Respons ke Frontend

```json
{
  "sender": "ai",
  "message": "Produk premium kami tersedia dalam 3 pilihan: 7 hari, 30 hari, dan 90 hari...",
  "timestamp": "2026-06-15T10:05:00Z",
  "source": "ai_v1"
}
```

#### Langkah 5 — Frontend Menampilkan Balasan

Chat menampilkan balasan AI dengan indikator typing animation sebelum pesan muncul.

---

## Bagian 2: Chat Owner (Real-Time via Telegram Bridge)

### Alur Kerja

#### Langkah 1 — User Beralih ke Mode Chat Owner

User menekan tombol **[Chat dengan Owner]** di widget. Frontend mengirim pesan awal:
```http
POST /api/chat/owner
Content-Type: application/json

{
  "userId": "user-uuid-abc123",
  "message": "Halo admin, saya ingin bertanya soal produk premium."
}
```

#### Langkah 2 — Backend Meneruskan Pesan ke Telegram

Backend mengirim pesan ke chat Telegram owner:
```
📩 PESAN BARU DARI USER

ID User : U-abc123
Waktu   : 15 Jun 2026, 10:05 WIB
Pesan   : "Halo admin, saya ingin bertanya soal produk premium."

Balas dengan format:
U-abc123 : [isi balasan kamu]
```

Backend juga menyimpan pesan ke database untuk riwayat chat.

#### Langkah 3 — Owner Melihat Pesan di Telegram

Owner menerima notifikasi di Telegram dan bisa membalas dengan dua cara:

**Cara 1 — Format teks manual:**
```
U-abc123 : Halo! Silakan tanyakan, saya siap membantu.
```

**Cara 2 — Reply pada pesan Telegram:**
Langsung reply pada pesan notifikasi (Bot otomatis mendeteksi `userId` dari pesan aslinya).

#### Langkah 4 — Telegram Bot Menerima Balasan Owner

Bot Telegram membaca balasan:
- Ekstrak `userId` target: `U-abc123`
- Ekstrak isi balasan: `"Halo! Silakan tanyakan, saya siap membantu."`
- Kirim data ke backend via webhook Telegram

#### Langkah 5 — Backend Kirim Balasan ke Frontend

Backend mencari koneksi aktif `U-abc123` dan mengirim melalui WebSocket atau SSE:
```json
{
  "sender": "owner",
  "message": "Halo! Silakan tanyakan, saya siap membantu.",
  "timestamp": "2026-06-15T10:06:30Z"
}
```

#### Langkah 6 — Frontend Menampilkan Balasan Owner

Chat menampilkan:
```
👤 Admin: "Halo! Silakan tanyakan, saya siap membantu."
          10:06 WIB ✓✓
```
Tanpa perlu refresh halaman.

---

## Edge Cases & Error Handling

### Owner Tidak Membalas dalam 3 Menit

Sistem mengirim auto-reply ke user:
```
"Owner sedang sibuk. Pesan Anda sudah kami terima dan akan dibalas secepatnya.
Atau Anda bisa mencoba AI Chatbot kami untuk pertanyaan umum."
```

### User Menutup Browser / Koneksi Terputus

- Pesan dari owner disimpan ke database sebagai "unread"
- Saat user kembali membuka website dengan `userId` yang sama (dari localStorage), chat history ditampilkan kembali
- Pesan yang belum terbaca ditampilkan dengan badge notifikasi

### Telegram Bot Down / Tidak Merespons

- Backend mendeteksi kegagalan pengiriman ke Telegram
- Simpan pesan ke database dengan status `QUEUED`
- Retry otomatis setiap 30 detik maksimal 3x
- Jika masih gagal, kirim notifikasi error ke admin email
- Tampilkan ke user: *"Pesan terkirim. Owner akan segera merespons."*

### User Baru (Belum Ada Session)

- Jika `localStorage` kosong (private mode / device baru), buat `userId` baru
- Chat history tidak bisa dipulihkan (karena disimpan by `userId`)
- Tampilkan pesan: *"Sesi baru dimulai."*

---

## Skema Database

### Tabel `chat_sessions`
```sql
CREATE TABLE chat_sessions (
  id          VARCHAR PRIMARY KEY,   -- UUID
  user_id     VARCHAR NOT NULL,      -- userId dari localStorage
  mode        VARCHAR NOT NULL,      -- 'ai' | 'owner'
  created_at  TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP
);
```

### Tabel `chat_messages`
```sql
CREATE TABLE chat_messages (
  id          VARCHAR PRIMARY KEY,
  session_id  VARCHAR REFERENCES chat_sessions(id),
  sender      VARCHAR NOT NULL,      -- 'user' | 'ai' | 'owner'
  message     TEXT NOT NULL,
  status      VARCHAR DEFAULT 'sent', -- 'sent' | 'delivered' | 'read'
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Widget Chat

- Widget mengambang di pojok kanan bawah halaman
- Toggle antara mode **AI** dan **Owner** di bagian atas widget
- Indikator status owner: 🟢 Online / 🔴 Offline (berdasarkan waktu aktif terakhir)
- Jika owner offline, tampilkan estimasi respons: *"Biasanya membalas dalam <1 jam"*
- Riwayat chat tersimpan dan muncul kembali saat widget dibuka ulang
- Notifikasi bubble jika ada balasan baru saat widget sedang tertutup
