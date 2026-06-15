"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { rupiah } from "@/lib/format";
import { CloudinaryUpload } from "@/components/dashboard/CloudinaryUpload";
import type { Product } from "@/types";

interface FormState {
  id?: string;
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  basePrice: string;
  discountPrice: string;
  stock: string;
  icon: string;
  badge: string;
  features: string;
  active: boolean;
}

const EMPTY: FormState = {
  title: "",
  description: "",
  fullDescription: "",
  category: "general",
  basePrice: "",
  discountPrice: "",
  stock: "",
  icon: "/images/products/default.svg",
  badge: "",
  features: "",
  active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      title: p.title,
      description: p.description,
      fullDescription: p.fullDescription || "",
      category: p.category,
      basePrice: String(p.basePrice ?? ""),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      stock: p.stock === null || p.stock === undefined ? "" : String(p.stock),
      icon: p.icon,
      badge: p.badge || "",
      features: (p.features || []).join(", "),
      active: p.active ?? true,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      fullDescription: form.fullDescription,
      category: form.category || "general",
      basePrice: Number(form.basePrice) || 0,
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: form.stock,
      icon: form.icon || "/images/products/default.svg",
      badge: form.badge || null,
      features: form.features
        ? form.features.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      active: form.active,
      tiers: [
        {
          name: "Standard",
          price: Number(form.basePrice) || 0,
          features: form.features
            ? form.features.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
      ],
    };
    try {
      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      toast.success(form.id ? "Produk diperbarui" : "Produk ditambahkan");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Hapus produk "${p.title}"?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    const data = await res.json();
    toast.success(data.message || "Produk dihapus");
    load();
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-sm text-muted-foreground">{products.length} produk</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Produk
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
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
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Harga</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.icon} alt={p.title} className="h-9 w-9 rounded object-contain bg-muted" />
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{rupiah(p.discountPrice ?? p.basePrice)}</td>
                  <td className="py-3 px-4">{p.stock ?? "∞"}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(p)}>
                      <Badge className={p.active ? "bg-green-500" : "bg-gray-400"}>
                        {p.active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => remove(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.icon} alt="preview" className="h-16 w-16 rounded object-contain bg-muted border border-border" />
              <div className="flex-1 space-y-1">
                <Label>Gambar Produk</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="URL gambar"
                  />
                  <CloudinaryUpload onUploaded={(url) => setForm((f) => ({ ...f, icon: url }))}>
                    <Button type="button" variant="outline" size="icon">
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                  </CloudinaryUpload>
                </div>
              </div>
            </div>
            <div>
              <Label>Nama Produk</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Deskripsi Singkat</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Deskripsi Lengkap</Label>
              <Textarea
                rows={3}
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harga</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
              </div>
              <div>
                <Label>Harga Diskon</Label>
                <Input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
              </div>
              <div>
                <Label>Stok (kosong = ∞)</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <Label>Kategori</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Badge (opsional)</Label>
              <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Popular / Promo" />
            </div>
            <div>
              <Label>Fitur (pisahkan dengan koma)</Label>
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {form.id ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
