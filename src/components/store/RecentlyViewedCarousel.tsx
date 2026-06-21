"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { TrendingCarousel } from "@/components/store/TrendingCarousel";
import type { Product } from "@/types";

export function RecentlyViewedCarousel() {
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (recentlyViewed.length === 0) return;
    fetch(`/api/products?ids=${recentlyViewed.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products) {
          // preserve recently-viewed order
          const map = new Map<string, Product>(data.products.map((p: Product) => [p.id, p]));
          setProducts(recentlyViewed.map((id) => map.get(id)).filter(Boolean) as Product[]);
        }
      })
      .catch(() => {});
  }, [recentlyViewed]);

  if (products.length === 0) return null;

  return <TrendingCarousel products={products} title="Terakhir Dilihat" />;
}
