"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { SocialAuth } from "./SocialAuth";

export function RegisterForm() {
  const { registerWithEmail, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const router = useRouter();

  const validate = () => {
    const newErrors: typeof errors = {};

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = "Nama Lengkap wajib diisi.";
    }

    // Email
    if (!email) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    // Password
    if (!password) {
      newErrors.password = "Password wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal terdiri dari 8 karakter.";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerWithEmail(email, fullName, password);
      router.push("/account");
    } catch (err) {
      // Error handled by hook toasts
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Nama Lengkap
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <Input
              id="fullName"
              type="text"
              placeholder="Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 ${
                errors.fullName ? "border-destructive focus-visible:ring-destructive/20" : ""
              }`}
              disabled={loading}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.fullName}</p>
          )}
        </div>

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
                errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""
              }`}
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 ${
                errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 ${
                errors.confirmPassword ? "border-destructive focus-visible:ring-destructive/20" : ""
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold shadow-md shadow-primary/10 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 text-white" />
              Mendaftarkan Akun...
            </>
          ) : (
            "Daftar Sekarang"
          )}
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
        <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">
          Atau daftar dengan
        </span>
        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
      </div>

      <SocialAuth />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
