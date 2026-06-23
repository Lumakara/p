import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { env } from "./env";

// Initialize Firebase
const app = !getApps().length ? initializeApp(env.firebaseClient) : getApp();

const auth = getAuth(app);

if (typeof window !== "undefined" && env.firebaseClient.isConfigured) {
  try {
    auth.useDeviceLanguage();
  } catch (err) {
    console.error("Failed to set Firebase device language:", err);
  }
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, googleProvider, githubProvider };
