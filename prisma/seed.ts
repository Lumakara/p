import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: simple, always-available product image placeholder.
const img = (text: string, color = "f97316") =>
  `https://placehold.co/400x400/${color}/ffffff/png?text=${encodeURIComponent(text)}`;

const products = [
  {
    id: "wifi-install",
    title: "WiFi & Network Installation",
    description:
      "Layanan setup & optimasi jaringan WiFi profesional untuk rumah dan kantor.",
    fullDescription:
      "Dapatkan jaringan WiFi profesional yang mencakup seluruh ruangan dengan sinyal kuat. Kami mengoptimalkan penempatan untuk jangkauan maksimal dan mengonfigurasi keamanan jaringan.",
    icon: img("WiFi", "0ea5e9"),
    category: "networking",
    basePrice: 350000,
    rating: 4.9,
    reviewsCount: 128,
    badge: "Terlaris",
    features: ["Instalasi Profesional", "Optimasi Jangkauan", "Konfigurasi Keamanan", "Dukungan Koneksi Perangkat"],
    tiers: [
      { name: "Basic", price: 350000, features: ["Up to 100 Mbps", "1 Lantai", "Setup Keamanan Dasar", "Support 1 Bulan"] },
      { name: "Standard", price: 500000, features: ["Up to 300 Mbps", "Multi Lantai", "Keamanan Lanjutan", "Support 3 Bulan", "Guest Network"] },
      { name: "Premium", price: 750000, features: ["Up to 1 Gbps", "Seluruh Gedung", "Enterprise Security", "Support 6 Bulan", "Parental Controls"] },
    ],
  },
  {
    id: "cctv-setup",
    title: "CCTV Installation Service",
    description: "Instalasi sistem CCTV lengkap dengan setup monitoring jarak jauh.",
    fullDescription:
      "Layanan instalasi CCTV profesional dengan kamera berkualitas tinggi, setup remote viewing, dan konfigurasi deteksi gerakan. Jaga properti Anda 24/7.",
    icon: img("CCTV", "ef4444"),
    category: "security",
    basePrice: 1200000,
    rating: 4.8,
    reviewsCount: 95,
    features: ["Rekaman HD", "Akses Mobile Remote", "Notifikasi Deteksi Gerak", "Night Vision"],
    tiers: [
      { name: "2 Kamera", price: 1200000, features: ["2 Kamera HD", "DVR/NVR", "Kabel 50m", "Setup App", "Garansi 1 Bulan"] },
      { name: "4 Kamera", price: 2200000, features: ["4 Kamera HD", "DVR/NVR", "Kabel 100m", "Cloud Storage", "Garansi 3 Bulan"] },
      { name: "8 Kamera", price: 4000000, features: ["8 Kamera HD", "DVR/NVR", "Kabel 200m", "Cloud Storage", "Night Vision", "Garansi 6 Bulan"] },
    ],
  },
  {
    id: "code-repair",
    title: "Code Repair & Debug",
    description: "Jasa debugging & perbaikan kode untuk semua bahasa pemrograman.",
    fullDescription:
      "Stuck dengan bug? Developer berpengalaman kami membantu memperbaiki error di semua bahasa: JavaScript, Python, Java, C++, dan lainnya.",
    icon: img("Code", "8b5cf6"),
    category: "development",
    basePrice: 150000,
    rating: 5.0,
    reviewsCount: 210,
    badge: "Populer",
    features: ["Semua Bahasa", "Dokumentasi Bug", "Optimasi Kode", "Performance Testing"],
    tiers: [
      { name: "Small Fix", price: 150000, features: ["1-3 Bug", "Delivery 48 Jam", "Dokumentasi Dasar", "1 Revisi"] },
      { name: "Medium Fix", price: 350000, features: ["4-8 Bug", "Delivery 72 Jam", "Dokumentasi Detail", "3 Revisi", "Code Review"] },
      { name: "Complex Fix", price: 700000, features: ["9-15 Bug", "Delivery 5 Hari", "Dokumentasi Lengkap", "Revisi Unlimited", "Optimasi"] },
    ],
  },
  {
    id: "media-editing",
    title: "Photo & Video Editing",
    description: "Jasa retouch foto & editing video profesional.",
    fullDescription:
      "Ubah foto dan video Anda dengan editing profesional. Dari color correction hingga compositing kompleks, hasil memukau.",
    icon: img("Media", "ec4899"),
    category: "media",
    basePrice: 50000,
    rating: 4.7,
    reviewsCount: 156,
    features: ["Adobe Creative Suite", "Support 4K", "Termasuk Revisi", "Source File Disertakan"],
    tiers: [
      { name: "Foto", price: 50000, features: ["Hingga 10 Foto", "Color Correction", "Retouch Dasar", "Delivery 48 Jam"] },
      { name: "Video", price: 250000, features: ["Hingga 5 Menit", "Color Grading", "Audio Sync", "Transisi", "Delivery 3 Hari"] },
      { name: "Pro Package", price: 500000, features: ["20 Foto + 10 Menit Video", "Retouch Lanjutan", "Motion Graphics", "Sound Design"] },
    ],
  },
  {
    id: "vps-hosting",
    title: "VPS Hosting Setup",
    description: "Setup & konfigurasi Virtual Private Server.",
    fullDescription:
      "Server VPS dikonfigurasi profesional dengan security hardening, instalasi software, dan setup monitoring.",
    icon: img("VPS", "10b981"),
    category: "hosting",
    basePrice: 200000,
    rating: 4.9,
    reviewsCount: 89,
    features: ["Support Linux/Windows", "Security Hardening", "Optimasi Performa", "Monitoring 24/7"],
    tiers: [
      { name: "Basic", price: 200000, features: ["Instalasi OS", "Keamanan Dasar", "Web Server", "Email Config", "Support 1 Bulan"] },
      { name: "Business", price: 450000, features: ["Instalasi OS", "Keamanan Lanjutan", "Web + DB", "SSL", "Backup", "Support 3 Bulan"] },
      { name: "Enterprise", price: 800000, features: ["Custom OS", "Enterprise Security", "Full Stack", "Load Balancer", "Support 6 Bulan"] },
    ],
  },
  {
    id: "web-dev",
    title: "Website Development",
    description: "Pengembangan website custom dari landing page sampai web app.",
    fullDescription:
      "Layanan pengembangan website profesional. Kami membuat website responsif, cepat, dan SEO-friendly sesuai kebutuhan Anda.",
    icon: img("Web", "3b82f6"),
    category: "development",
    basePrice: 1200000,
    rating: 4.8,
    reviewsCount: 145,
    badge: "Rekomendasi",
    features: ["React/Next.js/Vue", "Mobile Responsive", "SEO Optimized", "Loading Cepat"],
    tiers: [
      { name: "Landing Page", price: 1200000, features: ["1 Halaman", "Mobile Responsive", "SEO Dasar", "Form Kontak", "Delivery 1 Minggu"] },
      { name: "Business", price: 3500000, features: ["Hingga 5 Halaman", "CMS", "SEO Lanjutan", "Analytics", "Delivery 3 Minggu", "2 Revisi"] },
      { name: "E-Commerce", price: 8000000, features: ["Produk Unlimited", "Payment Gateway", "Admin Dashboard", "User Accounts", "Revisi Unlimited"] },
    ],
  },
  {
    id: "streaming-premium",
    title: "Streaming Premium (1 Bulan)",
    description: "Akun premium streaming film & musik, garansi penuh.",
    fullDescription:
      "Nikmati hiburan tanpa batas dengan akun premium streaming selama 1 bulan penuh. Garansi anti-error sepanjang masa aktif.",
    icon: img("Stream", "6366f1"),
    category: "subscription",
    basePrice: 35000,
    discountPrice: 25000,
    stock: 50,
    rating: 4.9,
    reviewsCount: 320,
    badge: "Diskon",
    features: ["Kualitas 4K UHD", "Garansi 1 Bulan", "Proses Instan", "Bisa di Semua Perangkat"],
    tiers: [
      { name: "1 Bulan", price: 25000, features: ["Garansi 30 Hari", "1 Profil", "Aktivasi Instan"] },
      { name: "3 Bulan", price: 65000, features: ["Garansi 90 Hari", "1 Profil", "Aktivasi Instan", "Hemat 13%"] },
      { name: "1 Tahun", price: 230000, features: ["Garansi 365 Hari", "1 Profil", "Aktivasi Instan", "Hemat 23%"] },
    ],
  },
  {
    id: "design-tool-pro",
    title: "Design Tool Pro (Lisensi)",
    description: "Lisensi tool desain profesional untuk konten & branding.",
    fullDescription:
      "Akses fitur premium tool desain: template eksklusif, background remover, brand kit, dan export tanpa watermark.",
    icon: img("Design", "f59e0b"),
    category: "subscription",
    basePrice: 40000,
    discountPrice: 30000,
    stock: 100,
    rating: 4.8,
    reviewsCount: 178,
    features: ["Template Premium", "Background Remover", "Brand Kit", "Export Tanpa Watermark"],
    tiers: [
      { name: "1 Bulan", price: 30000, features: ["Semua Fitur Pro", "Garansi 30 Hari"] },
      { name: "1 Tahun", price: 250000, features: ["Semua Fitur Pro", "Garansi 365 Hari", "Hemat 30%"] },
    ],
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    const { id, ...rest } = p;
    await prisma.product.upsert({
      where: { id },
      update: rest,
      create: { id, ...rest },
    });
  }

  console.log("Seeding default settings...");
  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "Digital Store",
        description: "Toko produk & layanan digital terpercaya",
        logo: "",
        themeColor: "#f97316",
        paymentExpiryMinutes: 15,
        telegramNotifications: true,
      },
    },
  });

  console.log("Seed complete:", products.length, "products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
