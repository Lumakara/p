import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Order, SupportTicket } from '@/lib/supabase';

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

interface AppState {
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  getProductById: (id: string) => Product | undefined;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Reviews
  reviews: Review[];
  addReview: (review: Review) => void;
  getProductReviews: (productId: string) => Review[];
  likeReview: (reviewId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, tierName: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, change: number) => void;
  toggleItemSelection: (index: number) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  clearSelectedItems: () => void;
  getCartTotal: () => { subtotal: number; count: number };
  getSelectedItems: () => CartItem[];

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'info' } | null) => void;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  // Theme Settings
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Audio Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;

  // Language
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;

  // Support Tickets
  tickets: SupportTicket[];
  addTicket: (ticket: SupportTicket) => void;

  // App Loading & Promo
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;
  hasSeenPromo: boolean;
  setHasSeenPromo: (seen: boolean) => void;

  // Site News
  news: SiteNews[];
  addNews: (news: SiteNews) => void;

  // User Profile (Local - No Auth)
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultNews: SiteNews[] = [
  {
    id: '1',
    title: 'Selamat Datang di Digital Store',
    content: 'Terima kasih telah mengunjungi toko kami. Nikmati layanan digital terbaik dengan harga terjangkau.',
    date: new Date().toISOString(),
    type: 'info'
  },
  {
    id: '2',
    title: 'Promo Spesial 20%',
    content: 'Dapatkan diskon 20% untuk pembelian pertama Anda. Gunakan kode promo: FIRST20',
    date: new Date().toISOString(),
    type: 'promo'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Products
      products: [],
      setProducts: (products) => set({ products }),
      getProductById: (id) => get().products.find((p) => p.id === id),

      // Favorites
      favorites: [],
      toggleFavorite: (productId) => {
        const { favorites } = get();
        const isFav = favorites.includes(productId);
        set({
          favorites: isFav
            ? favorites.filter((id) => id !== productId)
            : [...favorites, productId],
        });
      },
      isFavorite: (productId) => get().favorites.includes(productId),

      // Reviews
      reviews: [],
      addReview: (review) => set({ reviews: [review, ...get().reviews] }),
      getProductReviews: (productId) =>
        get().reviews.filter((r) => r.productId === productId),
      likeReview: (reviewId) => {
        const { reviews } = get();
        set({
          reviews: reviews.map((r) =>
            r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
          ),
        });
      },

      // Cart
      cart: [],
      addToCart: (product, tierName) => {
        const tier = product.tiers.find((t) => t.name === tierName) || product.tiers[0];
        const { cart } = get();
        const existingIndex = cart.findIndex(
          (i) => i.productId === product.id && i.tier === tier.name
        );

        if (existingIndex >= 0) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += 1;
          set({ cart: newCart });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${tier.name}-${Date.now()}`,
            productId: product.id,
            title: product.title,
            tier: tier.name,
            price: tier.price,
            image: product.icon,
            quantity: 1,
            selected: true,
          };
          set({ cart: [...cart, newItem] });
        }
      },
      removeFromCart: (index) => {
        const { cart } = get();
        set({ cart: cart.filter((_, i) => i !== index) });
      },
      updateQuantity: (index, change) => {
        const { cart } = get();
        const newCart = [...cart];
        newCart[index].quantity += change;
        if (newCart[index].quantity < 1) {
          newCart.splice(index, 1);
        }
        set({ cart: newCart });
      },
      toggleItemSelection: (index) => {
        const { cart } = get();
        const newCart = [...cart];
        newCart[index].selected = !newCart[index].selected;
        set({ cart: newCart });
      },
      selectAllItems: (selected) => {
        const { cart } = get();
        set({ cart: cart.map((item) => ({ ...item, selected })) });
      },
      clearCart: () => set({ cart: [] }),
      clearSelectedItems: () => {
        const { cart } = get();
        set({ cart: cart.filter((item) => !item.selected) });
      },
      getCartTotal: () => {
        const { cart } = get();
        const selected = cart.filter((item) => item.selected);
        return {
          subtotal: selected.reduce((sum, item) => sum + item.price * item.quantity, 0),
          count: selected.reduce((sum, item) => sum + item.quantity, 0),
        };
      },
      getSelectedItems: () => {
        return get().cart.filter((item) => item.selected);
      },

      // Orders
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      getOrderById: (id) => get().orders.find((o) => o.id === id),
      updateOrderStatus: (orderId, status) => {
        const { orders } = get();
        set({
          orders: orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        });
      },

      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      notification: null,
      setNotification: (notification) => set({ notification }),

      // Recently Viewed
      recentlyViewed: [],
      addRecentlyViewed: (productId) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter((id) => id !== productId);
        set({ recentlyViewed: [productId, ...filtered].slice(0, 20) });
      },

      // Theme Settings
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Audio Settings
      soundEnabled: true,
      musicEnabled: false,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),

      // Language
      language: 'id',
      setLanguage: (lang) => set({ language: lang }),

      // Support Tickets
      tickets: [],
      addTicket: (ticket) => set({ tickets: [ticket, ...get().tickets] }),

      // App Loading & Promo
      isAppLoading: true,
      setIsAppLoading: (loading) => set({ isAppLoading: loading }),
      hasSeenPromo: false,
      setHasSeenPromo: (seen) => set({ hasSeenPromo: seen }),

      // Site News
      news: defaultNews,
      addNews: (news) => set({ news: [news, ...get().news] }),

      // User Profile (Local - No Auth)
      profile: {
        id: generateId(),
        name: 'Guest User',
        createdAt: new Date().toISOString(),
      },
      updateProfile: (updates) => {
        const { profile } = get();
        set({ profile: { ...profile, ...updates } });
      },
    }),
    {
      name: 'digital-store-v3',
      partialize: (state) => ({
        cart: state.cart,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        orders: state.orders,
        theme: state.theme,
        isDarkMode: state.isDarkMode,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        language: state.language,
        hasSeenPromo: state.hasSeenPromo,
        profile: state.profile,
        tickets: state.tickets,
        reviews: state.reviews,
      }),
    }
  )
);
