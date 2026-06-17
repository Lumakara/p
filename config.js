# **Neon PostgreSQL**:
NEXT_DATABASE_URL=postgresql://neondb_owner:npg_Rs3pU1GTXWxK@ep-young-heart-aojtnjx5-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXT_DIRECT_URL=postgresql://neondb_owner:npg_Rs3pU1GTXWxK@ep-young-heart-aojtnjx5.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# **Google OAuth**
NEXT_GOOGLE_CLIENT_ID=459744557476-18j2vscqhtda2bn5p7pgm98b5inf8pgp.apps.googleusercontent.com
NEXT_GOOGLE_CLIENT_SECRET=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
#   (Catatan: tambahkan Authorized redirect URI nanti — saya kasih tahu URL-nya)

# **GitHub OAuth**
NEXT_GITHUB_CLIENT_ID=Ov23liO7ojYjdCWAekgf
NEXT_GITHUB_CLIENT_SECRET=9b09536d94079ff99c6278949a1ad988b6866026

# **Telegram**:
NEXT_TELEGRAM_BOT_TOKEN=8921540894:AAGM-LoulcJPn7EeiJfngQnNfAqfbbFHz98
NEXT_TELEGRAM_CHAT_ID=6879771598

# **Cloudinary**:
NEXT_CLOUDINARY_CLOUD_NAME=dhhdxaejc
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhhdxaejc
NEXT_CLOUDINARY_API_KEY=248436966115375
NEXT_CLOUDINARY_API_SECRET=n6zBUPVT5IuMZE-qcpqnj6oLefY
NEXT_CLOUDINARY_UPLOAD_PRESET=ecommerce_upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ecommerce_upload

# **Cloudflare Turnstile**:
NEXT_TURNSTILE_SITE_KEY=0x4AAAAAADlTx_RrOXQL9XZc
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADlTx_RrOXQL9XZc
NEXT_TURNSTILE_SECRET=0x4AAAAAADlTx19ShKhERLghgVpcTFITILI

# ---- App ----
NEXT_PUBLIC_APP_URL=https://lumakara.biz.id/

# ---- Payment Gateway ----
NEXT_PAYMENT_BASE_URL=https://ramashop.my.id/api/public
NEXT_PAYMENT_API_KEY=rg_579817853049e312a0be8fd35a6c8c
# Default payment expiry in minutes for QRIS orders.
NEXT_PAYMENT_EXPIRY_MINUTES="15"

# ---- AI Chatbot: NeoXR ----
NEXT_CHATBOT_API_KEY=3ch2qm
NEXT_CHATBOT_BASE_URL=https://api.neoxr.eu/api
NEXT_CHATBOT_V1_ENDPOINT=kimi
NEXT_CHATBOT_V2_ENDPOINT=gpt4

# FIREBASE CLIENT CONFIGURATION (NEXT_PUBLIC_ prefix makes them accessible to client)
#NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBm8DB_XMU0gFqy0xpzkZIIR-so6ZxL9Xg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lumakara-store.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lumakara-store
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lumakara-store.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=393776397618
NEXT_PUBLIC_FIREBASE_APP_ID=1:393776397618:web:1e64ddb466e4892aa3ab2b

