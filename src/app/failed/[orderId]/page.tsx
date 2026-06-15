import Link from "next/link";
import { XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FailedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  let order = null;
  try {
    order = await prisma.order.findUnique({ where: { id: orderId } });
  } catch {
    order = null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md p-6 text-center space-y-3">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold">Pembayaran Gagal / Expired</h1>
        <p className="text-xs text-muted-foreground font-mono">{orderId}</p>
        <p className="text-sm text-muted-foreground">
          Waktu pembayaran habis atau transaksi dibatalkan. Kamu bisa mencoba
          lagi dengan membuat pesanan baru.
        </p>

        <div className="flex gap-2 pt-2">
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Ke Produk
            </Button>
          </Link>
          {order?.productId && (
            <Link href={`/products/${order.productId}`} className="flex-1">
              <Button className="w-full">Coba Lagi</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
