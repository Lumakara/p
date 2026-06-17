import { prisma } from "@/db/client";
import type { Product } from "@/types";

/** Server-side product fetch. Returns [] if the DB is unavailable. */
export async function getProducts(opts?: {
  category?: string;
  q?: string;
}): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(opts?.category && opts.category !== "all"
          ? { category: opts.category }
          : {}),
        ...(opts?.q
          ? {
              OR: [
                { title: { contains: opts.q, mode: "insensitive" } },
                { description: { contains: opts.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return products as unknown as Product[];
  } catch (err) {
    console.error("[data] getProducts failed:", err);
    return [];
  }
}

export async function getProduct(
  id: string,
): Promise<(Product & { reviews?: unknown[] }) | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    return product as unknown as Product & { reviews?: unknown[] };
  } catch (err) {
    console.error("[data] getProduct failed:", err);
    return null;
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    });
    return rows.map((r) => r.category);
  } catch (err) {
    console.error("[data] getCategories failed:", err);
    return [];
  }
}
