import { getApps, initializeApp, cert } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

let adminAuth: ReturnType<typeof getAuth>;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_FIREBASE_PRIVATE_KEY;

const hasAdminCredentials = projectId && clientEmail && privateKey;

if (hasAdminCredentials) {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          // Replace escaped newlines
          privateKey: privateKey?.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Firebase admin initialization error:", error);
    }
  }
  adminAuth = getAuth();
} else {
  console.warn(
    "⚠️ Kredensial Firebase Admin SDK belum lengkap. Menggunakan mock auth client untuk mencegah kegagalan build."
  );
  // Return a mock auth object that mimics verifyIdToken for safety during build compilation
  adminAuth = {
    verifyIdToken: async () => {
      throw new Error(
        "Firebase Admin SDK tidak terkonfigurasi. Harap lengkapi environment variables di file .env"
      );
    },
  } as any;
}

export { adminAuth };
