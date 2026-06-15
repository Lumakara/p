import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/users — list users with order counts. */
export async function GET() {
  return withAdmin(async () => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        phone: u.phone,
        avatar: u.avatar,
        provider: u.provider,
        role: u.role,
        status: u.status,
        totalOrders: u._count.orders,
        createdAt: u.createdAt,
      })),
    };
  });
}
