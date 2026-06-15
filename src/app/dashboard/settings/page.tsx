"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { rupiah } from "@/lib/format";

interface SiteSettings {
  name: string;
  description: string;
  logo: string;
  themeColor: string;
  paymentExpiryMinutes: number;
  telegramNotifications: boolean;
}

interface Health {
  payment: { ok: boolean; balance?: number; error?: string };
  telegram: { configured: boolean };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings);
      setHealth(data.health);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Pengaturan disimpan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setSaving(false);
    }
  }

  async function testTelegram() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/telegram/test", { method: "POST" });
      const data = await res.json();
      if (data.ok) toast.success("Notifikasi Telegram terkirim!");
      else toast.error(data.error || "Telegram belum dikonfigurasi");
    } finally {
      setTesting(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      {/* Integration health */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Status Integrasi</h3>
        <div className="flex items-center justify-between text-sm">
          <span>Payment Gateway (RamaShop)</span>
          {health?.payment.ok ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Terhubung · Saldo {rupiah(health.payment.balance ?? 0)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="h-4 w-4" /> {health?.payment.error || "Gagal"}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Telegram Bot</span>
          {health?.telegram.configured ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-4 w-4" /> Terkonfigurasi
            </span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-500">
              <XCircle className="h-4 w-4" /> Belum diset
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={testTelegram} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
          Test Notifikasi Telegram
        </Button>
      </Card>

      {/* Site settings */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Pengaturan Website</h3>
        <div>
          <Label>Nama Website</Label>
          <Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
        </div>
        <div>
          <Label>Deskripsi (SEO)</Label>
          <Textarea
            rows={2}
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} />
        </div>
        <div>
          <Label>Waktu Expired Pembayaran (menit)</Label>
          <Input
            type="number"
            value={settings.paymentExpiryMinutes}
            onChange={(e) =>
              setSettings({ ...settings, paymentExpiryMinutes: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifikasi Telegram</Label>
          <Switch
            checked={settings.telegramNotifications}
            onCheckedChange={(v) => setSettings({ ...settings, telegramNotifications: v })}
          />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Simpan Pengaturan
        </Button>
      </Card>
    </div>
  );
}
