# Digital Store — Project Overview

**Nama Website:** Digital Store
**URL Live:** https://www.lumakara.biz.id/
**GitHub Repository:** https://github.com/Lumakara/p

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React.js
- TypeScript
- Tailwind CSS

### Backend
- TypeScript (Next.js API Routes / Server Actions)
- Prisma ORM
- PostgreSQL (hosted di Neon Cloud)

### Layanan & Integrasi Eksternal
| Kegunaan | Layanan | Env Variable |
| Authentication | Clerk | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Database | Neon Cloud (PostgreSQL) | `DATABASE_URL` |
| Payment Gateway | RamaShop | `PAYMENT_API_KEY`, `PAYMENT_BASE_URL` |
| AI Chatbot | NeoXR API (v1 & v2) | `CHATBOT_API_KEY` |
| Notifikasi Owner | Telegram Bot API | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Captcha | Cloudflare Turnstile | `CF_TURNSTILE_SECRET`, `NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY` |
| Media/Image CDN | Cloudinary | `CLOUDINARY_URL` |
| Hosting | Vercel | — |
| Storage sementara | Local Storage (browser) | — |

> ⚠️ **simpan buat file .env_example atau di Vercel Environment Variables.

---

## Dokumentasi Teknis

| Layanan | Link Docs |
| Neon (Full Backend) | https://neon.com/docs/get-started/full-backend-quickstart |
| Clerk (Next.js) | https://clerk.com/docs/nextjs/getting-started/quickstart |
| Cloudinary (Next.js) | https://next.cloudinary.dev/installation |
| NeoXR AI v1 | https://api.neoxr.eu/run/S2ltaSBLMiAoTW9kZWwp |
| NeoXR AI v2 | https://api.neoxr.eu/run/Q2hhdCBHUFQtNA== |
| RamaShop Payment | https://ramashop.my.id/docs.html |
| Postman | https://learning.postman.com/docs/getting-started/overview/ |

---

## Halaman & Route

### Halaman Publik (User)
| Route | Deskripsi |
| `/` | Landing page / homepage |
| `/products` | Daftar semua produk digital |
| `/products/[id]` | Detail produk |
| `/checkout/[orderId]` | Halaman pembayaran + tampilkan QRIS |
| `/success/[orderId]` | Halaman konfirmasi pembayaran berhasil |
| `/failed/[orderId]` | Halaman pembayaran gagal / expired |
| `/sign-in` | Halaman login (via Clerk) |
| `/sign-up` | Halaman registrasi (via Clerk) |

### Halaman Admin (Protected)
| Route | Deskripsi |
| `/dashboard` | Overview: total order, revenue, user aktif |
| `/dashboard/products` | Manajemen produk (CRUD) |
| `/dashboard/orders` | Daftar semua transaksi |
| `/dashboard/users` | Manajemen user |
| `/dashboard/settings` | Konfigurasi website (nama, logo, dll.) |

### API Routes (Backend)
| Endpoint | Method | Deskripsi |
| `/api/payment/create` | POST | Membuat order baru & request ke payment gateway |
| `/api/payment/status/[orderId]` | GET | Polling status pembayaran |
| `/api/webhook/payment` | POST | Menerima webhook dari payment gateway |
| `/api/chat/ai` | POST | Kirim pesan ke AI chatbot |
| `/api/chat/owner` | POST | Kirim pesan ke owner via Telegram |
| `/api/telegram/webhook` | POST | Menerima balasan owner dari Telegram |

---

## Fitur Aplikasi

### Fitur User
- Browsing & beli produk digital
- Pembayaran via QRIS (tanpa keluar halaman)
- Real-time status pembayaran (WebSocket / polling)
- Riwayat transaksi
- Review & rating produk (dengan avatar)
- Chat dengan AI chatbot (fallback otomatis v1 → v2)
- Chat langsung dengan owner (real-time via Telegram bridge)

### Fitur UI/UX
- Dark Mode / Light Mode (toggle, persistent di localStorage)
- Multi-bahasa: Indonesia & English
- Responsive design (mobile-first, bottom navigation)
- Background music opsional

### Fitur Admin Dashboard
- Overview statistik (revenue, order, user)
- Manajemen produk: tambah, edit, hapus, atur stok
- Manajemen order: lihat detail, ubah status manual
- Manajemen user: lihat daftar, blokir/aktifkan akun
- Notifikasi real-time via Telegram Bot setiap ada transaksi baru
- Log error pembayaran

---

## Authentication

Provider login yang tersedia (via Clerk):
1. GitHub OAuth
2. Google OAuth
3. Email / Username / Nomor Telepon

---

## Dokumen Pendukung

Baca file berikut untuk detail alur kerja masing-masing fitur:
- [`Pay-Gateway.md`] — Alur lengkap payment gateway
- [`Chat-Bot-Owner.md`] — Alur chat bot & chat owner real-time
- [`Admin-Dashboard.md`] — Spesifikasi admin panel

---

## Catatan Pengerjaan

- Pahami dokumentasi setiap layanan sebelum mulai integrasi
- Semua credential disimpan di `.env_example` untuk saya implementasi kan secara manual di file .env
- Prisma schema harus di-migrate sebelum testing backend
- Jalankan `vercel env pull` untuk sync env dari Vercel ke local
- Buatkan file manual setup dengan detail
- buatkan file next setup dengan detail
- buatkan file perubahan atau apa saja yang sudah kamu terapkan, dan bug/eror yang masih ada 