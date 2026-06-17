"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  IdTokenResult,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/config/firebase";

// Firebase error helper in Indonesian
export function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar oleh pengguna lain.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/operation-not-allowed":
      return "Metode autentikasi ini dinonaktifkan.";
    case "auth/weak-password":
      return "Password terlalu lemah. Minimal gunakan 6 karakter.";
    case "auth/user-disabled":
      return "Akun ini telah dinonaktifkan oleh admin.";
    case "auth/user-not-found":
      return "Pengguna dengan email ini tidak ditemukan.";
    case "auth/wrong-password":
      return "Password yang Anda masukkan salah.";
    case "auth/invalid-credential":
      return "Email atau password yang dimasukkan salah.";
    case "auth/popup-closed-by-user":
      return "Proses masuk dibatalkan karena popup ditutup.";
    case "auth/account-exists-with-different-credential":
      return "Akun dengan email ini sudah terdaftar menggunakan metode masuk berbeda.";
    case "auth/requires-recent-login":
      return "Demi keamanan, harap login kembali sebelum melakukan tindakan ini.";
    default:
      return "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.";
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncUser: (user: User) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  syncUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user state with postgres DB
  const syncUser = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken(true); // force refresh token to get updated profile claims if any
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error("Sync user error response:", errData);
      } else {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.error("Failed to sync user with DB:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Set cookie for middleware/server components
        const token = await firebaseUser.getIdToken();
        document.cookie = `firebase_token=${token}; path=/; max-age=3600; SameSite=Strict`;
        
        // Background sync
        await syncUser(firebaseUser);
      } else {
        // Remove cookie
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
