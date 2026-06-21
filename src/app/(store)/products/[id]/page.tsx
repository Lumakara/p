import { notFound } from "next/navigation";
import { getProduct } from "@/db/queries";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const { reviews: _omit, ...productData } = product;
  void _omit;

  return <ProductDetailClient product={productData as Product} />;
}
