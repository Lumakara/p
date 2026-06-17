import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: "wifi-install",
    title: "WiFi & Network Installation",
    description:
      "Professional WiFi network setup and optimization service for homes and offices.",
    fullDescription:
      "Get a professional WiFi network setup that covers your entire space with strong signal. We optimize placement for maximum coverage and configure security settings to protect your network.",
    icon: "/images/products/wifi.svg",
    category: "networking",
    basePrice: 350000,
    rating: 4.9,
    reviewsCount: 128,
    features: [
      "Professional Installation",
      "Coverage Optimization",
      "Security Configuration",
      "Device Connection Support",
    ],
    tiers: [
      { name: "Basic", price: 350000, features: ["Up to 100 Mbps", "Single Floor Coverage", "Basic Security Setup", "1 Month Support"] },
      { name: "Standard", price: 500000, features: ["Up to 300 Mbps", "Multi-Floor Coverage", "Advanced Security", "3 Months Support", "Guest Network"] },
      { name: "Premium", price: 750000, features: ["Up to 1 Gbps", "Whole Building Coverage", "Enterprise Security", "6 Months Support", "Guest Network", "Parental Controls"] },
    ],
  },
  {
    id: "cctv-setup",
    title: "CCTV Installation Service",
    description: "Complete CCTV system installation with remote monitoring setup.",
    fullDescription:
      "Professional CCTV installation service with high-quality cameras, remote viewing setup, and motion detection configuration. Keep your property secure 24/7.",
    icon: "/images/products/cctv.svg",
    category: "security",
    basePrice: 1200000,
    rating: 4.8,
    reviewsCount: 95,
    features: ["HD Quality Recording", "Remote Mobile Access", "Motion Detection Alerts", "Night Vision Capable"],
    tiers: [
      { name: "2 Cameras", price: 1200000, features: ["2 HD Cameras", "DVR/NVR Included", "50m Cable", "Basic App Setup", "1 Month Warranty"] },
      { name: "4 Cameras", price: 2200000, features: ["4 HD Cameras", "DVR/NVR Included", "100m Cable", "Advanced App Setup", "3 Months Warranty", "Cloud Storage Setup"] },
      { name: "8 Cameras", price: 4000000, features: ["8 HD Cameras", "DVR/NVR Included", "200m Cable", "Advanced App Setup", "6 Months Warranty", "Cloud Storage", "Night Vision"] },
    ],
  },
  {
    id: "code-repair",
    title: "Code Repair & Debug",
    description: "Expert debugging and code repair service for any programming language.",
    fullDescription:
      "Stuck with a bug? Our experienced developers can help fix errors in any programming language including JavaScript, Python, Java, C++, and more.",
    icon: "/images/products/code.svg",
    category: "development",
    basePrice: 150000,
    rating: 5.0,
    reviewsCount: 210,
    features: ["Any Programming Language", "Bug Documentation", "Code Optimization", "Performance Testing"],
    tiers: [
      { name: "Small Fix", price: 150000, features: ["1-3 Bugs Fixed", "48 Hour Delivery", "Basic Documentation", "1 Revision"] },
      { name: "Medium Fix", price: 350000, features: ["4-8 Bugs Fixed", "72 Hour Delivery", "Detailed Documentation", "3 Revisions", "Code Review"] },
      { name: "Complex Fix", price: 700000, features: ["9-15 Bugs Fixed", "5 Day Delivery", "Complete Documentation", "Unlimited Revisions", "Code Review", "Optimization"] },
    ],
  },
  {
    id: "media-editing",
    title: "Photo & Video Editing",
    description: "Professional photo retouching and video editing services.",
    fullDescription:
      "Transform your photos and videos with professional editing. From color correction to complex compositing, we deliver stunning results.",
    icon: "/images/products/media.svg",
    category: "media",
    basePrice: 50000,
    rating: 4.7,
    reviewsCount: 156,
    features: ["Adobe Creative Suite", "4K Resolution Support", "Revision Included", "Source Files Included"],
    tiers: [
      { name: "Photo", price: 50000, features: ["Up to 10 Photos", "Color Correction", "Basic Retouching", "48 Hour Delivery"] },
      { name: "Video", price: 250000, features: ["Up to 5 Minutes", "Color Grading", "Audio Sync", "Transitions", "3 Day Delivery"] },
      { name: "Pro Package", price: 500000, features: ["20 Photos + 10 Min Video", "Advanced Retouching", "Motion Graphics", "Sound Design", "5 Day Delivery"] },
    ],
  },
  {
    id: "vps-hosting",
    title: "VPS Hosting Setup",
    description: "Virtual Private Server setup and configuration service.",
    fullDescription:
      "Get your VPS server configured professionally with security hardening, software installation, and monitoring setup.",
    icon: "/images/products/server.svg",
    category: "hosting",
    basePrice: 200000,
    rating: 4.9,
    reviewsCount: 89,
    features: ["Linux/Windows Support", "Security Hardening", "Performance Optimization", "24/7 Monitoring"],
    tiers: [
      { name: "Basic", price: 200000, features: ["OS Installation", "Basic Security", "Web Server Setup", "Email Configuration", "1 Month Support"] },
      { name: "Business", price: 450000, features: ["OS Installation", "Advanced Security", "Web + DB Server", "SSL Setup", "Backup Configuration", "3 Months Support"] },
      { name: "Enterprise", price: 800000, features: ["Custom OS", "Enterprise Security", "Full Stack Setup", "Load Balancer", "Monitoring", "6 Months Support"] },
    ],
  },
  {
    id: "web-dev",
    title: "Website Development",
    description: "Custom website development from landing pages to full web apps.",
    fullDescription:
      "Professional website development services. We create responsive, fast, and SEO-friendly websites tailored to your needs.",
    icon: "/images/products/web.svg",
    category: "development",
    basePrice: 1200000,
    rating: 4.8,
    reviewsCount: 145,
    badge: "Popular",
    features: ["React/Next.js/Vue", "Mobile Responsive", "SEO Optimized", "Fast Loading Speed"],
    tiers: [
      { name: "Landing Page", price: 1200000, features: ["1 Page Design", "Mobile Responsive", "Basic SEO", "Contact Form", "1 Week Delivery"] },
      { name: "Business", price: 3500000, features: ["Up to 5 Pages", "CMS Integration", "Advanced SEO", "Analytics Setup", "3 Weeks Delivery", "2 Revisions"] },
      { name: "E-Commerce", price: 8000000, features: ["Unlimited Products", "Payment Gateway", "Admin Dashboard", "User Accounts", "6 Weeks Delivery", "Unlimited Revisions"] },
    ],
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        description: p.description,
        fullDescription: p.fullDescription,
        icon: p.icon,
        category: p.category,
        basePrice: p.basePrice,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        badge: (p as { badge?: string }).badge,
        features: p.features,
        tiers: p.tiers,
      },
      create: {
        id: p.id,
        title: p.title,
        description: p.description,
        fullDescription: p.fullDescription,
        icon: p.icon,
        category: p.category,
        basePrice: p.basePrice,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        badge: (p as { badge?: string }).badge,
        features: p.features,
        tiers: p.tiers,
      },
    });
  }

  console.log("Seeding default settings...");
  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "LumakaraStore",
        description: "Layanan  mudah dan lengkap",
        logo: "",
        themeColor: "#f97316",
        paymentExpiryMinutes: 15,
        telegramNotifications: true,
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
