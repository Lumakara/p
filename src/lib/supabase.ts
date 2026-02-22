// Re-export types from database.ts for backward compatibility
// This file exists to maintain compatibility with existing imports

export type {
  Product,
  ProductTier,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  TicketResponse,
  CartItem,
  Review,
  UserProfile,
  ThemeType,
  LanguageType,
  PromoSlide,
  SiteNews,
} from './database';

// Legacy exports for compatibility (will be removed in future)
export type Tier = import('@/types').ProductTier;

// Placeholder exports (no actual Supabase client)
export const db = null;
export const ProductService = {} as any;
export const OrderService = {} as any;
export const TicketService = {} as any;
