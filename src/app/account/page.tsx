"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccountDetails } from "@/components/auth/AccountDetails";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-radial from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header Action (Back to Store) */}
          <div className="flex justify-between items-center px-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Toko
            </Link>
            
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-xs transition-all duration-300">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                DigitalStore
              </span>
            </Link>
          </div>

          {/* Account Details Container Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-850/50 shadow-2xl rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 dark:border-slate-900">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profil Saya</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola informasi akun dan pengaturan keamanan Anda
              </p>
            </div>
            <div className="pt-6">
              <AccountDetails />
            </div>
          </div>

          {/* Footer Copyright */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} DigitalStore. Semua hak dilindungi.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
