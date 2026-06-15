export interface ProductTier {
  name: string;
  price: number;
  features: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  fullDescription?: string | null;
  icon: string;
  images?: string[];
  category: string;
  basePrice: number;
  discountPrice?: number | null;
  stock?: number | null;
  rating: number;
  reviewsCount: number;
  badge?: string | null;
  features: string[];
  tiers: ProductTier[];
  active?: boolean;
  createdAt?: string;
}

export type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";

export interface Order {
  id: string;
  userId?: string | null;
  productId?: string | null;
  productName: string;
  tier?: string | null;
  amount: number;
  status: OrderStatus;
  transactionId?: string | null;
  qrImage?: string | null;
  qrString?: string | null;
  uniqueCode?: number | null;
  totalAmount?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  productKey?: string | null;
  paidAt?: string | null;
  expiredAt?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  comment: string;
  likes?: number;
  createdAt: string;
}

export type ThemeColor = "default" | "ocean" | "sunset" | "forest";
export type LanguageType = "id" | "en";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  tier: string;
  price: number;
  image: string;
  quantity: number;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "owner";
  message: string;
  source?: string | null;
  timestamp: string;
}
