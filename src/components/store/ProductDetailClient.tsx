"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star, Check, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/store/appStore";
import { rupiah, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { Product, Review } from "@/types";

export function ProductDetailClient({
  product,
  initialReviews,
}: {
  product: Product;
  initialReviews: Review[];
}) {
  const router = useRouter();
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const addToCart = useAppStore((s) => s.addToCart);
  const tiers = product.tiers || [];
  const [tierName, setTierName] = useState(tiers[0]?.name);
  const [buying, setBuying] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTier = tiers.find((t) => t.name === tierName) || tiers[0];
  const price = selectedTier?.price ?? product.discountPrice ?? product.basePrice;

  async function handleBuy() {
    if (!isSignedIn) {
      toast.error("Silakan masuk untuk membeli");
      return;
    }
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

  async function submitReview() {
    if (!isSignedIn) {
      toast.error("Masuk untuk menulis ulasan");
      return;
    }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim ulasan");
      setReviews((prev) => [data.review, ...prev]);
      setComment("");
      toast.success("Ulasan terkirim, terima kasih!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim ulasan");
    } finally {
      setSubmitting(false);
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
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{product.reviewsCount} ulasan</span>
            <span>·</span>
            <span className="capitalize">{product.category}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {product.fullDescription || product.description}
          </p>

          {/* Tier selection */}
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
                          <li
                            key={f}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                          >
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

          <div className="flex gap-2 pt-2">
            {isSignedIn ? (
              <Button className="flex-1" onClick={handleBuy} disabled={buying}>
                {buying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Beli Sekarang · {rupiah(price)}
              </Button>
            ) : (
              <Link href="/sign-in" className="flex-1">
                <Button className="w-full">Masuk untuk Beli</Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                addToCart(product, tierName);
                toast.success("Ditambahkan ke keranjang");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
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

      {/* Reviews */}
      <section className="space-y-3">
        <h3 className="font-semibold">Ulasan ({reviews.length})</h3>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star
                  className={cn(
                    "h-5 w-5",
                    n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalamanmu..."
            rows={3}
          />
          <Button size="sm" onClick={submitReview} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Kirim Ulasan
          </Button>
        </Card>

        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    r.userAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}`
                  }
                  alt={r.userName}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{r.userName}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              <p className="text-sm mt-2">{r.comment}</p>
            </Card>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada ulasan. Jadilah yang pertama!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
