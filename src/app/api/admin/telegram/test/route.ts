import { withAdmin } from "@/lib/api-middleware";
import { sendTelegramMessage, isTelegramConfigured } from "@/integrations/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/telegram/test — send a test notification to the owner. */
export async function POST() {
  return withAdmin(
    async () => {
      if (!isTelegramConfigured()) {
        return { ok: false, error: "Telegram belum dikonfigurasi" };
      }
      const ok = await sendTelegramMessage(
        "🔔 <b>Test Notifikasi</b>\nKoneksi Telegram Bot berhasil. Pusat notifikasi owner aktif.",
      );
      return { ok };
    },
    { action: "telegram.test" },
  );
}
