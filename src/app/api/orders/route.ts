import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/auth";
import { prisma } from "@/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orders — current user's order history. */
export async function GET() {
  try {
    const userId = await getSessionId();
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[orders]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
