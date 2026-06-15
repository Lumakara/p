"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/appStore";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const isFavorite = useAppStore((s) => s.isFavorite);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const fav = isFavorite(product.id);

  const price =
    product.tiers?.[0]?.price ?? product.discountPrice ?? product.basePrice;

  return (
    <Card className="overflow-hidden card-hover relative group">
      <button
        aria-label="favorite"
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product.id);
        }}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
      >
        <Heart className={cn("h-4 w-4", fav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
      </button>
      <Link href={`/products/${product.id}`}>
        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.icon}
            alt={product.title}
            className="h-20 w-20 object-contain transition-transform group-hover:scale-110"
          />
        </div>
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {product.category}
            </Badge>
            {product.badge && (
              <Badge className="text-[10px] bg-primary">{product.badge}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-primary text-sm">{rupiah(price)}</span>
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)} ({product.reviewsCount})
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
