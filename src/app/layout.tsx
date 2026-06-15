import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Store — Produk Digital Terpercaya",
  description:
    "Digital Store: beli produk & layanan digital dengan pembayaran QRIS instan, dukungan AI chatbot, dan layanan owner langsung.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.lumakara.biz.id",
  ),
  openGraph: {
    title: "Digital Store",
    description: "Produk & layanan digital terpercaya.",
    url: "https://www.lumakara.biz.id",
    siteName: "Digital Store",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
