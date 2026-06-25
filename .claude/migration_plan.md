# Firebase → Auth.js + Prisma Migration Plan

**Date**: 2026-06-25  
**Project**: Lumakara-Store (Digital Store)  
**Current Stack**: Firebase Auth + Firestore  
**Target Stack**: Next.js 15 + Prisma 6 + PostgreSQL (Neon) + Auth.js v5 + bcrypt

---

## Ringkasan Perubahan

| Komponen | Sebelum | Sesudah |
|----------|---------|---------|
| **Database** | Firebase Firestore | PostgreSQL (Neon) + Prisma |
| **Authentication** | Firebase Auth | Auth.js v5 |
| **Session** | Firebase token | Database session |
| **Password** | N/A (OAuth only) | bcrypt (hashed) |
| **OAuth Providers** | Google, GitHub (Firebase) | Google, GitHub (Auth.js) |
| **State Management** | AuthContext + Firebase | Auth.js built-in + Prisma |

---

## TAHAP 1: Hapus Firebase Sepenuhnya

### Files to Delete
- `src/config/firebase.ts` — Firebase client initialization
- `src/config/firebase-admin.ts` — Firebase Admin SDK (jika tidak dipakai di tempat lain)
- `src/context/AuthContext.tsx` — Firebase auth context

### Files to Modify
- **`src/config/env.ts`** — Hapus firebaseClient & firebaseAdmin sections
- **`src/app/providers.tsx`** — Hapus AuthProvider (akan diganti Auth.js middleware)
- **`src/app/layout.tsx`** — Hapus Providers wrapper jika hanya untuk AuthProvider
- **`package.json`** — Remove `firebase` dan `firebase-admin` dependencies

### Environment Variables to Remove
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_FIREBASE_CLIENT_EMAIL
NEXT_FIREBASE_PRIVATE_KEY
```

### Verification
```bash
npm run lint        # Pastikan no undefined imports
npm run typecheck   # Check TypeScript errors
grep -r "firebase" src/  # Verify no Firebase references left
```

---

## TAHAP 2: Setup Neon PostgreSQL + Prisma

### Status
✅ **SUDAH SELESAI**
- Neon project: `Lumakara-Store` (orange-paper-16246185)
- Database URL sudah tersedia (pooled & direct)
- Prisma sudah configured

### Files to Modify
- **`src/config/env.ts`** — Update DATABASE section (cleanup Firebase, ensure Neon vars)
- **`.env`** — Set Neon connection strings:
  ```
  NEXT_DATABASE_URL=postgresql://neondb_owner:...@...-pooler.c-2.us-east-1.aws.neon.tech/neondb...
  NEXT_DIRECT_URL=postgresql://neondb_owner:...@...-gentle-fog-ad4jclm2.c-2.us-east-1.aws.neon.tech/neondb...
  ```

### Verification
```bash
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
```

---

## TAHAP 3: Update Prisma Schema untuk Auth.js

### Changes to `prisma/schema.prisma`

**1. Update User Model**
```prisma
model User {
  id            String    @id @default(cuid())  // Auth.js uses cuid by default
  email         String?   @unique
  emailVerified DateTime?  // Optional (tidak pakai email verification)
  name          String?
  image         String?   // Avatar/profile picture
  password      String?   // For credentials provider (nullable for OAuth-only)
  
  role          Role       @default(USER)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  reviews       Review[]

  @@index([role])
  @@index([status])
  @@index([email])
}
```

**2. Add Account Model** (for OAuth providers)
```prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String  // oauth, credentials
  provider           String  // google, github
  providerAccountId  String  // ID from provider
  
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

**3. Add Session Model** (for session management)
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**4. Add VerificationToken Model** (untuk future use, tidak pakai sekarang)
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Note on User.id
- Saat ini: `String @id` (Firebase UID)
- Sesudah: `String @id @default(cuid())` (Auth.js default)
- **Action**: Ini akan require data migration jika ada existing users

### Execution
```bash
npx prisma migrate dev --name add_auth_models
# or
npx prisma db push  # if no migration needed
```

---

## TAHAP 4: Install & Configure Auth.js v5

### 1. Update Dependencies

**Current**: `next-auth@4.24.14`  
**Target**: `next-auth@^5.0.0` (or latest v5)

