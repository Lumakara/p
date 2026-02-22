// Re-export types from types/index.ts
// This file exists for backward compatibility

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
} from '@/types';

// Database is now localStorage-only via Zustand store
// No Supabase client needed

export const initializeDatabase = async () => {
  // Initialize with mock data if empty
  const stored = localStorage.getItem('digital-store-products');
  if (!stored) {
    // Products will be loaded by useProducts hook
    console.log('Database initialized - products will be loaded from mock data');
  }
};
