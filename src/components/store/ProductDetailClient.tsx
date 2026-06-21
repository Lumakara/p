"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAppStore } from "@/store/appStore";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import type { Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const ensureChatUserId = useAppStore((s) => s.ensureChatUserId);
  const addToCart = useAppStore((s) => s.addToCart);
  const addToRecentlyViewed = useAppStore((s) => s.addToRecentlyViewed);
  const tiers = product.tiers || [];
  const [tierName, setTierName] = useState(tiers[0]?.name);
  const [buying, setBuying] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);

  useEffect(() => {
    addToRecentlyViewed(product.id);
  }, [product.id, addToRecentlyViewed]);

  const selectedTier = tiers.find((t) => t.name === tierName) || tiers[0];
  const price = selectedTier?.price ?? product.discountPrice ?? product.basePrice;

  async function handleBuy() {
    void ensureChatUserId();
    setBuying(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          tier: tierName,
          turnstileToken: captcha,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pembayaran");
      router.push(`/checkout/${data.orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat pembayaran");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="aspect-square flex items-center justify-center bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.icon} alt={product.title} className="h-40 w-40 object-contain" />
        </Card>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{product.category}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {product.fullDescription || product.description}
          </p>

          {tiers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pilih Paket</p>
              <div className="grid grid-cols-1 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTierName(t.name)}
                    className={cn(
                      "text-left rounded-xl border p-3 transition",
                      tierName === t.name
                        ? "border-primary ring-1 ring-primary"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{t.name}</span>
                      <span className="font-bold text-primary">{rupiah(t.price)}</span>
                    </div>
                    {t.features?.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {t.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-green-500" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <TurnstileWidget onVerify={setCaptcha} />

          {product.stock != null && (
            <div className="text-sm font-medium pt-2">
              Stok Tersedia:{" "}
              <span className={(product.stock ?? 0) <= 5 ? "text-red-500 font-bold" : ""}>
                {product.stock}
              </span>
              {product.stock === 0 && <span className="ml-2 text-red-500">(Habis)</span>}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {product.stock === 0 ? (
              <Button className="flex-1" disabled variant="secondary">
                Stok Habis
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleBuy}
                disabled={buying || product.stock === 0}
              >
                {buying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Beli Sekarang · {rupiah(price)}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={product.stock === 0}
              onClick={() => {
                if (product.stock === 0) return;
                addToCart(product, tierName);
                toast.success("Ditambahkan ke keranjang");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {product.features?.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Fitur</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {product.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" /> {f}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
