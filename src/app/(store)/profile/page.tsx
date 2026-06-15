"use client";

import { useUser, SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun, Music, Globe, Palette, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import type { ThemeColor } from "@/types";

const COLORS: { id: ThemeColor; label: string; className: string }[] = [
  { id: "default", label: "Orange", className: "bg-orange-500" },
  { id: "ocean", label: "Ocean", className: "bg-sky-500" },
  { id: "sunset", label: "Sunset", className: "bg-pink-500" },
  { id: "forest", label: "Forest", className: "bg-emerald-500" },
];

export default function ProfilePage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const themeColor = useAppStore((s) => s.themeColor);
  const setThemeColor = useAppStore((s) => s.setThemeColor);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const toggleMusic = useAppStore((s) => s.toggleMusic);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Profil & Pengaturan</h1>

      <SignedIn>
        <Card className="p-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user?.imageUrl} alt="avatar" className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-semibold">{user?.fullName || user?.username}</p>
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </Card>
      </SignedIn>
      <SignedOut>
        <Card className="p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Masuk untuk melihat riwayat & profil.</p>
          <SignInButton mode="modal">
            <Button className="w-full">Masuk / Daftar</Button>
          </SignInButton>
        </Card>
      </SignedOut>

      {/* Appearance */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Dark Mode
          </span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
          />
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" /> Skema Warna
          </span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setThemeColor(c.id)}
                className={cn(
                  "h-9 w-9 rounded-full",
                  c.className,
                  themeColor === c.id && "ring-2 ring-offset-2 ring-foreground",
                )}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" /> Bahasa
          </span>
          <div className="flex gap-1">
            {(["id", "en"] as const).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={language === l ? "default" : "outline"}
                onClick={() => setLanguage(l)}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Music className="h-4 w-4" /> Musik Latar
          </span>
          <Switch checked={musicEnabled} onCheckedChange={toggleMusic} />
        </div>
      </Card>

      <SignedIn>
        <div className="space-y-2">
          <Link href="/orders">
            <Button variant="outline" className="w-full justify-start">
              Riwayat Transaksi
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="h-4 w-4 mr-2" /> Dashboard Admin
            </Button>
          </Link>
          <SignOutButton>
            <Button variant="ghost" className="w-full justify-start text-red-500">
              <LogOut className="h-4 w-4 mr-2" /> Keluar
            </Button>
          </SignOutButton>
        </div>
      </SignedIn>
    </div>
  );
}