```bash
npm install next-auth@latest @auth/prisma-adapter
npm install bcryptjs  # Already installed, but ensure it's there
```

### 2. Create `src/auth.ts` (Auth.js Configuration)

Core configuration file with:
- Prisma adapter
- Credentials provider (email + bcrypt)
- Google OAuth provider
- GitHub OAuth provider
- Session configuration (JWT or database)
- Callbacks untuk role management

### 3. Create `src/middleware.ts` (Route Protection)

Middleware untuk:
- Protect dashboard routes
- Redirect unauthenticated users
- Check user role
- CSRF protection (built-in Auth.js)

### 4. Update `src/app/api/auth/[...nextauth]/route.ts`

Auth.js API route handler:
```bash
mkdir -p src/app/api/auth/[...nextauth]
# Create route.ts with NextAuth handler
```

### 5. Update Environment Variables

```env
# Auth.js
NEXTAUTH_URL=http://localhost:3000  # or https://yourdomain.com
NEXTAUTH_SECRET=<generate strong random string>

# OAuth Providers (existing)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## TAHAP 5: Implementasi Register, Login, OAuth

### 1. Create Register API Route
- `src/app/api/auth/register/route.ts`
- Validate email & password
- Hash password dengan bcrypt
- Create user di database
- Return success/error

### 2. Update Login Components
- **`src/app/login/page.tsx`** — update LoginForm
  - Email + password input
  - "Sign in with Google" button
  - "Sign in with GitHub" button
  - Gunakan `signIn()` dari `next-auth/react`

- **`src/app/register/page.tsx`** — update RegisterForm
  - Name, email, password inputs
  - Call `/api/auth/register`
  - Redirect ke login after success

### 3. Create Logout Handler
- Update header/navbar logout button
- Call `signOut()` dari `next-auth/react`

### 4. Handle OAuth Callbacks
- Auth.js automatically handle: `google` → match email or create user
- Auth.js automatically handle: `github` → match email or create user
- Prisma adapter automatically sync to database

---

## TAHAP 6: Dashboard & Role-Based Access

### 1. Middleware untuk Role Checking
Update `src/middleware.ts`:
- `/dashboard` → ADMIN only (check role)
- `/account` → authenticated users only
- `/admin/*` → ADMIN only

### 2. Separate Dashboards
- `src/app/account/page.tsx` — User dashboard
- `src/app/admin/page.tsx` — Admin dashboard

### 3. Update Protected Routes
```bash
# Routes requiring authentication
/account/*
/dashboard/*
/admin/*

# Routes requiring admin role
/dashboard
/admin/*
```

---

## File Structure (After Migration)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...]nextauth]/
│   │   │   │   └── route.ts      ← NEW (NextAuth handler)
│   │   │   ├── register/
│   │   │   │   └── route.ts      ← NEW (Register endpoint)
│   │   │   └── logout/
│   │   │       └── route.ts      ← NEW (optional, for explicit logout)
│   │   ├── ...existing routes...
│   │
│   ├── login/
│   │   └── page.tsx              ← UPDATED (use signIn from nextauth)
│   ├── register/
│   │   └── page.tsx              ← UPDATED (use /api/auth/register)
│   ├── account/
│   │   └── page.tsx              ← UPDATED (use useSession)
│   ├── dashboard/
│   │   └── page.tsx              ← UPDATED (role check)
│   ├── admin/
│   │   └── page.tsx              ← UPDATED (admin only)
│   ├── layout.tsx                ← UPDATED (remove AuthProvider)
│   └── providers.tsx             ← UPDATED (only ThemeProvider + Toaster)
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          ← UPDATED (use signIn)
│   │   ├── RegisterForm.tsx       ← UPDATED (use /api/auth/register)
│   │   ├── PublicRoute.tsx        ← UPDATED (use useSession)
│   │   └── LogoutButton.tsx       ← NEW (use signOut)
│   └── ...existing...
│
├── config/
│   ├── env.ts                     ← UPDATED (remove Firebase, add Auth.js vars)
│   ├── firebase.ts                ← DELETE
│   ├── firebase-admin.ts          ← DELETE
│   └── ...existing...
│
├── context/
│   ├── AuthContext.tsx            ← DELETE
│   └── ...existing...
│
├── auth.ts                        ← NEW (Auth.js configuration)
│
└── middleware.ts                  ← NEW (Route protection)

prisma/
├── schema.prisma                  ← UPDATED (User, Account, Session models)
└── migrations/
    └── [timestamp]_add_auth_models/
        └── migration.sql          ← NEW (add auth tables)
```

---

## Implementation Order (Recommended)

```
1. TAHAP 1: Hapus Firebase
   ✓ Delete files
   ✓ Update env.ts
   ✓ Remove from providers.tsx
   ✓ Run lint & typecheck

2. TAHAP 2: Setup Neon (SUDAH SELESAI)
   ✓ Verify connection

3. TAHAP 3: Update Prisma
   ✓ Modify schema.prisma
   ✓ Run migration
   ✓ Seed initial data (optional)

4. TAHAP 4: Setup Auth.js
   ✓ Update package.json
   ✓ Create auth.ts
   ✓ Create middleware.ts
   ✓ Create [...nextauth]/route.ts
   ✓ Update .env

5. TAHAP 5: Implementasi Auth
   ✓ Create /api/auth/register
   ✓ Update LoginForm
   ✓ Update RegisterForm
   ✓ Create LogoutButton
   ✓ Test email/password login
   ✓ Test Google OAuth
   ✓ Test GitHub OAuth

6. TAHAP 6: Testing & Deployment
   ✓ Test all routes
   ✓ Test role-based access
   ✓ Verify no Firebase calls remain
   ✓ Security review
   ✓ Deploy
```

---

## Key Decisions & Rationale

| Decision | Why |
|----------|-----|
| **Auth.js v5** | Latest, stable, best Prisma integration |
| **Prisma Adapter** | Auto sync sessions to database, no additional code |
| **bcryptjs** | Standard for password hashing, already installed |
| **Database Sessions** | More secure than JWT in cookies |
| **Middleware.ts** | Built-in Next.js protection, no external lib needed |
| **Cuid for User.id** | Auth.js default, consistent with rest of models |

---

## Known Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| **User.id change** | Migrate existing user IDs, or create new User table & map old to new |
| **Existing Firebase users** | Provide migration script to sync Firebase users to PostgreSQL |
| **Session loss on deploy** | Sessions in database persist across deploys |
| **OAuth token expiry** | Auth.js handles refresh automatically via Prisma adapter |

---

## Testing Checklist

- [ ] Email + password register
- [ ] Email + password login
- [ ] Google OAuth login (creates user if new)
- [ ] GitHub OAuth login (creates user if new)
- [ ] OAuth linking to existing account
- [ ] Logout clears session
- [ ] Middleware protects /dashboard (admin only)
- [ ] Middleware protects /account (user only)
- [ ] No Firebase references in code
- [ ] npm run lint passes
- [ ] npm run typecheck passes
- [ ] npm run build succeeds

---

## Rollback Plan

If migration fails:
1. Revert git commits
2. Restore firebase.ts, firebase-admin.ts, AuthContext.tsx
3. Restore .env Firebase variables
4. Roll back Prisma migration: `npx prisma migrate resolve --rolled-back [migration_name]`
5. Restart Firebase-based auth

---

## Timeline Estimate

| Phase | Time |
|-------|------|
| Tahap 1 (Remove Firebase) | 15 min |
| Tahap 2 (Neon setup) | ✅ DONE |
| Tahap 3 (Prisma schema) | 15 min |
| Tahap 4 (Auth.js config) | 30 min |
| Tahap 5 (Routes + UI) | 60 min |
| Tahap 6 (Testing) | 30 min |
| **Total** | **~2.5 hours** |

---

## Questions for User Approval

1. **User.id migration**: Saat ini menggunakan Firebase UID. Apakah ada existing users yang perlu dimigrasikan? Atau mulai fresh dengan user baru saja?
2. **Session persistence**: Prefer database sessions (lebih aman) atau JWT sessions?
3. **Email verification**: Requirement? (Plan currently: NO email verification)
4. **Password reset**: Perlu implementasi? (Plan currently: NO, bisa ditambah later)
5. **Google/GitHub secret**: Sudah punya OAuth app credentials?

