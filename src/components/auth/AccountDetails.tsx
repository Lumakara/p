"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Mail, Calendar, Key, ShieldCheck, Edit3 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AccountDetails() {
  const { user, logout, updateProfileInfo, loading } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  if (!user) return null;

  // Extract provider details
  const providerId = user.providerData[0]?.providerId || "password";
  const getProviderLabel = (id: string) => {
    switch (id) {
      case "google.com":
        return { label: "Google Authentication", color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40" };
      case "github.com":
        return { label: "GitHub Authentication", color: "bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-800" };
      case "password":
        return { label: "Email & Password", color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40" };
      default:
        return { label: "Firebase Auth", color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40" };
    }
  };

  const providerStyle = getProviderLabel(providerId);

  // Format account creation date
  const creationDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      await updateProfileInfo({ displayName });
      setIsEditing(false);
    } catch (error) {
      // Handled by hook toasts
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      // Handled by hook toasts
    }
  };

  // Get initials for Avatar Fallback
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return user.email ? user.email.slice(0, 2).toUpperCase() : "US";
  };

  return (
    <div className="w-full space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-900 shadow-xl">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User avatar"} />
            <AvatarFallback className="text-xl font-bold bg-primary text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {user.displayName || "Pengguna Baru"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      {/* Profile Info Details */}
      <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Display Name Edit Form */}
        <div className="border-b border-slate-100 dark:border-slate-900 pb-4">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <Label htmlFor="editName" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Ubah Nama Lengkap
              </Label>
              <div className="flex gap-2">
                <Input
                  id="editName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="Nama Lengkap"
                  disabled={loading}
                  required
                />
                <Button type="submit" disabled={loading} className="rounded-xl h-10 px-4">
                  {loading ? <Spinner className="h-4 w-4" /> : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDisplayName(user.displayName || "");
                    setIsEditing(false);
                  }}
                  className="rounded-xl h-10 px-3"
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Nama Lengkap
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {user.displayName || "Belum diatur"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-primary rounded-lg"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Email details */}
        <div className="border-b border-slate-100 dark:border-slate-900 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Email
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        {/* Auth Provider details */}
        <div className="border-b border-slate-100 dark:border-slate-900 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500">
            <Key className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Metode Login
            </p>
            <div className="mt-1">
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${providerStyle.color}`}>
                {providerStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Date */}
        <div className="pb-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Terdaftar Sejak
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {creationDate}
            </p>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <Button
        onClick={handleLogout}
        variant="destructive"
        disabled={loading}
        className="w-full h-11 rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
      >
        {loading ? (
          <Spinner className="h-4 w-4 text-white" />
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            Keluar dari Akun
          </>
        )}
      </Button>
    </div>
  );
}
