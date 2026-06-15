"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Loader2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { rupiah, formatDate, statusColor } from "@/lib/format";
import type { Order } from "@/types";

interface OrderDetail extends Order {
  webhookLogs?: { id: string; event: string; createdAt: string; verified: boolean }[];
}

const STATUSES = ["PENDING", "PAID", "EXPIRED", "FAILED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/orders", window.location.origin);
      if (status !== "all") url.searchParams.set("status", status);
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url.toString());
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(id: string) {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setDetail(data.order);
  }

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Status diubah ke ${newStatus}`);
      openDetail(id);
      load();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pesanan</h1>
        <p className="text-sm text-muted-foreground">{orders.length} transaksi</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari order id / nama / email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-mono text-xs">{o.id}</td>
                  <td className="py-3 px-4">{o.customerName || "-"}</td>
                  <td className="py-3 px-4">{o.productName}</td>
                  <td className="py-3 px-4">{rupiah(o.totalAmount ?? o.amount)}</td>
                  <td className="py-3 px-4">
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(o.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Tidak ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <Row label="Order ID" value={detail.id} mono />
              <Row label="Produk" value={detail.productName} />
              <Row label="Paket" value={detail.tier || "-"} />
              <Row label="Nominal" value={rupiah(detail.totalAmount ?? detail.amount)} />
              <Row label="User" value={detail.customerName || "-"} />
              <Row label="Email" value={detail.customerEmail || "-"} />
              <Row label="Transaction ID" value={detail.transactionId || "-"} mono />
              <Row label="Dibuat" value={formatDate(detail.createdAt)} />
              <Row label="Dibayar" value={detail.paidAt ? formatDate(detail.paidAt) : "-"} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColor(detail.status)}>{detail.status}</Badge>
              </div>

              {detail.productKey && (
                <div className="rounded-lg bg-muted p-2">
                  <span className="text-xs text-muted-foreground">Product Key</span>
                  <p className="font-mono font-semibold">{detail.productKey}</p>
                </div>
              )}

              {/* Webhook / status logs */}
              {detail.webhookLogs && detail.webhookLogs.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Log Webhook</p>
                  <div className="space-y-1">
                    {detail.webhookLogs.map((w) => (
                      <div key={w.id} className="text-xs flex items-center gap-2">
                        <span className={w.verified ? "text-green-500" : "text-red-500"}>●</span>
                        {w.event} — {formatDate(w.createdAt)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual status update */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Update status manual (edge case)
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detail.status === s ? "default" : "outline"}
                      onClick={() => updateStatus(detail.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
