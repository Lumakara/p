"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

interface OrderState {
  orderId: string;
  productName?: string;
  amount: number;
  totalAmount?: number | null;
  uniqueCode?: number | null;
  qrImage?: string | null;
  qrString?: string | null;
  expiredAt?: string | null;
  status: string;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load + polling for status.
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`/api/payment/status/${orderId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Order tidak ditemukan");
          return;
        }
        setOrder((prev) => ({ ...(prev as OrderState), ...data }));
        if (data.status === "PAID") {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success("Pembayaran berhasil!");
          router.replace(`/success/${orderId}`);
        } else if (data.status === "EXPIRED" || data.status === "FAILED") {
          if (pollRef.current) clearInterval(pollRef.current);
          router.replace(`/failed/${orderId}`);
        }
      } catch {
        /* ignore */
      }
    }

    // Fetch the order detail (qr etc.) from the user's orders list.
    async function loadOrder() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          const found = (data.orders || []).find(
            (o: OrderState) => o.orderId === orderId || (o as { id?: string }).id === orderId,
          );
          if (found && !cancelled) {
            setOrder({
              orderId,
              productName: found.productName,
              amount: found.amount,
              totalAmount: found.totalAmount,
              uniqueCode: found.uniqueCode,
              qrImage: found.qrImage,
              qrString: found.qrString,
              expiredAt: found.expiredAt,
              status: found.status,
            });
          }
        }
      } catch {
        /* ignore */
      }
      check();
    }

    loadOrder();
    pollRef.current = setInterval(check, 5000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, router]);

  // Countdown timer.
  useEffect(() => {
    if (!order?.expiredAt) return;
    const target = new Date(order.expiredAt).getTime();
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order?.expiredAt]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Kembali ke Produk
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-bold">Pembayaran QRIS</h1>
          <p className="text-xs text-muted-foreground font-mono">{orderId}</p>
        </div>

        {!order ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {order.qrImage ? (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.qrImage}
                  alt="QRIS"
                  className="h-56 w-56 rounded-xl border border-border bg-white p-2"
                />
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                QR tidak tersedia
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Pembayaran</p>
              <p className="text-2xl font-bold text-primary">
                {rupiah(order.totalAmount ?? order.amount)}
              </p>
              {order.uniqueCode ? (
                <p className="text-[11px] text-muted-foreground">
                  Termasuk kode unik {order.uniqueCode}. Bayar tepat nominal ini.
                </p>
              ) : null}
            </div>

            {order.expiredAt && (
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className={remaining < 60 ? "text-red-500" : ""}>
                  {mm}:{ss}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-2 text-xs text-yellow-700 dark:text-yellow-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Menunggu pembayaran... (otomatis terdeteksi)
            </div>

            <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Pembayaran aman via RamaShop
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
