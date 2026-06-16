"use client";

import { PublicRoute } from "@/components/auth/PublicRoute";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function LoginPage() {
  return (
    <PublicRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-radial from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                DigitalStore
              </span>
            </Link>
            <h1 className="text-xl font-bold text-slate-850 dark:text-slate-150 tracking-tight pt-3">
              Selamat datang kembali!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Silakan masuk untuk melanjutkan transaksi Anda
            </p>
          </div>

          {/* Form Container Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-850/50 shadow-2xl rounded-3xl p-6 sm:p-8">
            <LoginForm />
          </div>

          {/* Footer Copyright */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} DigitalStore. Semua hak dilindungi.
          </p>
        </div>
      </main>
    </PublicRoute>
  );
}
