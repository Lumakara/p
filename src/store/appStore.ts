import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductTier, CartItem, ThemeColor, LanguageType } from "@/types";

interface AppState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, tierName?: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, change: number) => void;
  toggleItemSelection: (index: number) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  clearSelectedItems: () => void;
  getCartTotal: () => { subtotal: number; count: number };
  getSelectedItems: () => CartItem[];
  cartCount: () => number;

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Theme color scheme (dark/light handled by next-themes)
  themeColor: ThemeColor;
  setThemeColor: (t: ThemeColor) => void;

  // Audio
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;

  // Language
  language: LanguageType;
  setLanguage: (l: LanguageType) => void;

  // Anonymous chat user id (for owner/AI chat persistence)
  chatUserId: string | null;
  ensureChatUserId: () => string;
}

function uid() {
  return (
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  ).slice(0, 20);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product, tierName) => {
        const tiers = (product.tiers as ProductTier[]) || [];
        const tier =
          tiers.find((t) => t.name === tierName) ||
          tiers[0] || { name: "Standard", price: product.discountPrice ?? product.basePrice, features: [] };
        const { cart } = get();
        const idx = cart.findIndex(
          (i) => i.productId === product.id && i.tier === tier.name,
        );
        if (idx >= 0) {
          const next = [...cart];
          next[idx].quantity += 1;
          set({ cart: next });
        } else {
          set({
            cart: [
              ...cart,
              {
                id: `${product.id}-${tier.name}-${Date.now()}`,
                productId: product.id,
                title: product.title,
                tier: tier.name,
                price: tier.price,
                image: product.icon,
                quantity: 1,
                selected: true,
              },
            ],
          });
        }
      },
      removeFromCart: (index) =>
        set({ cart: get().cart.filter((_, i) => i !== index) }),
      updateQuantity: (index, change) => {
        const next = [...get().cart];
        next[index].quantity += change;
        if (next[index].quantity < 1) next.splice(index, 1);
        set({ cart: next });
      },
      toggleItemSelection: (index) => {
        const next = [...get().cart];
        next[index].selected = !next[index].selected;
        set({ cart: next });
      },
      selectAllItems: (selected) =>
        set({ cart: get().cart.map((i) => ({ ...i, selected })) }),
      clearCart: () => set({ cart: [] }),
      clearSelectedItems: () =>
        set({ cart: get().cart.filter((i) => !i.selected) }),
      getCartTotal: () => {
        const selected = get().cart.filter((i) => i.selected);
        return {
          subtotal: selected.reduce((s, i) => s + i.price * i.quantity, 0),
          count: selected.reduce((s, i) => s + i.quantity, 0),
        };
      },
      getSelectedItems: () => get().cart.filter((i) => i.selected),
      cartCount: () => get().cart.reduce((s, i) => s + i.quantity, 0),

      favorites: [],
      toggleFavorite: (id) => {
        const { favorites } = get();
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((f) => f !== id)
            : [...favorites, id],
        });
      },
      isFavorite: (id) => get().favorites.includes(id),

      themeColor: "default",
      setThemeColor: (t) => set({ themeColor: t }),

      soundEnabled: true,
      musicEnabled: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      language: "id",
      setLanguage: (l) => set({ language: l }),

      chatUserId: null,
      ensureChatUserId: () => {
        let id = get().chatUserId;
        if (!id) {
          id = uid();
          set({ chatUserId: id });
        }
        return id;
      },
    }),
    {
      name: "digital-store-v4",
      partialize: (s) => ({
        cart: s.cart,
        favorites: s.favorites,
        themeColor: s.themeColor,
        soundEnabled: s.soundEnabled,
        musicEnabled: s.musicEnabled,
        language: s.language,
        chatUserId: s.chatUserId,
      }),
    },
  ),
);
