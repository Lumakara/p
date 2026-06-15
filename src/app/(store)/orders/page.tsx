"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rupiah, formatDate, statusColor } from "@/lib/format";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <Receipt className="h-10 w-10 mb-2" />
          Belum ada transaksi.
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={o.status === "PAID" ? `/success/${o.id}` : `/checkout/${o.id}`}>
              <Card className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{o.productName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{o.id}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-sm">{rupiah(o.totalAmount ?? o.amount)}</p>
                  <Badge className={statusColor(o.status)}>{o.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
