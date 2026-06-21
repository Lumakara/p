"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useAppStore } from "@/store/appStore";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";

function ProductSlideCard({ product }: { product: Product }) {
  const router = useRouter();
  const isFavorite = useAppStore((s) => s.isFavorite);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addToCart = useAppStore((s) => s.addToCart);
  const fav = isFavorite(product.id);
  const price = product.tiers?.[0]?.price ?? product.discountPrice ?? product.basePrice;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-full group">
      <Link href={`/products/${product.id}`} className="relative block">
        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.icon}
            alt={product.title}
            className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        {product.badge && (
          <Badge className="absolute top-2 left-2 text-[10px] bg-primary">{product.badge}</Badge>
        )}
        <button
          aria-label="favorite"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
        >
          <Heart className={cn("h-3.5 w-3.5", fav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </button>
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <Badge variant="secondary" className="text-[9px] mb-1">{product.category}</Badge>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="font-bold text-primary text-sm mt-1">{rupiah(price)}</p>
        </div>

        <div className="flex gap-1 mt-auto">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg flex-shrink-0"
            onClick={() => {
              addToCart(product);
              toast.success("Ditambahkan ke keranjang");
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 rounded-lg text-xs font-semibold"
            onClick={() => router.push(`/products/${product.id}`)}
            disabled={product.stock === 0}
          >
            <Zap className="h-3 w-3 mr-1" />
            {product.stock === 0 ? "Habis" : "Beli"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  products: Product[];
  title?: string;
}

export function TrendingCarousel({ products, title = "Produk Trending" }: Props) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link href="/products" className="text-sm text-primary font-medium">
          Lihat semua
        </Link>
      </div>
      <Carousel
        opts={{ align: "start", slidesToScroll: 1 }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {products.map((p) => (
            <CarouselItem key={p.id} className="pl-3 basis-1/2 sm:basis-1/3 lg:basis-1/4">
              <ProductSlideCard product={p} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 hidden sm:flex" />
        <CarouselNext className="-right-3 hidden sm:flex" />
      </Carousel>
    </section>
  );
}
