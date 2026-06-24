# Environment Variables Setup Guide

This guide explains how to configure your `.env` file for the Lumakara Store application. Copy `.env.example` to `.env` and fill in the values as described below.

## ✅ Already Configured (No Action Needed)

These variables are already set up in `.env.example` and are working:

### Database (Neon PostgreSQL)
```
NEXT_DATABASE_URL=postgresql://neondb_owner:npg_1UayJzRE9XcT@ep-autumn-waterfall-atz0q7nd-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXT_DIRECT_URL=postgresql://neondb_owner:npg_1UayJzRE9XcT@ep-autumn-waterfall-atz0q7nd.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
✅ Already configured and working.

### Firebase Client (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBm8DB_XMU0gFqy0xpzkZIIR-so6ZxL9Xg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lumakara-store.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lumakara-store
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lumakara-store.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=393776397618
NEXT_PUBLIC_FIREBASE_APP_ID=1:393776397618:web:d98887ef5c00cb19a3ab2b
NEXT_MEASUREMENT_ID=G-LD3J428TRK
```
✅ Already configured and working.

### Firebase Admin (Private)
```
NEXT_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lumakara-store.iam.gserviceaccount.com
NEXT_FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```
✅ Already configured and working.

### Admin User ID
```
NEXT_ADMIN_USER_IDS=PyDKZDKnQPcOc1q0C2FrGIO7sP32
```
✅ Already configured.

### AI Chatbot (NeoXR)
```
NEXT_CHATBOT_API_KEY=3ch2qm
NEXT_CHATBOT_BASE_URL=https://api.neoxr.eu/api
NEXT_CHATBOT_V1_ENDPOINT=gpt4
NEXT_CHATBOT_V2_ENDPOINT=claude
```
✅ Already configured and working.

### Payment Gateway (RamaShop)
```
NEXT_PAYMENT_BASE_URL=https://ramashop.my.id/api/public
NEXT_PAYMENT_API_KEY=rg_579817853049e312a0be8fd35a6c8c
NEXT_PAYMENT_EXPIRY_MINUTES=5
```
✅ Already configured. **IMPORTANT**: If payment is not working, verify this API key is active on RamaShop account.

---

## ⚠️ Needs Configuration

### 1. App URL
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
- **Development**: `http://localhost:3000`
- **Production**: Your app's domain (e.g., `https://lumakara.com`)
- **Purpose**: Used for redirects and public links

### 2. Google OAuth
Get from: https://console.cloud.google.com/
```
NEXT_GOOGLE_CLIENT_ID=
NEXT_GOOGLE_CLIENT_SECRET=
```
- Create a new OAuth 2.0 credential (Web application)
- Add Authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
- Copy Client ID and Client Secret

### 3. GitHub OAuth (Optional)
Get from: https://github.com/settings/developers
```
NEXT_GITHUB_CLIENT_ID=
NEXT_GITHUB_CLIENT_SECRET=
```
- Create a new OAuth App
- Set Authorization callback URL: `{NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
- Copy Client ID and Client Secret

### 4. Telegram Bot
Get from: https://t.me/botfather
```
NEXT_TELEGRAM_BOT_TOKEN=
NEXT_TELEGRAM_CHAT_ID=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
TELEGRAM_WEBHOOK_SECRET=
```

**Steps**:
1. Start chat with @botfather on Telegram
2. Create new bot (command `/newbot`)
3. Set webhook (command `/setwebhook`)
4. Copy bot token → `NEXT_TELEGRAM_BOT_TOKEN`
5. Find your chat/group ID → `NEXT_TELEGRAM_CHAT_ID`
6. Your bot username (without @) → `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
7. Generate a random secret string → `TELEGRAM_WEBHOOK_SECRET`

### 5. Cloudinary (For Image Uploads)
Get from: https://cloudinary.com/console
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_CLOUDINARY_API_KEY=
NEXT_CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

**Steps**:
1. Create Cloudinary account
2. Get Cloud Name from dashboard
3. Go to Settings → API Keys → Copy API Key
4. Copy API Secret (keep private!)
5. Create Upload Preset (Settings → Upload) → Copy name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 6. Cloudflare Turnstile (CAPTCHA)
Get from: https://dash.cloudflare.com/
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_TURNSTILE_SECRET=
```

**Steps**:
1. Go to Turnstile in Cloudflare dashboard
2. Create new site
3. Copy Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Copy Secret Key → `NEXT_TURNSTILE_SECRET`

---

## 🔍 Verification Checklist

After filling `.env`, verify with:

```bash
npm run typecheck    # Check env types
npm run dev          # Start dev server
```

Check the logs for validation errors:
```
❌ Missing required environment variables:
  - PAYMENT_API_KEY: Required but not set
```

---

## 📝 Notes

- **NEXT_PUBLIC_** variables are visible in browser (don't put secrets)
- **Private variables** (no prefix) are server-only (safe for secrets)
- Copy `.env.example` → `.env` in your local machine
- **Never commit `.env`** to git (it's in .gitignore)
- Firebase private key must preserve `\n` newlines exactly as shown
- Telegram webhook is called at: `{NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

---

## 🚀 Payment Gateway Status

The RamaShop payment gateway integration is **fully implemented**:
- ✅ QRIS deposit creation endpoint working
- ✅ Status polling with auto-retry implemented
- ✅ Order lifecycle management implemented
- ✅ Telegram notifications on payment

**If payment is not working**:
1. Verify `NEXT_PAYMENT_API_KEY` is correct and active
2. Test with: `npm run dev` → create order → check console logs
3. Check that your RamaShop account has sufficient balance
4. Verify webhook URL (if using production): `{NEXT_PUBLIC_APP_URL}/api/payment/webhook`
