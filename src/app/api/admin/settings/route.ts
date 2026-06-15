import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";
import { getBalance } from "@/lib/payment";
import { isTelegramConfigured } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/settings — site settings + integration health. */
export async function GET() {
  return withAdmin(async () => {
    const setting = await prisma.setting.findUnique({ where: { key: "site" } });

    let paymentStatus: { ok: boolean; balance?: number; error?: string };
    try {
      const bal = await getBalance();
      paymentStatus = { ok: true, balance: bal.balance };
    } catch (e) {
      paymentStatus = {
        ok: false,
        error: e instanceof Error ? e.message : "error",
      };
    }

    return {
      settings: setting?.value ?? {
        name: "Digital Store",
        description: "",
        logo: "",
        themeColor: "#f97316",
        paymentExpiryMinutes: 15,
        telegramNotifications: true,
      },
      health: {
        payment: paymentStatus,
        telegram: { configured: isTelegramConfigured() },
      },
    };
  });
}

/** PUT /api/admin/settings — update site settings. */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const setting = await prisma.setting.upsert({
        where: { key: "site" },
        update: { value: body },
        create: { key: "site", value: body },
      });
      return { settings: setting.value };
    },
    { action: "settings.update" },
  );
}
