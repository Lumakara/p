import Link from "next/link";
import { getProducts, getCategories } from "@/db/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ q, category }),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Semua Produk</h1>
        {q && (
          <p className="text-sm text-muted-foreground">
            Hasil pencarian untuk &quot;{q}&quot;
          </p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Link
          href="/products"
          className={cn(
            "px-3 py-1.5 rounded-full text-sm whitespace-nowrap border",
            !category ? "bg-primary text-primary-foreground border-primary" : "border-border",
          )}
        >
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/products?category=${encodeURIComponent(c)}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap border capitalize",
              category === c
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Tidak ada produk ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
