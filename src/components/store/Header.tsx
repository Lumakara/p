"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { HamburgerMenu } from "@/components/store/HamburgerMenu";
import { cn } from "@/lib/utils";
import { rupiah } from "@/lib/format";
import type { Product } from "@/types";

export function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced auto-search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults((data.products ?? []).slice(0, 6));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = () => {
    setQ("");
    setResults([]);
    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur-lg">
      <div className="mx-auto max-w-5xl h-full px-3 flex items-center gap-3">
        {/* Hamburger */}
        <HamburgerMenu />

        {/* Logo */}
        <Link href="/" className="font-bold text-base gradient-text whitespace-nowrap hidden sm:block">
          Digital Store
        </Link>

        {/* Search */}
        <div ref={wrapperRef} className="relative flex-1">
          <form onSubmit={submit} className="flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                placeholder="Cari produk..."
                className="w-full h-9 pl-9 pr-8 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-primary transition"
              />
              {q && (
                <button
                  type="button"
                  onClick={clear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Dropdown results */}
          {open && results.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
              {results.map((p) => {
                const price = p.tiers?.[0]?.price ?? p.discountPrice ?? p.basePrice;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={clear}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.icon} alt={p.title} className="h-9 w-9 rounded-lg object-contain bg-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold text-primary flex-shrink-0">{rupiah(price)}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(`/products?q=${encodeURIComponent(q.trim())}`);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-primary hover:bg-muted transition-colors border-t border-border",
                )}
              >
                <Search className="h-3.5 w-3.5" />
                Lihat semua hasil untuk &ldquo;{q}&rdquo;
              </button>
            </div>
          )}
        </div>

        {/* Mobile logo */}
        <Link href="/" className="font-bold text-sm gradient-text whitespace-nowrap sm:hidden">
          DS
        </Link>
      </div>
    </header>
  );
}
