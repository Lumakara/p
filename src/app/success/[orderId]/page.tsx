import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/db/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rupiah, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
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
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold">Pembayaran Berhasil</h1>
        <p className="text-xs text-muted-foreground font-mono">{orderId}</p>

        {order && (
          <div className="rounded-xl bg-muted p-4 text-left text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-medium">{order.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{rupiah(order.amount)}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibayar</span>
                <span className="font-medium">{formatDate(order.paidAt)}</span>
              </div>
            )}
            {order.productKey && (
              <div className="pt-2 border-t border-border mt-2">
                <span className="text-muted-foreground text-xs">Kode Aktivasi</span>
                <p className="font-mono font-bold text-primary break-all">
                  {order.productKey}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full">
              Riwayat Transaksi
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full">Belanja Lagi</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
