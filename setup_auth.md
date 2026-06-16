# Panduan Setup Firebase Authentication — DigitalStore

Sistem autentikasi pada DigitalStore dibangun menggunakan **Firebase Authentication SDK terbaru (v10+)** pada sisi client, dan **Firebase Admin SDK** pada sisi server (Next.js API Route) untuk melakukan sinkronisasi user data secara aman ke database **PostgreSQL (via Prisma)**.

---

## 1. Konfigurasi Environment Variables (`.env`)

Tambahkan variabel berikut ke dalam file `.env` Anda di root folder proyek. Ganti nilai placeholder dengan kredensial riil dari Firebase Console Anda.

```env
# ==============================================================================
# FIREBASE CLIENT CONFIGURATION (NEXT_PUBLIC_ prefix makes them accessible to client)
# ==============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# ==============================================================================
# FIREBASE ADMIN SDK CONFIGURATION (Private, server-side only)
# ==============================================================================
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
# Catatan untuk FIREBASE_PRIVATE_KEY: 
# Masukkan seluruh string private key yang didapat dari JSON. Pastikan tanda kutip ganda menyertakan newline (\n).
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL=postgresql://neondb_owner:...
DIRECT_URL=postgresql://neondb_owner:...
```

> [!IMPORTANT]
> Pastikan `FIREBASE_PRIVATE_KEY` diawali dan diakhiri dengan tanda kutip ganda (`"`) karena private key mengandung karakter newline (`\n`). Kode backend didesain untuk otomatis merapikan format newline tersebut dengan `.replace(/\\n/g, '\n')`.

---

## 2. Langkah Setup di Firebase Console

### Langkah A: Membuat Proyek Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Klik **Add Project** dan ikuti panduan pembuatan proyek (berikan nama bebas, contoh: `DigitalStore`).
3. Anda dapat menonaktifkan Google Analytics jika tidak diperlukan.

### Langkah B: Mendaftarkan Web App
1. Di halaman dashboard proyek Firebase baru Anda, klik ikon **Web (`</>`)** di tengah halaman.
2. Berikan nama aplikasi (contoh: `digitalstore-web`).
3. Centang opsi Firebase Hosting jika Anda ingin, lalu klik **Register App**.
4. Firebase akan menampilkan objek konfigurasi `firebaseConfig`. Salin nilai-nilai tersebut ke variabel `.env` yang berawalan `NEXT_PUBLIC_FIREBASE_`.

### Langkah C: Mengaktifkan Authentication Provider
1. Di menu sidebar kiri Firebase Console, klik **Build** > **Authentication**, lalu klik **Get Started**.
2. Masuk ke tab **Sign-in method**.
3. Aktifkan provider berikut:
   - **Email/Password**: Aktifkan opsi ini dan klik *Save*.
   - **Google**: Aktifkan, pilih email dukungan proyek, lalu klik *Save*.
   - **GitHub**: Aktifkan. Anda akan membutuhkan Client ID dan Client Secret dari GitHub. (Lihat langkah di bawah).

---

## 3. Setup OAuth Provider (Google & GitHub)

### Google Authentication
Secara default, Google Auth langsung berjalan setelah diaktifkan di Firebase Console. Namun untuk lingkungan produksi, pastikan Anda menambahkan domain aplikasi Anda ke daftar domain yang diizinkan (*Authorized domains*) di tab **Settings** > **Authorized domains** di halaman Firebase Authentication.

### GitHub Authentication
Untuk menghubungkan GitHub login:
1. Buka akun GitHub Anda, masuk ke **Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**.
2. Isi data aplikasi Anda:
   - **Application name**: `DigitalStore`
   - **Homepage URL**: `http://localhost:3000` (atau domain produksi Anda)
   - **Authorization callback URL**: Salin URL callback yang disediakan oleh Firebase Console di konfigurasi GitHub Provider (formatnya seperti `https://<your-project-id>.firebaseapp.com/__/auth/handler`).
3. Klik **Register application**.
4. Generate a **Client Secret** baru.
5. Salin **Client ID** dan **Client Secret** dari GitHub ke konfigurasi GitHub Provider di Firebase Console, lalu klik *Save*.

---

## 4. Mengunduh Firebase Admin SDK Private Key
Untuk melakukan sinkronisasi user secara aman ke database postgresql (Prisma):
1. Buka Firebase Console, klik ikon roda gigi **Project Settings** di sebelah kiri atas.
2. Masuk ke tab **Service accounts**.
3. Klik tombol **Generate new private key** di bagian bawah.
4. File JSON berisi kredensial admin akan otomatis terunduh ke komputer Anda.
5. Buka file JSON tersebut, lalu salin data berikut ke `.env`:
   - Nilai `client_email` dimasukkan ke `FIREBASE_CLIENT_EMAIL`.
   - Nilai `private_key` dimasukkan ke `FIREBASE_PRIVATE_KEY`.

