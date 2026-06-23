"use client";

import { useState } from "react";
import { useAuthContext, getFirebaseErrorMessage } from "@/context/AuthContext";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/config/firebase";
import { toast } from "sonner";

export function useAuth() {
  const { user, loading, syncUser } = useAuthContext();
  const [authLoading, setAuthLoading] = useState(false);

  // Email and Password Register
  const registerWithEmail = async (email: string, name: string, password: string) => {
    setAuthLoading(true);
    try {
      // 1. Create firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // 2. Set profile info
      await updateProfile(createdUser, {
        displayName: name,
      });

      // Force profile refresh in current user reference
      await createdUser.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser) {
        // 3. Sync profile with DB
        await syncUser(updatedUser);
      }

      toast.success("Registrasi berhasil! Selamat datang.");
      return createdUser;
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Email and Password Login
  const loginWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login berhasil!");
      return userCredential.user;
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, googleProvider);
      await syncUser(userCredential.user);
      toast.success("Login dengan Google berhasil!");
      return userCredential.user;
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // GitHub OAuth Login
  const loginWithGitHub = async () => {
    setAuthLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      await syncUser(userCredential.user);
      toast.success("Login dengan GitHub berhasil!");
      return userCredential.user;
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password / Password Reset Link
  const forgotPassword = async (email: string) => {
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
      toast.success("Link reset password telah dikirim ke email Anda!");
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out
  const logout = async () => {
    setAuthLoading(true);
    try {
      await firebaseSignOut(auth);
      toast.success("Anda berhasil logout.");
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Update Profile Info (e.g. displayName, photoURL)
  const updateProfileInfo = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    setAuthLoading(true);
    try {
      await updateProfile(auth.currentUser, data);
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser) {
        await syncUser(updatedUser);
      }
      toast.success("Profil berhasil diperbarui!");
      return updatedUser;
    } catch (err: any) {
      const errMsg = getFirebaseErrorMessage(err?.code || "");
      toast.error(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    loading: loading || authLoading,
    authLoading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithGitHub,
    forgotPassword,
    logout,
    updateProfileInfo,
  };
}
