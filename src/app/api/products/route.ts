import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/products?category=&q= — list active products. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = url.searchParams.get("q");
    const ids = url.searchParams.get("ids");

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(ids ? { id: { in: ids.split(",").filter(Boolean) } } : {}),
        ...(category && category !== "all" ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[products]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
