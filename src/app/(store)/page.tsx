import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const popular = products.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 sm:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 rounded-full px-3 py-1 mb-3">
            <Sparkles className="h-3 w-3" /> Produk & layanan digital terpercaya
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
            Belanja Digital, Bayar QRIS Instan
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base">
            Pembayaran aman lewat QRIS, dukungan AI chatbot 24/7, dan layanan
            owner langsung.
          </p>
          <Link href="/products">
            <Button className="mt-4 bg-white text-orange-600 hover:bg-white/90">
              Lihat Produk <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute right-20 top-0 h-24 w-24 rounded-full bg-white/10" />
      </section>

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

      {/* Popular products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Produk Populer</h2>
          <Link href="/products" className="text-sm text-primary font-medium">
            Lihat semua
          </Link>
        </div>
        {popular.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <p>Belum ada produk.</p>
            <p className="text-xs mt-1">
              Jalankan <code>npm run db:seed</code> atau tambah produk lewat
              dashboard admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
