"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Banner {
  id: string;
  image?: string;
  bg?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  interval?: number;
}

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "b1",
    bg: "from-orange-500 via-red-500 to-rose-600",
    title: "Belanja Digital, Bayar QRIS Instan",
    description: "Pembayaran aman lewat QRIS, dukungan AI chatbot 24/7, dan layanan owner langsung.",
    ctaText: "Lihat Produk",
    ctaHref: "/products",
    interval: 5000,
  },
  {
    id: "b2",
    bg: "from-blue-600 via-violet-600 to-purple-700",
    title: "Support 24/7 AI & Owner",
    description: "AI chatbot siap membantu kapanpun. Owner langsung bisa kamu hubungi via Telegram.",
    ctaText: "Chat Sekarang",
    ctaHref: "/profile",
    interval: 6000,
  },
  {
    id: "b3",
    bg: "from-emerald-500 via-teal-500 to-cyan-600",
    title: "Produk Digital Terlengkap",
    description: "Ribuan pilihan produk digital dengan harga terbaik dan pengiriman instan.",
    ctaText: "Jelajahi",
    ctaHref: "/products",
    interval: 4500,
  },
];

interface Props {
  banners?: Banner[];
}

export function BannerCarousel({ banners = DEFAULT_BANNERS }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (idx: number) => {
      setFading(true);
      setTimeout(() => {
        setCurrent(idx);
        setFading(false);
      }, 300);
    },
    [],
  );

  const prev = () => go((current - 1 + banners.length) % banners.length);
  const next = useCallback(() => go((current + 1) % banners.length), [current, banners.length, go]);

  useEffect(() => {
    const ms = banners[current]?.interval ?? 5000;
    const t = setTimeout(next, ms);
    return () => clearTimeout(t);
  }, [current, banners, next]);

  const banner = banners[current];

  return (
    <section className="relative rounded-3xl overflow-hidden select-none">
      {/* Slide */}
      <div
        className={cn(
          "relative transition-opacity duration-300",
          fading ? "opacity-0" : "opacity-100",
        )}
      >
        {banner.image ? (
          <div className="relative aspect-[21/9] sm:aspect-[3/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className={cn("bg-gradient-to-br aspect-[21/9] sm:aspect-[3/1]", banner.bg)} />
        )}

        {/* Caption */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
          <div className="max-w-lg">
            <h2 className="text-white text-xl sm:text-3xl font-bold leading-tight drop-shadow">
              {banner.title}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm mt-1.5 drop-shadow line-clamp-2">
              {banner.description}
            </p>
            {banner.ctaText && banner.ctaHref && (
              <Link href={banner.ctaHref}>
                <Button
                  size="sm"
                  className="mt-3 bg-white text-gray-900 hover:bg-white/90 font-semibold"
                >
                  {banner.ctaText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Prev/Next controls */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-5 bg-white" : "w-1.5 bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}
