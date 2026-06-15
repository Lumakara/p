import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Daftar — Digital Store" };

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Digital Store
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Buat akun baru — Google, GitHub, atau email
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6 shadow-xl">
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
