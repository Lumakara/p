"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email wajib diisi.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Error handled by hook toasts
    }
  };

  return (
    <div className="w-full space-y-6">
      {success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Periksa Email Anda
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Kami telah mengirimkan instruksi beserta tautan reset password ke email{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
            </p>
          </div>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="mt-2 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800"
          >
            Kirim Ulang Email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Alamat Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 ${
                  error ? "border-destructive focus-visible:ring-destructive/20" : ""
                }`}
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs font-medium text-destructive mt-1">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold shadow-md shadow-primary/10 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 text-white" />
                Mengirimkan Tautan...
              </>
            ) : (
              "Kirim Link Reset Password"
            )}
          </Button>
        </form>
      )}

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke halaman login
        </Link>
      </div>
    </div>
  );
}
