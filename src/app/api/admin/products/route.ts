import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/products — list ALL products (incl. inactive). */
export async function GET() {
  return withAdmin(async () => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { products };
  });
}

/** POST /api/admin/products — create a product. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const product = await prisma.product.create({
        data: {
          title: body.title,
          description: body.description ?? "",
          fullDescription: body.fullDescription ?? null,
          icon: body.icon || "/images/products/default.svg",
          images: body.images ?? [],
          category: body.category || "general",
          basePrice: Number(body.basePrice) || 0,
          discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
          stock:
            body.stock === "" || body.stock === undefined || body.stock === null
              ? null
              : Number(body.stock),
          badge: body.badge ?? null,
          features: body.features ?? [],
          tiers:
            body.tiers && body.tiers.length
              ? body.tiers
              : [{ name: "Standard", price: Number(body.basePrice) || 0, features: [] }],
          active: body.active ?? true,
        },
      });
      return { product };
    },
    { action: "product.create", target: body.title },
  );
}
