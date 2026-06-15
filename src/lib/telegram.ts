/**
 * Telegram Bot integration (server-side only).
 * Used as:
 *   1) The owner notification center (new orders, paid, expired, support).
 *   2) A real-time chat bridge between users and the owner.
 *
 * Owner replies in Telegram using the format:  U-<userId> : <reply text>
 * or by replying directly to the forwarded message.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const API = (method: string) => `https://api.telegram.org/bot${TOKEN}/${method}`;

export function isTelegramConfigured(): boolean {
  return Boolean(TOKEN && CHAT_ID);
}

export async function sendTelegramMessage(
  text: string,
  chatId: string = CHAT_ID,
): Promise<boolean> {
  if (!TOKEN || !chatId) {
    console.warn("[telegram] not configured; skipping message");
    return false;
  }
  try {
    const res = await fetch(API("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.error("[telegram] sendMessage failed:", err);
    return false;
  }
}

function rupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

function nowWIB(): string {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function notifyNewOrder(o: {
  orderId: string;
  productName: string;
  amount: number;
  totalAmount?: number;
  customer: string;
  expiredAt?: string;
}): Promise<void> {
  const expired = o.expiredAt
    ? new Date(o.expiredAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
  const text =
    `🟡 <b>TRANSAKSI BARU</b>\n\n` +
    `Order   : <code>${o.orderId}</code>\n` +
    `Produk  : ${o.productName}\n` +
    `Total   : ${rupiah(o.totalAmount ?? o.amount)}\n` +
    `User    : ${o.customer}\n` +
    `Waktu   : ${nowWIB()} WIB\n` +
    `Expired : ${expired}\n\n` +
    `Status  : ⏳ MENUNGGU PEMBAYARAN`;
  await sendTelegramMessage(text);
}

export async function notifyPaidOrder(o: {
  orderId: string;
  productName: string;
  amount: number;
  customer: string;
}): Promise<void> {
  const text =
    `🟢 <b>PEMBAYARAN BERHASIL</b>\n\n` +
    `Order   : <code>${o.orderId}</code>\n` +
    `Produk  : ${o.productName}\n` +
    `Total   : ${rupiah(o.amount)}\n` +
    `User    : ${o.customer}\n` +
    `Dibayar : ${nowWIB()} WIB\n\n` +
    `Status  : ✅ LUNAS`;
  await sendTelegramMessage(text);
}

export async function notifyFailedOrder(o: {
  orderId: string;
  productName: string;
  amount: number;
  customer: string;
  reason?: string;
}): Promise<void> {
  const text =
    `🔴 <b>TRANSAKSI EXPIRED/GAGAL</b>\n\n` +
    `Order   : <code>${o.orderId}</code>\n` +
    `Produk  : ${o.productName}\n` +
    `Total   : ${rupiah(o.amount)}\n` +
    `User    : ${o.customer}\n\n` +
    `Status  : ❌ EXPIRED\n` +
    `Alasan  : ${o.reason || "Waktu pembayaran habis"}`;
  await sendTelegramMessage(text);
}

export async function notifySupportTicket(t: {
  subject: string;
  category: string;
  email: string;
  description: string;
}): Promise<void> {
  const text =
    `🎫 <b>TIKET SUPPORT BARU</b>\n\n` +
    `Subjek   : ${t.subject}\n` +
    `Kategori : ${t.category}\n` +
    `Email    : ${t.email}\n` +
    `Pesan    :\n${t.description}`;
  await sendTelegramMessage(text);
}

/** Forward a user chat message to the owner with reply instructions. */
export async function forwardUserChat(o: {
  userId: string;
  message: string;
}): Promise<boolean> {
  const text =
    `📩 <b>PESAN BARU DARI USER</b>\n\n` +
    `ID User : <code>U-${o.userId}</code>\n` +
    `Waktu   : ${nowWIB()} WIB\n` +
    `Pesan   : "${o.message}"\n\n` +
    `Balas dengan format:\n<code>U-${o.userId} : [isi balasan kamu]</code>`;
  return sendTelegramMessage(text);
}

interface TelegramUpdate {
  message?: {
    text?: string;
    reply_to_message?: { text?: string };
  };
}

/**
 * Parse an owner reply from a Telegram update.
 * Returns the target userId and the reply text, or null if not a chat reply.
 */
export function parseOwnerReply(
  update: TelegramUpdate,
): { userId: string; text: string } | null {
  const msg = update?.message;
  if (!msg || !msg.text) return null;

  const text: string = msg.text;

  // Format 1: "U-<id> : reply"
  const inline = text.match(/^U-([A-Za-z0-9_-]+)\s*:\s*([\s\S]+)$/);
  if (inline) {
    return { userId: inline[1], text: inline[2].trim() };
  }

  // Format 2: reply to a forwarded message that contains "U-<id>"
  const replied: string | undefined = msg.reply_to_message?.text;
  if (replied) {
    const found = replied.match(/U-([A-Za-z0-9_-]+)/);
    if (found) {
      return { userId: found[1], text: text.trim() };
    }
  }

  return null;
}
