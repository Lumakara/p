import { getApps, initializeApp, cert } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

let adminAuth: ReturnType<typeof getAuth>;

const hasAdminCredentials =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_FIREBASE_CLIENT_EMAIL &&
  process.env.NEXT_FIREBASE_PRIVATE_KEY;

if (hasAdminCredentials) {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.NEXT_FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
