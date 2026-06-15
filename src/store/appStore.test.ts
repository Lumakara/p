import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./appStore";
import type { Product } from "@/types";

const mockProduct: Product = {
  id: "prod-1",
  title: "Test Product",
  description: "A test product",
  icon: "/icon.png",
  category: "digital",
  basePrice: 50000,
  discountPrice: 40000,
  rating: 4.5,
  reviewsCount: 10,
  features: ["Feature A"],
  tiers: [
    { name: "Basic", price: 30000, features: ["Basic feature"] },
    { name: "Pro", price: 60000, features: ["Pro feature"] },
  ],
};

const mockProductNoTiers: Product = {
  id: "prod-2",
  title: "No Tiers Product",
  description: "Product with no tiers",
  icon: "/icon2.png",
  category: "digital",
  basePrice: 25000,
  discountPrice: null,
  rating: 3.0,
  reviewsCount: 2,
  features: [],
  tiers: [],
};

function resetStore() {
  useAppStore.setState({
    cart: [],
    favorites: [],
    themeColor: "default",
    soundEnabled: true,
    musicEnabled: false,
    language: "id",
    chatUserId: null,
  });
}

describe("appStore - cart", () => {
  beforeEach(resetStore);

  it("starts with empty cart", () => {
    expect(useAppStore.getState().cart).toEqual([]);
  });

  it("adds a product with a specific tier", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    const { cart } = useAppStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe("prod-1");
    expect(cart[0].tier).toBe("Basic");
    expect(cart[0].price).toBe(30000);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].selected).toBe(true);
  });

  it("increments quantity when adding the same product + tier", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Basic");
    const { cart } = useAppStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("adds a separate item for a different tier", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    expect(useAppStore.getState().cart).toHaveLength(2);
  });

  it("falls back to the first tier if tierName is not found", () => {
    useAppStore.getState().addToCart(mockProduct, "NonExistent");
    const { cart } = useAppStore.getState();
    expect(cart[0].tier).toBe("Basic");
    expect(cart[0].price).toBe(30000);
  });

  it("uses discountPrice as fallback when product has no tiers", () => {
    useAppStore.getState().addToCart(mockProductNoTiers);
    const { cart } = useAppStore.getState();
    expect(cart[0].tier).toBe("Standard");
    expect(cart[0].price).toBe(25000);
  });

  it("removes an item by index", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().removeFromCart(0);
    const { cart } = useAppStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].tier).toBe("Pro");
  });

  it("updates quantity by change amount", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().updateQuantity(0, 2);
    expect(useAppStore.getState().cart[0].quantity).toBe(3);
  });

  it("removes item if quantity drops below 1", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().updateQuantity(0, -1);
    expect(useAppStore.getState().cart).toHaveLength(0);
  });

  it("toggles item selection", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    expect(useAppStore.getState().cart[0].selected).toBe(true);
    useAppStore.getState().toggleItemSelection(0);
    expect(useAppStore.getState().cart[0].selected).toBe(false);
    useAppStore.getState().toggleItemSelection(0);
    expect(useAppStore.getState().cart[0].selected).toBe(true);
  });

  it("selects/deselects all items", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().selectAllItems(false);
    expect(useAppStore.getState().cart.every((i) => !i.selected)).toBe(true);
    useAppStore.getState().selectAllItems(true);
    expect(useAppStore.getState().cart.every((i) => i.selected)).toBe(true);
  });

  it("clears the entire cart", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().clearCart();
    expect(useAppStore.getState().cart).toHaveLength(0);
  });

  it("clears only selected items", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().toggleItemSelection(0);
    useAppStore.getState().clearSelectedItems();
    const { cart } = useAppStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].tier).toBe("Basic");
  });

  it("computes cart total from selected items", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    const { subtotal, count } = useAppStore.getState().getCartTotal();
    expect(subtotal).toBe(30000 + 60000);
    expect(count).toBe(2);
  });

  it("excludes deselected items from total", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().toggleItemSelection(1);
    const { subtotal, count } = useAppStore.getState().getCartTotal();
    expect(subtotal).toBe(30000);
    expect(count).toBe(1);
  });

  it("returns selected items", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().toggleItemSelection(1);
    const selected = useAppStore.getState().getSelectedItems();
    expect(selected).toHaveLength(1);
    expect(selected[0].tier).toBe("Basic");
  });

  it("returns total cart count across all items", () => {
    useAppStore.getState().addToCart(mockProduct, "Basic");
    useAppStore.getState().addToCart(mockProduct, "Pro");
    useAppStore.getState().updateQuantity(0, 2);
    expect(useAppStore.getState().cartCount()).toBe(4);
  });
});

describe("appStore - favorites", () => {
  beforeEach(resetStore);

  it("starts with empty favorites", () => {
    expect(useAppStore.getState().favorites).toEqual([]);
  });

  it("adds a favorite", () => {
    useAppStore.getState().toggleFavorite("prod-1");
    expect(useAppStore.getState().favorites).toContain("prod-1");
    expect(useAppStore.getState().isFavorite("prod-1")).toBe(true);
  });

  it("removes a favorite on second toggle", () => {
    useAppStore.getState().toggleFavorite("prod-1");
    useAppStore.getState().toggleFavorite("prod-1");
    expect(useAppStore.getState().favorites).not.toContain("prod-1");
    expect(useAppStore.getState().isFavorite("prod-1")).toBe(false);
  });
});

describe("appStore - theme & preferences", () => {
  beforeEach(resetStore);

  it("defaults to default theme", () => {
    expect(useAppStore.getState().themeColor).toBe("default");
  });

  it("sets theme color", () => {
    useAppStore.getState().setThemeColor("ocean");
    expect(useAppStore.getState().themeColor).toBe("ocean");
  });

  it("toggles sound", () => {
    expect(useAppStore.getState().soundEnabled).toBe(true);
    useAppStore.getState().toggleSound();
    expect(useAppStore.getState().soundEnabled).toBe(false);
  });

  it("toggles music", () => {
    expect(useAppStore.getState().musicEnabled).toBe(false);
    useAppStore.getState().toggleMusic();
    expect(useAppStore.getState().musicEnabled).toBe(true);
  });
});

describe("appStore - language", () => {
  beforeEach(resetStore);

  it("defaults to id", () => {
    expect(useAppStore.getState().language).toBe("id");
  });

  it("sets language to en", () => {
    useAppStore.getState().setLanguage("en");
    expect(useAppStore.getState().language).toBe("en");
  });
});

describe("appStore - chatUserId", () => {
  beforeEach(resetStore);

  it("starts with null chatUserId", () => {
    expect(useAppStore.getState().chatUserId).toBeNull();
  });

  it("generates a chatUserId on first call", () => {
    const id = useAppStore.getState().ensureChatUserId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns the same chatUserId on subsequent calls", () => {
    const id1 = useAppStore.getState().ensureChatUserId();
    const id2 = useAppStore.getState().ensureChatUserId();
    expect(id1).toBe(id2);
  });
});
