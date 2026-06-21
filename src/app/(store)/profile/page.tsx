"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Moon, Sun, Palette, Globe, LogOut, ShieldCheck,
  User, Camera, Loader2, Check, HelpCircle, MessageCircle,
  ChevronRight, BookOpen, CreditCard, Package, Shield,
  AlertCircle, Phone, Mail, ExternalLink, Zap, RefreshCw,
  KeyRound, Copy, CheckCheck, CalendarDays, Search, Trash2,
  Bell, ThumbsUp, ThumbsDown, Heart, Filter, X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/appStore";
import { useAuthContext } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RecentlyViewedCarousel } from "@/components/store/RecentlyViewedCarousel";
import type { ThemeColor } from "@/types";

const COLORS: { id: ThemeColor; label: string; className: string }[] = [
  { id: "default", label: "Orange", className: "bg-orange-500" },
  { id: "ocean", label: "Ocean", className: "bg-sky-500" },
  { id: "sunset", label: "Sunset", className: "bg-pink-500" },
  { id: "forest", label: "Forest", className: "bg-emerald-500" },
];

// ── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, syncUser } = useAuthContext();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const themeColor = useAppStore((s) => s.themeColor);
  const setThemeColor = useAppStore((s) => s.setThemeColor);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const clearRecentlyViewed = useAppStore((s) => s.clearRecentlyViewed);
  const clearFavorites = useAppStore((s) => s.clearFavorites);
  const clearCart = useAppStore((s) => s.clearCart);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  const requestNotification = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Browser tidak mendukung notifikasi");
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("Notifikasi diblokir. Aktifkan melalui pengaturan browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === "granted");
    if (perm === "granted") toast.success("Notifikasi browser diaktifkan");
    else toast.error("Izin notifikasi ditolak");
  }, []);

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const saveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    setSavingName(true);
    try {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { displayName: displayName.trim() });
      await syncUser(user);
      toast.success("Nama berhasil diperbarui");
      setEditingName(false);
    } catch {
      toast.error("Gagal memperbarui nama");
    } finally {
      setSavingName(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce_upload");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhhdxaejc";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload gagal");
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { photoURL: data.secure_url });
      await syncUser(user);
      toast.success("Foto profil diperbarui");
    } catch {
      toast.error("Gagal mengunggah foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const signOut = async () => {
    try {
      const { signOut: fbSignOut } = await import("firebase/auth");
      const { auth } = await import("@/config/firebase");
      await fbSignOut(auth);
      router.push("/login");
    } catch {
      toast.error("Gagal keluar");
    }
  };

  return (
    <div className="space-y-4">
      {/* User card */}
      {user ? (
        <Card className="p-5 flex items-center gap-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&size=128`}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-border"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
            >
              {uploadingPhoto ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 h-8 px-2 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && saveDisplayName()}
                />
                <Button size="icon" className="h-8 w-8" onClick={saveDisplayName} disabled={savingName}>
                  {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="font-semibold text-sm hover:text-primary transition-colors text-left"
              >
                {user.displayName || "Tambah nama"}
              </button>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <button
                onClick={copyEmail}
                aria-label="Salin email"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                {emailCopied ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {user.providerData[0]?.providerId === "google.com"
                ? "Login dengan Google"
                : user.providerData[0]?.providerId === "github.com"
                ? "Login dengan GitHub"
                : "Login dengan Email"}
            </p>
            {joinDate && (
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Bergabung {joinDate}
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-5 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Tamu</p>
            <p className="text-xs text-muted-foreground">Belum login</p>
            <div className="flex gap-2 mt-2">
              <Link href="/login">
                <Button size="sm" className="h-7 text-xs">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="outline" className="h-7 text-xs">Daftar</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Pengaturan accordion */}
      <Card className="p-0 overflow-hidden">
        <Accordion type="multiple" defaultValue={["appearance"]}>

          {/* Tampilan */}
          <AccordionItem value="appearance">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Tampilan
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-4 pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode Gelap</span>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Skema Warna
                  </span>
                  <div className="flex gap-2.5">
                    {COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setThemeColor(c.id)}
                        title={c.label}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all",
                          c.className,
                          themeColor === c.id && "ring-2 ring-offset-2 ring-foreground scale-110",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Bahasa */}
          <AccordionItem value="language">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4" /> Bahasa
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex gap-2 pb-1">
                {(["id", "en"] as const).map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={language === l ? "default" : "outline"}
                    onClick={() => setLanguage(l)}
                  >
                    {l === "id" ? "Indonesia" : "English"}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Notifikasi */}
          <AccordionItem value="notifications">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Bell className="h-4 w-4" /> Notifikasi
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-3 pb-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Suara Notifikasi</p>
                    <p className="text-[11px] text-muted-foreground/60">Bunyi saat ada pesan baru</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Notifikasi Browser</p>
                    <p className="text-[11px] text-muted-foreground/60">Notifikasi push di browser</p>
                  </div>
                  <Switch
                    checked={notifGranted}
                    onCheckedChange={requestNotification}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Akun */}
          <AccordionItem value="account">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" /> Akun
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-2 pb-1">
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Package className="h-4 w-4 mr-2" /> Riwayat Pesanan
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                </Link>
                {user?.providerData[0]?.providerId === "password" && (
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <KeyRound className="h-4 w-4 mr-2" /> Ubah Password
                      <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2" /> Dashboard Admin
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                </Link>
                {user && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm text-destructive hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Keluar
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Privasi & Data */}
          <AccordionItem value="privacy">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" /> Privasi & Data
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-2 pb-1">
                <p className="text-xs text-muted-foreground mb-2">Data disimpan lokal di perangkat ini.</p>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    clearRecentlyViewed();
                    toast.success("Riwayat tontonan dihapus");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Hapus Riwayat Dilihat
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    clearFavorites();
                    toast.success("Daftar favorit dihapus");
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" /> Hapus Semua Favorit
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    clearCart();
                    toast.success("Keranjang dikosongkan");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Kosongkan Keranjang
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </Card>
    </div>
  );
}

// ── Help Tab ─────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "payment", label: "Pembayaran" },
  { id: "order", label: "Pesanan" },
  { id: "account", label: "Akun" },
  { id: "general", label: "Umum" },
];

const FAQ = [
  {
    q: "Bagaimana cara membeli produk?",
    a: "Pilih produk → pilih paket → klik 'Beli Sekarang' → selesaikan verifikasi → pilih metode bayar (QRIS/transfer) → bayar sesuai nominal. Produk dikirim otomatis setelah pembayaran dikonfirmasi.",
    category: "general",
  },
  {
    q: "Berapa lama proses pengiriman produk digital?",
    a: "Produk digital dikirim instan setelah pembayaran terkonfirmasi sistem. Biasanya 1–5 menit. Jika lebih dari 10 menit, hubungi owner.",
    category: "order",
  },
  {
    q: "Metode pembayaran apa yang tersedia?",
    a: "Saat ini mendukung: QRIS (semua e-wallet & bank) dan transfer bank manual. Nominal transfer akan diberikan kode unik untuk verifikasi otomatis.",
    category: "payment",
  },
  {
    q: "Apakah ada garansi produk?",
    a: "Ya, semua produk bergaransi sesuai deskripsi masing-masing produk. Jika ada masalah, hubungi owner melalui chat atau Telegram dalam 24 jam.",
    category: "general",
  },
  {
    q: "Bagaimana jika pembayaran berhasil tapi produk belum diterima?",
    a: "Cek halaman 'Pesanan' untuk status terbaru. Jika status PAID tapi product key belum muncul, refresh halaman atau hubungi owner segera.",
    category: "order",
  },
  {
    q: "Bisakah saya membatalkan pesanan?",
    a: "Pesanan yang sudah PAID tidak bisa dibatalkan karena produk digital langsung terkirim. Untuk pesanan PENDING yang belum dibayar, biarkan expired otomatis dalam 15 menit.",
    category: "order",
  },
  {
    q: "Apakah data saya aman?",
    a: "Data transaksi dienkripsi dan tidak dibagikan ke pihak ketiga. Autentikasi menggunakan Firebase (Google/GitHub) yang berstandar keamanan tinggi.",
    category: "account",
  },
  {
    q: "Bagaimana cara menghubungi owner?",
    a: "Gunakan fitur AI Chatbot di pojok kanan bawah untuk pertanyaan umum. Untuk bantuan langsung, klik tombol 'Hubungi Owner' atau buka halaman Bantuan.",
    category: "general",
  },
  {
    q: "Bagaimana cara scan QR Code QRIS?",
    a: "Buka aplikasi e-wallet (GoPay, OVO, Dana, dll.) → tap ikon scan/bayar → arahkan kamera ke QR code. Atau screenshot QR lalu upload ke e-wallet pilihan.",
    category: "payment",
  },
  {
    q: "Apakah bisa bayar pakai transfer bank?",
    a: "Ya! Pilih metode 'Transfer Bank' saat checkout. Sistem memberi nomor rekening dan nominal unik (contoh: Rp 50.003). Bayar tepat sesuai nominal untuk verifikasi otomatis.",
    category: "payment",
  },
  {
    q: "Berapa batas waktu pembayaran?",
    a: "Pesanan otomatis expired setelah 15 menit jika tidak dibayar. Setelah expired, kamu perlu membuat pesanan baru.",
    category: "payment",
  },
  {
    q: "Apa yang dimaksud kode unik transfer?",
    a: "Kode unik adalah angka tambahan kecil (contoh: 003 dari Rp 50.003) untuk identifikasi pembayaranmu secara otomatis oleh sistem.",
    category: "payment",
  },
  {
    q: "Apakah ada biaya tambahan saat pembayaran?",
    a: "Tidak ada biaya dari kami. Namun beberapa e-wallet atau bank mungkin mengenakan biaya transaksi dari pihak mereka.",
    category: "payment",
  },
  {
    q: "Bagaimana cara melihat product key yang sudah dibeli?",
    a: "Buka menu 'Pesanan' → pilih pesanan dengan status PAID → klik detail untuk melihat product key yang tersimpan secara permanen.",
    category: "order",
  },
  {
    q: "Pesanan saya expired, bagaimana?",
    a: "Pesanan expired otomatis setelah 15 menit tanpa pembayaran. Kembali ke produk dan buat pesanan baru. Tidak ada biaya untuk pesanan expired.",
    category: "order",
  },
  {
    q: "Bisakah saya login dengan Google atau GitHub?",
    a: "Ya! Di halaman login, klik 'Lanjutkan dengan Google' atau 'Lanjutkan dengan GitHub'. Login sosial lebih aman dan tidak perlu password terpisah.",
    category: "account",
  },
  {
    q: "Bagaimana cara ubah foto profil?",
    a: "Buka halaman Profil → klik ikon kamera di foto profil → pilih gambar dari galeri → foto otomatis terupload dan diperbarui.",
    category: "account",
  },
  {
    q: "Bagaimana cara ubah username?",
    a: "Buka halaman Profil → klik nama yang tertera → ketik nama baru → tekan Enter atau ikon centang untuk menyimpan.",
    category: "account",
  },
  {
    q: "Apakah riwayat pesanan tersimpan permanen?",
    a: "Ya, semua riwayat pesanan tersimpan di server dan bisa diakses kapanpun dari menu 'Pesanan' selama akun aktif.",
    category: "account",
  },
];

const GUIDES = [
  {
    icon: CreditCard,
    title: "Panduan Pembayaran QRIS",
    desc: "Cara bayar via QRIS dengan semua e-wallet (GoPay, OVO, Dana, dll.)",
    steps: [
      "Klik 'Beli Sekarang' pada produk pilihan",
      "Pilih metode QRIS di halaman checkout",
      "Scan QR code menggunakan e-wallet atau kamera HP",
      "Masukkan nominal sesuai yang tertera",
      "Konfirmasi pembayaran di aplikasi e-wallet",
      "Tunggu konfirmasi otomatis (1–3 menit)",
    ],
  },
  {
    icon: Package,
    title: "Cara Melacak Pesanan",
    desc: "Pantau status pesanan real-time di halaman Pesanan.",
    steps: [
      "Buka menu 'Pesanan' di navigasi bawah",
      "Cari pesanan berdasarkan ID atau tanggal",
      "Status: PENDING → PAID → Product Key tersedia",
      "Klik pesanan untuk melihat detail dan product key",
    ],
  },
  {
    icon: Shield,
    title: "Keamanan Akun",
    desc: "Tips menjaga keamanan akun Anda.",
    steps: [
      "Gunakan email aktif yang kamu akses rutin",
      "Aktifkan verifikasi 2 langkah di akun Google/GitHub",
      "Jangan bagikan product key kepada siapapun",
      "Segera hubungi owner jika ada aktivitas mencurigakan",
      "Gunakan password unik dan kuat jika login email",
    ],
  },
  {
    icon: Zap,
    title: "Pembayaran Transfer Bank",
    desc: "Cara bayar via transfer bank manual.",
    steps: [
      "Pilih metode 'Transfer Bank' saat checkout",
      "Catat nomor rekening tujuan yang diberikan",
      "Transfer TEPAT sesuai nominal unik yang tertera",
      "Tunggu verifikasi otomatis sistem (1–5 menit)",
      "Jika >10 menit belum dikonfirmasi, hubungi owner",
    ],
  },
];

const TROUBLESHOOTING = [
  {
    problem: "Pembayaran berhasil tapi pesanan masih PENDING",
    solution: "Tunggu 5 menit lalu refresh halaman Pesanan. Jika masih PENDING, hubungi owner dengan ID pesanan.",
  },
  {
    problem: "Tidak bisa scan QR Code",
    solution: "Screenshot QR lalu upload ke aplikasi e-wallet. Atau gunakan metode transfer bank manual.",
  },
  {
    problem: "AI Chatbot tidak merespons",
    solution: "Refresh halaman lalu coba kirim pesan lagi. Jika masih error, hubungi owner langsung via Telegram.",
  },
  {
    problem: "Lupa product key setelah dibeli",
    solution: "Buka menu Pesanan → pilih pesanan terkait → klik Detail untuk melihat product key yang tersimpan.",
  },
  {
    problem: "Nominal transfer berbeda dari yang tertera",
    solution: "Bayar TEPAT sesuai nominal unik yang diberikan sistem (termasuk kode unik). Nominal berbeda akan gagal verifikasi.",
  },
  {
    problem: "Tidak bisa login dengan Google/GitHub",
    solution: "Pastikan popup tidak diblokir browser. Coba nonaktifkan ad-blocker atau gunakan browser mode normal (bukan incognito).",
  },
];

function HelpTab() {
  const [activeGuide, setActiveGuide] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState("all");
  const [guideHelpful, setGuideHelpful] = useState<Record<number, boolean | null>>({});
  const tgUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

  const filteredFaq = FAQ.filter((item) => {
    const matchSearch =
      !faqSearch ||
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase());
    const matchCat = faqCategory === "all" || item.category === faqCategory;
    return matchSearch && matchCat;
  });

  const markHelpful = (i: number, val: boolean) => {
    setGuideHelpful((prev) => ({ ...prev, [i]: prev[i] === val ? null : val }));
  };

  return (
    <div className="space-y-5">
      {/* Quick contact */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" /> Hubungi Kami
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tgUsername && (
            <a
              href={`https://t.me/${tgUsername}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full text-xs h-9 justify-start gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                Telegram Owner
              </Button>
            </a>
          )}
          <Link href="/support">
            <Button variant="outline" className="w-full text-xs h-9 justify-start gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Tiket Support
            </Button>
          </Link>
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>("[aria-label='Open chat']");
              btn?.click();
            }}
            className="col-span-2"
          >
            <Button variant="default" className="w-full text-xs h-9 gap-2">
              <MessageCircle className="h-3.5 w-3.5" />
              Chat AI Sekarang
            </Button>
          </button>
        </div>
      </Card>

      {/* Status system */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-500" /> Status Sistem
        </h3>
        <div className="space-y-2">
          {[
            { name: "Toko & Produk", status: "Operasional" },
            { name: "Pembayaran QRIS", status: "Operasional" },
            { name: "Transfer Bank", status: "Operasional" },
            { name: "AI Chatbot", status: "Operasional" },
            { name: "Notifikasi Telegram", status: "Operasional" },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.name}</span>
              <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Guides */}
      <section>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Panduan Penggunaan
        </h3>
        <div className="space-y-2">
          {GUIDES.map((g, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setActiveGuide(activeGuide === i ? null : i)}
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <g.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{g.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{g.desc}</p>
                </div>
                <ChevronRight
                  className={cn("h-4 w-4 text-muted-foreground transition-transform", activeGuide === i && "rotate-90")}
                />
              </button>
              {activeGuide === i && (
                <div className="px-4 pb-4 border-t border-border">
                  <ol className="space-y-2 mt-3">
                    {g.steps.map((step, si) => (
                      <li key={si} className="flex gap-2.5 text-sm">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {si + 1}
                        </span>
                        <span className="text-muted-foreground leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {/* Was this helpful? */}
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Panduan ini membantu?</span>
                    <button
                      onClick={() => markHelpful(i, true)}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors",
                        guideHelpful[i] === true
                          ? "bg-green-500/10 border-green-500/30 text-green-600"
                          : "border-border text-muted-foreground hover:border-green-500/30 hover:text-green-600",
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" /> Ya
                    </button>
                    <button
                      onClick={() => markHelpful(i, false)}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors",
                        guideHelpful[i] === false
                          ? "bg-red-500/10 border-red-500/30 text-red-600"
                          : "border-border text-muted-foreground hover:border-red-500/30 hover:text-red-600",
                      )}
                    >
                      <ThumbsDown className="h-3 w-3" /> Tidak
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ with search + category filter */}
      <section>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> Pertanyaan Umum (FAQ)
        </h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full h-9 pl-9 pr-9 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary transition"
          />
          {faqSearch && (
            <button
              onClick={() => setFaqSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFaqCategory(cat.id)}
              className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                faqCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {faqSearch && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {filteredFaq.length} hasil untuk &ldquo;{faqSearch}&rdquo;
          </p>
        )}

        <Card className="p-0 overflow-hidden">
          {filteredFaq.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Tidak ada pertanyaan ditemukan.
              <button
                onClick={() => { setFaqSearch(""); setFaqCategory("all"); }}
                className="block mx-auto mt-1 text-primary text-xs hover:underline"
              >
                Reset pencarian
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible>
              {filteredFaq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="px-4 text-sm text-left hover:no-underline font-medium">
                    <span className="flex items-center gap-2">
                      {item.q}
                      <Badge variant="secondary" className="text-[9px] ml-auto flex-shrink-0 hidden sm:flex capitalize">
                        {FAQ_CATEGORIES.find((c) => c.id === item.category)?.label}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Card>
      </section>

      {/* Troubleshooting */}
      <section>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" /> Troubleshooting
        </h3>
        <div className="space-y-2">
          {TROUBLESHOOTING.map((t, i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-3">
                <RefreshCw className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t.problem}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Still need help? */}
      <Card className="p-5 text-center bg-primary/5 border-primary/20">
        <HelpCircle className="h-8 w-8 mx-auto text-primary mb-2" />
        <p className="font-semibold text-sm">Masih butuh bantuan?</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Tim kami siap membantu 24/7 via chat atau Telegram.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>("[aria-label='Open chat']");
              btn?.click();
            }}
          >
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" /> Chat AI
            </Button>
          </button>
          {tgUsername && (
            <a href={`https://t.me/${tgUsername}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-blue-500" /> Telegram
              </Button>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Profil</h1>

      {/* Recently viewed — above tabs */}
      <div className="mb-5">
        <RecentlyViewedCarousel />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="profile" className="flex-1">
            <User className="h-4 w-4 mr-1.5" /> Profil
          </TabsTrigger>
          <TabsTrigger value="help" className="flex-1">
            <HelpCircle className="h-4 w-4 mr-1.5" /> Bantuan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="help">
          <HelpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