# FIREBASE ADMIN SDK CONFIGURATION (Private, server-side only)
NEXT_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lumakara-store.iam.gserviceaccount.com
# Catatan untuk FIREBASE_PRIVATE_KEY: 
# Masukkan seluruh string private key yang didapat dari JSON. Pastikan tanda kutip ganda menyertakan newline (\n).
NEXT_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/eylugMfGYTo4\nM95kcuTXl0QikYZP334Fhoi9TluqMLd19rv0XBimsS1ooPA/MlKMQ79meIcmNVFg\n5EqxlpRH9hPEfL4sCrNABlu8GZfXRSpXjl8HhAEPECT4M0Ex16z2i82HLphUoWZ4\n1fo3ud0C+yUPIhsusxycaRYEu7Z9jJhGDDVCb6wWXTuH60N8HbIi27Glyw42ivRU\nqGuww4Md1jdNWOT0UD50Pqgmp5uRXBw9fNNQlAbQsXG5QqYRayUMxiC7tq0sXXTX\nDS8fipWlYo9R/4D/+JEo5M4iOFrF8V6T2I2YkC+aO7XY2aKMVrOV1mntns82G3Sr\ngC8fCRe7AgMBAAECggEAFBG/nPJoffVw2bUuCQ81xxb2sDzafAKrvb6FFHpjByqG\nABo1Rv5kIwyM+ttrcuQ+XK85H29gkvOhrOsgnQ5wSj6TgdOlRw50DTDdapCwJoL8\nViL4+NuwFLkXduBAZA379fdfOlz64FvuVpnu2OplLMvP7Y8glDt3szkccrCOBwiH\nsvyJPfR986TAUcB+yPu0T4hcnRrbW2idtRomTmNM09Uxtc0JY/8xbu4DkiVR0g5Z\nKTxsGAVNLgUtq7Z5pFumlLrIJo162E/iQlOcHOBqSHiHmhex/Z8RG5WV4KHImU1B\nipEAQ6b9ltLz4Q+1cGo7dXj6QYy6DxcgBNqcQ8+ZYQKBgQD4Eix74Lnc9sl20lfD\nysO3B00nZnzZYoqGOXJiGEDdoS08OtIKlZlOMyoUWowv49FZS47ht7GCcLwbZMns\nmzqn5P9m5EdG0pkfgbT/Jy5cjN27sJGH5nKGVbed9on8Wq5seHd6fa7/tOgsVD7h\ndP621/KqwhKdcx5j4vxRhPnCMQKBgQDFmfHUDEM18XMMNaOUNclw8Wr65MyRZOd0\no4vHKZzgLjVQrd94plLbAaHOybnaF3Q0qvwrDKCUuVDYB54hE03b6n4hb8RSHxQa\n0DmSwHl5IMMjNre5nnWncRiiw60hXo7n081/Auf/kKGW3BcHAMVgTEcdoIkKhju/\nbRIw61kxqwKBgBmmB2NngNAP1BSs+tYLiODLqHaCajYvshLerazmxQ4lNAAeNMlT\nXl5ve9JO6l+pNmP9I/DChV/vOAO9EAOeqRni22VQBO6Vp69SQdx/uJNpHSPixak/\ncmfhRPLYIrwsxAwDCJdpl0Zo9fhfXYECD7Pn7/cnybTtyh6ZwWzMSuaBAoGAUVRh\nYmOBrkwojBfvserJdIEJBSbyw80CLtG5kEmiVeru6rwFxITAiX+Md64znn4UyDCw\nBY/27/+uNJw+C2MEosVLELwN07cS8U5OxAYQeThw2KeGyxFbX4V/HE7pjVh7/RMB\n+4rYril7OLpxh+JbWp1Kj/kpLnm9Uba0zAmx9m0CgYBS9zSNXoB/GY+mWZIJqskT\nUsoZ1tpi0dLdIK+sOcghyN1Bu1Q3hVM14FCFmlWhmNLRD1s2tBa5YG7/RAgQC9xi\n19OHJjHSjwjYpLrRn65NDqZkwCozmD5UBUCs3RWsADBh+E9vRQg6ufltTm5DyQRi\nW5FEEi1dnxMc9gCh45UoPw==\n-----END PRIVATE KEY-----\n"

# DATABASE CONFIGURATION
NEXT_DATABASE_URL=postgresql://neondb_owner:npg_Rs3pU1GTXWxK@ep-young-heart-aojtnjx5-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXT_DIRECT_URL=postgresql://neondb_owner:npg_Rs3pU1GTXWxK@ep-young-heart-aojtnjx5.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# AUTH UID ADMIN FIREBASE
NEXT_ADMIN_USER_IDS=PyDKZDKnQPcOc1q0C2FrGIO7sP32
