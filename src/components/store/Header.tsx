"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, ShoppingCart, Search, Globe, Music, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { useT } from "@/lib/i18n";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const t = useT();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const toggleMusic = useAppStore((s) => s.toggleMusic);
  const cartCount = useAppStore((s) => s.cart.reduce((a, i) => a + i.quantity, 0));
  const [q, setQ] = useState("");

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-5xl h-full px-4 flex items-center gap-3">
        <Link href="/" className="font-bold text-lg gradient-text whitespace-nowrap">
          Digital Store
        </Link>

        <form
          className="flex-1 hidden sm:flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/products?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="w-full h-9 pl-9 pr-3 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle music"
            onClick={toggleMusic}
          >
            {musicEnabled ? <Music className="h-4 w-4" /> : <Music2 className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle language"
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
          >
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
          <Link href="/cart" aria-label="Cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
