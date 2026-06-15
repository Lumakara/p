"use client";

import { useEffect, useRef, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { rupiah, formatDate, statusColor } from "@/lib/format";

interface Stats {
  totalRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  ordersToday: number;
  paidOrders: number;
  failedOrders: number;
  activeProducts: number;
  totalUsers: number;
  chart: { name: string; revenue: number; orders: number }[];
  topProducts: { name: string; count: number }[];
  recentOrders: {
    id: string;
    productName: string;
    customerName?: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return;
      const data: Stats = await res.json();

      // Real-time-ish notifications: detect new orders since last poll.
      if (!firstLoad.current) {
        for (const o of data.recentOrders) {
          if (!knownOrderIds.current.has(o.id)) {
            if (o.status === "PAID")
              toast.success(`🟢 Pembayaran berhasil: ${o.productName}`);
            else if (o.status === "PENDING")
              toast.info(`🟡 Transaksi baru: ${o.productName}`);
            else toast.error(`🔴 Transaksi ${o.status}: ${o.productName}`);
          }
        }
      }
      data.recentOrders.forEach((o) => knownOrderIds.current.add(o.id));
      firstLoad.current = false;

      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { title: "Total Revenue", value: rupiah(stats.totalRevenue), icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { title: "Revenue Bulan Ini", value: rupiah(stats.monthRevenue), icon: DollarSign, color: "from-teal-500 to-cyan-500" },
    { title: "Total Order", value: stats.totalOrders, icon: ShoppingCart, color: "from-blue-500 to-indigo-500" },
    { title: "Order Hari Ini", value: stats.ordersToday, icon: ShoppingCart, color: "from-violet-500 to-purple-500" },
    { title: "Order Berhasil", value: stats.paidOrders, icon: CheckCircle2, color: "from-emerald-500 to-green-600" },
    { title: "Gagal/Expired", value: stats.failedOrders, icon: XCircle, color: "from-red-500 to-rose-500" },
    { title: "User Terdaftar", value: stats.totalUsers, icon: Users, color: "from-orange-500 to-amber-500" },
    { title: "Produk Aktif", value: stats.activeProducts, icon: Package, color: "from-pink-500 to-fuchsia-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">Ringkasan performa toko</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.title} className="p-4">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}
            >
              <c.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.title}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Revenue 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.chart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} width={70} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => rupiah(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Top 5 Produk (Terjual)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topProducts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" fontSize={10} interval={0} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Transaksi Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Produk</th>
                <th className="py-2 pr-4">Nominal</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs">{o.id}</td>
                  <td className="py-2 pr-4">{o.customerName || "-"}</td>
                  <td className="py-2 pr-4">{o.productName}</td>
                  <td className="py-2 pr-4">{rupiah(o.amount)}</td>
                  <td className="py-2 pr-4">
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
