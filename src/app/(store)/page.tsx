import { getProducts } from "@/db/queries";
import { BannerCarousel } from "@/components/store/BannerCarousel";
import { TrendingCarousel } from "@/components/store/TrendingCarousel";
import { Zap, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const trending = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 10);

  return (
    <div className="space-y-7">
      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Feature strip */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, title: "Instan", desc: "QRIS otomatis" },
          { icon: ShieldCheck, title: "Aman", desc: "Verifikasi captcha" },
          { icon: Sparkles, title: "Support 24/7", desc: "AI + Owner" },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border p-3 text-center"
          >
            <f.icon className="h-5 w-5 mx-auto text-primary" />
            <p className="text-sm font-semibold mt-1">{f.title}</p>
            <p className="text-[11px] text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Trending products carousel */}
      <TrendingCarousel products={trending} title="Produk Trending" />
    </div>
  );
}