---

## 5. Struktur File & Penjelasan Implementasi

Sistem autentikasi ini diimplementasikan menggunakan arsitektur modular:

| File Path | Jenis | Deskripsi |
| :--- | :--- | :--- |
| [`src/lib/firebase.ts`](file:///root/p/src/lib/firebase.ts) | Konfigurasi Client | Menginisialisasi Firebase Client SDK, memuat environment variables client, dan mengekspor instansi `auth` serta provider OAuth (Google & GitHub). |
| [`src/lib/firebase-admin.ts`](file:///root/p/src/lib/firebase-admin.ts) | Konfigurasi Server | Menginisialisasi Firebase Admin SDK secara aman tanpa duplikasi instansi, digunakan untuk memverifikasi ID token JWT di backend. |
| [`src/context/AuthContext.tsx`](file:///root/p/src/context/AuthContext.tsx) | React Context | Menyediakan state global untuk data user (`User \| null`) dan `loading`. Memantau perubahan sesi lewat `onAuthStateChanged`, memperbarui cookie token, dan memicu sinkronisasi DB. |
| [`src/hooks/useAuth.ts`](file:///root/p/src/hooks/useAuth.ts) | React Custom Hook | Mengemas fungsi SDK Firebase (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup`, `sendPasswordResetEmail`, `signOut`, `updateProfile`) dengan error handling bahasa Indonesia dan Sonner toasts. |
| [`src/components/auth/ProtectedRoute.tsx`](file:///root/p/src/components/auth/ProtectedRoute.tsx) | UI Guard | Wrapper halaman yang membutuhkan login. Menampilkan loading spinner dan me-redirect user anonim ke `/login`. |
| [`src/components/auth/PublicRoute.tsx`](file:///root/p/src/components/auth/PublicRoute.tsx) | UI Guard | Wrapper halaman login/register/forgot-password. Me-redirect user yang sudah login langsung ke dashboard `/account`. |
| [`src/components/auth/SocialAuth.tsx`](file:///root/p/src/components/auth/SocialAuth.tsx) | UI Component | Tombol login pihak ketiga (Google & GitHub) dengan visual premium, micro-interactions, dan pemuatan state per-tombol. |
| `src/components/auth/...Form.tsx` | UI Form | Form Login, Register, Forgot Password, dan panel edit display name dengan validasi data real-time (Indonesian error messages). |
| `src/app/.../page.tsx` | Next.js Page | Rute halaman `/login`, `/register`, `/forgot-password`, dan `/account` yang responsif, modern, dan terlindungi. |
| [`src/app/api/auth/sync/route.ts`](file:///root/p/src/app/api/auth/sync/route.ts) | API Endpoint | Menerima ID Token JWT, memverifikasinya melalui Admin SDK, dan melakukan `upsert` data user ke database PostgreSQL via Prisma. |

---

## 6. Alur Keamanan & Sinkronisasi Data (Upsert)

1. **State Change**: Saat user login/register, Firebase Client SDK memicu status autentikasi aktif.
2. **JWT Token Retrieval**: `AuthContext` menangkap perubahan tersebut, mengambil ID Token JWT dari Firebase, dan menyimpannya sebagai cookie `firebase_token`.
3. **Database Syncing**: Client memanggil endpoint POST `/api/auth/sync` dengan menyertakan token di header `Authorization: Bearer <token>`.
4. **Token Verification**: Server Next.js memverifikasi token menggunakan Firebase Admin SDK secara kriptografis.
5. **Database Upsert**: Server mengekstrak `uid`, `email`, `displayName`, dan `photoURL`, lalu menyimpannya ke PostgreSQL menggunakan Prisma `upsert`:
   - Jika user baru: Membuat record user baru dengan setelan default `role: USER` dan `status: ACTIVE`.
   - Jika user lama: Memperbarui record jika ada perubahan nama/avatar di Firebase.

---

## 7. Cara Menjalankan secara Lokal

1. Pastikan Anda telah memasang semua dependensi. Jika belum, jalankan:
   ```bash
   npm install
   ```
2. Jalankan migrasi Prisma untuk memastikan skema database PostgreSQL Anda sinkron:
   ```bash
   npx prisma db push
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka browser di [http://localhost:3000/login](http://localhost:3000/login).
