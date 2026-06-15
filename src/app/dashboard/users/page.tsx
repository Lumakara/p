"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Ban, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  provider: string | null;
  role: string;
  status: string;
  totalOrders: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(u: AdminUser) {
    const next = u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      toast.success(next === "BLOCKED" ? "User diblokir" : "User diaktifkan");
      load();
    }
  }

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-sm text-muted-foreground">{users.length} pengguna</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama / email..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
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
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bergabung</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">{u.name || u.username || "-"}</td>
                  <td className="py-3 px-4">{u.email || "-"}</td>
                  <td className="py-3 px-4 capitalize">{u.provider || "-"}</td>
                  <td className="py-3 px-4">{u.totalOrders}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={u.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant={u.status === "BLOCKED" ? "outline" : "ghost"}
                      size="sm"
                      className={u.status === "BLOCKED" ? "" : "text-red-500"}
                      onClick={() => toggleBlock(u)}
                    >
                      {u.status === "BLOCKED" ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> Aktifkan</>
                      ) : (
                        <><Ban className="h-4 w-4 mr-1" /> Blokir</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    Tidak ada pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
