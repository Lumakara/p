"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Trash2, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAppStore } from "@/store/appStore";
import { rupiah } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const cart = useAppStore((s) => s.cart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const toggleItemSelection = useAppStore((s) => s.toggleItemSelection);
  const getCartTotal = useAppStore((s) => s.getCartTotal);
  const getSelectedItems = useAppStore((s) => s.getSelectedItems);
  const [loading, setLoading] = useState(false);

  const { subtotal, count } = getCartTotal();

  async function checkout() {
    const items = getSelectedItems();
    if (items.length === 0) {
      toast.error("Pilih item terlebih dahulu");
      return;
    }
    if (items.length > 1) {
      toast.info(
        "Saat ini pembayaran QRIS memproses 1 produk per transaksi. Memproses item pertama.",
      );
    }
    const first = items[0];
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: first.productId, tier: first.tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pembayaran");
      router.push(`/checkout/${data.orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat pembayaran");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="font-medium">Keranjang kosong</p>
        <Link href="/products">
          <Button className="mt-4">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Keranjang</h1>
      <div className="space-y-2">
        {cart.map((item, i) => (
          <Card key={item.id} className="p-3 flex items-center gap-3">
            <Checkbox
              checked={item.selected}
              onCheckedChange={() => toggleItemSelection(i)}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} className="h-12 w-12 object-contain rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.tier}</p>
              <p className="text-sm font-bold text-primary">{rupiah(item.price)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, -1)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeFromCart(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-4 sticky bottom-20 sm:bottom-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{count} item dipilih</span>
          <span className="text-lg font-bold">{rupiah(subtotal)}</span>
        </div>
        {isSignedIn ? (
          <Button className="w-full" onClick={checkout} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Bayar Sekarang
          </Button>
        ) : (
          <SignInButton mode="modal">
            <Button className="w-full">Masuk untuk Bayar</Button>
          </SignInButton>
        )}
      </Card>
    </div>
  );
}
