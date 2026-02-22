export interface ProductTier {
  name: string;
  price: number;
  features: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  icon: string;
  // Legacy fields for compatibility
  image?: string;
  images?: string[];
  base_price?: number;
  discount_price?: number;
  stock?: number;
  tags?: string[];
  duration?: string;
  created_at?: string;
  // New fields
  category: string;
  rating: number;
  reviews: number;
  tiers: ProductTier[];
  features: string[];
  badge?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'paid';

// Payment methods aligned with Pakasir
export type PaymentMethod = 
  | 'qris' 
  | 'bni_va' 
  | 'bri_va' 
  | 'bca_va' 
  | 'mandiri_va' 
  | 'permata_va'
  | 'cimb_niaga_va'
  | 'maybank_va'
  | 'bnc_va'
  | 'sampoerna_va'
  | 'atm_bersama_va'
  | 'artha_graha_va'
  | 'paypal' 
  | 'ovo' 
  | 'gopay' 
  | 'dana' 
  | 'linkaja' 
  | 'shopeepay';

export interface OrderItem {
  productId: string;
  title: string;
  tier: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  // Legacy fields
  total_amount?: number;
  created_at?: string;
  // New fields
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  createdAt: string;
  paidAt?: string;
  qrCode?: string;
  qrString?: string;
  vaNumber?: string;
  paymentUrl?: string;
  notes?: string;
}

export type TicketCategory = 'technical' | 'billing' | 'general';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  email: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  // Legacy field
  created_at?: string;
  userId?: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  senderName: string;
}

export type ThemeType = 'default' | 'ocean' | 'sunset' | 'forest';
export type LanguageType = 'id' | 'en';

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

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface PromoSlide {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface SiteNews {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'update' | 'promo' | 'info';
}
