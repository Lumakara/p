"use client";

import { useState } from "react";
import { LifeBuoy, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function SupportPage() {
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    email: "",
    description: "",
  });
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: captcha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      toast.success("Tiket terkirim! Owner akan segera merespons.");
      setForm({ subject: "", category: "general", email: "", description: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Pusat Bantuan</h1>
      </div>
      <Card className="p-4">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Subjek</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Umum</SelectItem>
                <SelectItem value="technical">Teknis</SelectItem>
                <SelectItem value="billing">Pembayaran</SelectItem>
                <SelectItem value="order">Pesanan</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
            />
          </div>
          <TurnstileWidget onVerify={setCaptcha} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Kirim Tiket
          </Button>
        </form>
      </Card>
    </div>
  );
}
