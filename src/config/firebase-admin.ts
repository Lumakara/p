import { getApps, initializeApp, cert } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env";

let adminAuth: ReturnType<typeof getAuth>;

if (env.firebaseAdmin.isConfigured) {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: env.firebaseAdmin.projectId,
          clientEmail: env.firebaseAdmin.clientEmail,
          privateKey: (env.firebaseAdmin.privateKey || "").replace(/\\n/g, "\n"),
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
