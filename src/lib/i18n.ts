import { useAppStore } from "@/store/appStore";
import type { LanguageType } from "@/types";

type Dict = Record<string, { id: string; en: string }>;

export const translations: Dict = {
  home: { id: "Beranda", en: "Home" },
  products: { id: "Produk", en: "Products" },
  cart: { id: "Keranjang", en: "Cart" },
  orders: { id: "Pesanan", en: "Orders" },
  profile: { id: "Profil", en: "Profile" },
  support: { id: "Bantuan", en: "Support" },
  search: { id: "Cari produk...", en: "Search products..." },
  buyNow: { id: "Beli Sekarang", en: "Buy Now" },
  addToCart: { id: "Tambah ke Keranjang", en: "Add to Cart" },
  checkout: { id: "Bayar", en: "Checkout" },
  total: { id: "Total", en: "Total" },
  signIn: { id: "Masuk", en: "Sign In" },
  signUp: { id: "Daftar", en: "Sign Up" },
  allProducts: { id: "Semua Produk", en: "All Products" },
  popularProducts: { id: "Produk Populer", en: "Popular Products" },
  noResults: { id: "Tidak ada hasil", en: "No results" },
  reviews: { id: "Ulasan", en: "Reviews" },
  writeReview: { id: "Tulis Ulasan", en: "Write a Review" },
  payWithQris: { id: "Bayar dengan QRIS", en: "Pay with QRIS" },
  waitingPayment: { id: "Menunggu Pembayaran", en: "Waiting for Payment" },
  paymentSuccess: { id: "Pembayaran Berhasil", en: "Payment Successful" },
  paymentFailed: { id: "Pembayaran Gagal", en: "Payment Failed" },
  tryAgain: { id: "Coba Lagi", en: "Try Again" },
  chatAi: { id: "Chat AI", en: "AI Chat" },
  chatOwner: { id: "Chat Owner", en: "Chat Owner" },
  sendMessage: { id: "Ketik pesan...", en: "Type a message..." },
  emptyCart: { id: "Keranjang kosong", en: "Your cart is empty" },
  loginRequired: { id: "Silakan masuk untuk melanjutkan", en: "Please sign in to continue" },
};

export function t(key: keyof typeof translations, lang: LanguageType): string {
  return translations[key]?.[lang] ?? String(key);
}

export function useT() {
  const lang = useAppStore((s) => s.language);
  return (key: keyof typeof translations) => t(key, lang);
}
