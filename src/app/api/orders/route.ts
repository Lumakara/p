import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orders — current user's order history. */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
