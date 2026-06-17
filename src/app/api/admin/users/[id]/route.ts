import { NextRequest } from "next/server";
import { prisma } from "@/db/client";
import { withAdmin } from "@/lib/api-middleware";
import type { UserStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/users/[id] — detail + order history. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withAdmin(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    return { user };
  });
}

/** PATCH /api/admin/users/[id] — block / activate. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const status = body.status as UserStatus;
      const user = await prisma.user.update({
        where: { id },
        data: { status },
      });
      return { user };
    },
    { action: "user.status", target: id },
  );
}
