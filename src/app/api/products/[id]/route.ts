import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/products/[id] — product detail + reviews. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
