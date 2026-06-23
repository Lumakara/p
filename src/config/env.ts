/**
 * Centralized environment variable configuration with validation.
 *
 * This file:
 * - Reads all environment variables in one place
 * - Validates required variables at startup
 * - Provides typed access to configuration
 * - Shows clear error messages when configuration is missing
 *
 * Usage: Import `env` from this file instead of reading process.env directly.
 */

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

interface ValidationError {
  key: string;
  message: string;
}

const errors: ValidationError[] = [];

function required(key: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    errors.push({ key, message: "Required but not set" });
    return "";
  }
  return value;
}

function optional(value: string | undefined, fallback = ""): string {
  return value || fallback;
}

function optionalNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function multipleOptional(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value;
  }
  return "";
}

function multipleRequired(errorKey: string, ...keys: string[]): string {
  const value = multipleOptional(...keys);
  if (!value) {
    errors.push({
      key: errorKey,
      message: `Required but not set. Tried: ${keys.join(", ")}`
    });
    return "";
  }
  return value;
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Centralized environment configuration.
 * All services should import this instead of reading process.env directly.
 */
export const env = {
  // ============================================================================
  // APP
  // ============================================================================
  app: {
    url: optional(
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000"
    ),
    nodeEnv: optional(process.env.NODE_ENV, "development"),
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
  },

  // ============================================================================
  // DATABASE
  // ============================================================================
  database: {
    url: required("NEXT_DATABASE_URL", process.env.NEXT_DATABASE_URL),
    directUrl: required("NEXT_DIRECT_URL", process.env.NEXT_DIRECT_URL),
  },

  // ============================================================================
  // FIREBASE CLIENT (PUBLIC)
  // ============================================================================
  firebaseClient: {
    apiKey: optional(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      "mock_api_key_for_nextjs_build"
    ),
    authDomain: optional(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      "mock-project.firebaseapp.com"
    ),
    projectId: optional(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      "mock-project"
    ),
    storageBucket: optional(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      "mock-project.appspot.com"
    ),
    messagingSenderId: optional(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      "000000000000"
    ),
    appId: optional(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      "1:000000000000:web:0000000000000000000000"
    ),
    isConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  },

  // ============================================================================
  // FIREBASE ADMIN (PRIVATE)
  // ============================================================================
  firebaseAdmin: {
    projectId: optional(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    clientEmail: optional(process.env.NEXT_FIREBASE_CLIENT_EMAIL),
    privateKey: optional(process.env.NEXT_FIREBASE_PRIVATE_KEY),
    isConfigured:
      Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      Boolean(process.env.NEXT_FIREBASE_CLIENT_EMAIL) &&
      Boolean(process.env.NEXT_FIREBASE_PRIVATE_KEY),
  },

  // ============================================================================
  // CLOUDINARY
  // ============================================================================
  cloudinary: {
    cloudName: multipleOptional(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      "NEXT_CLOUDINARY_CLOUD_NAME"
    ),
    apiKey: multipleOptional(
      "CLOUDINARY_API_KEY",
      "NEXT_CLOUDINARY_API_KEY"
    ),
    apiSecret: multipleOptional(
      "CLOUDINARY_API_SECRET",
      "NEXT_CLOUDINARY_API_SECRET"
    ),
    uploadPreset: multipleOptional(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
      "NEXT_CLOUDINARY_UPLOAD_PRESET"
    ),
    isConfigured: Boolean(
      multipleOptional(
        "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
        "NEXT_CLOUDINARY_CLOUD_NAME"
      )
    ),
  },

  // ============================================================================
  // TURNSTILE (CLOUDFLARE CAPTCHA)
  // ============================================================================
  turnstile: {
    siteKey: multipleOptional(
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY",
      "NEXT_TURNSTILE_SITE_KEY"
    ),
    secret: multipleOptional(
      "CF_TURNSTILE_SECRET",
      "NEXT_TURNSTILE_SECRET"
    ),
    isConfigured: Boolean(
      multipleOptional("CF_TURNSTILE_SECRET", "NEXT_TURNSTILE_SECRET")
    ),
  },

  // ============================================================================
  // TELEGRAM
  // ============================================================================
  telegram: {
    botToken: multipleOptional(
      "TELEGRAM_BOT_TOKEN",
      "NEXT_TELEGRAM_BOT_TOKEN"
    ),
    chatId: multipleOptional(
      "TELEGRAM_CHAT_ID",
      "NEXT_TELEGRAM_CHAT_ID"
    ),
    botUsername: optional(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME),
    webhookSecret: optional(process.env.TELEGRAM_WEBHOOK_SECRET),
    isConfigured: Boolean(
      multipleOptional("TELEGRAM_BOT_TOKEN", "NEXT_TELEGRAM_BOT_TOKEN") &&
        multipleOptional("TELEGRAM_CHAT_ID", "NEXT_TELEGRAM_CHAT_ID")
    ),
  },

  // ============================================================================
  // PAYMENT GATEWAY
  // ============================================================================
  payment: {
    baseUrl: multipleOptional(
      "PAYMENT_BASE_URL",
      "NEXT_PAYMENT_BASE_URL"
    ) || "https://ramashop.my.id/api/public",
    apiKey: multipleRequired(
      "PAYMENT_API_KEY",
      "PAYMENT_API_KEY",
      "NEXT_PAYMENT_API_KEY"
    ),
    expiryMinutes: optionalNumber(
      process.env.PAYMENT_EXPIRY_MINUTES || process.env.NEXT_PAYMENT_EXPIRY_MINUTES,
      30
    ),
    isConfigured: Boolean(
      multipleOptional("PAYMENT_API_KEY", "NEXT_PAYMENT_API_KEY")
    ),
  },

  // ============================================================================
  // AI CHATBOT
  // ============================================================================
  chatbot: {
    apiKey: multipleRequired(
      "CHATBOT_API_KEY",
      "CHATBOT_API_KEY",
      "NEXT_CHATBOT_API_KEY"
    ),
    baseUrl: multipleOptional(
      "CHATBOT_BASE_URL",
      "NEXT_CHATBOT_BASE_URL"
    ),
    v1Endpoint: multipleOptional(
      "CHATBOT_V1_ENDPOINT",
      "NEXT_CHATBOT_V1_ENDPOINT"
    ),
    v2Endpoint: multipleOptional(
      "CHATBOT_V2_ENDPOINT",
      "NEXT_CHATBOT_V2_ENDPOINT"
    ),
    isConfigured: Boolean(
      multipleOptional("CHATBOT_API_KEY", "NEXT_CHATBOT_API_KEY")
    ),
  },

  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: {
    userIds: optional(process.env.ADMIN_USER_IDS || process.env.NEXT_ADMIN_USER_IDS)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  },
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate environment variables and throw if required variables are missing.
 * Call this at application startup (in middleware or root layout).
 */
export function validateEnv(): void {
  if (errors.length === 0) return;

  const errorMessage = [
    "❌ Missing required environment variables:",
    "",
    ...errors.map((err) => `  - ${err.key}: ${err.message}`),
    "",
    "Please check your .env file and ensure all required variables are set.",
    "See .env.example for reference.",
  ].join("\n");

  console.error(errorMessage);

  // Only throw in production to prevent build failures in development
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variables");
  }
}

/**
 * Get a summary of configured services (for health checks).
 */
export function getConfigSummary() {
  return {
    database: Boolean(env.database.url && env.database.directUrl),
    firebaseClient: env.firebaseClient.isConfigured,
    firebaseAdmin: env.firebaseAdmin.isConfigured,
    cloudinary: env.cloudinary.isConfigured,
    turnstile: env.turnstile.isConfigured,
    telegram: env.telegram.isConfigured,
    payment: env.payment.isConfigured,
    chatbot: env.chatbot.isConfigured,
  };
}

// Run validation when this module is imported (server-side only)
if (typeof window === "undefined") {
  validateEnv();
}
