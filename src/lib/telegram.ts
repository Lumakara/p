import axios from 'axios';

// Telegram Bot Configuration
// Credentials must be provided via environment variables. Never hardcode secrets.
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const isTelegramConfigured = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

// Safely extract a useful detail from an unknown error (e.g. axios error)
function getErrorDetail(error: unknown): unknown {
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: unknown }; message?: string };
    return e.response?.data ?? e.message;
  }
  return error;
}

export interface TicketNotification {
  ticketId: string;
  subject: string;
  category: string;
  email: string;
  description: string;
  timestamp: string;
}

export interface OrderNotification {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: { title: string; tier: string; quantity: number; price: number }[];
  timestamp: string;
}

export const TelegramBot = {
  // Send support ticket notification to Telegram
  async sendTicketNotification(ticket: TicketNotification): Promise<void> {
    if (!isTelegramConfigured) {
      console.warn('Telegram credentials not configured, skipping notification');
      return;
    }
    try {
      const message = `
🎫 *TICKET BARU DITERIMA*

📋 *ID:* #${ticket.ticketId}
📌 *Subjek:* ${ticket.subject}
🏷️ *Kategori:* ${ticket.category}
📧 *Email:* ${ticket.email}
🕐 *Waktu:* ${ticket.timestamp}

📝 *Deskripsi:*
${ticket.description}

━━━━━━━━━━━━━━━━━━━━
Silakan segera ditindaklanjuti.
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Ticket notification sent to Telegram');
      }
    } catch (error) {
      console.error("Telegram Bot Error:", getErrorDetail(error));
      // Don't throw error, just log it
    }
  },

  // Send order notification to Telegram
  async sendOrderNotification(order: OrderNotification): Promise<void> {
    if (!isTelegramConfigured) {
      console.warn('Telegram credentials not configured, skipping notification');
      return;
    }
    try {
      const itemsList = order.items.map(item => 
        `• ${item.title} (${item.tier}) x${item.quantity} - Rp ${item.price.toLocaleString('id-ID')}`
      ).join('\n');

      const message = `
🛒 *PESANAN BARU MASUK*

📋 *ID Pesanan:* #${order.orderId}
👤 *Pelanggan:* ${order.customerName}
📧 *Email:* ${order.customerEmail}
💰 *Total:* Rp ${order.totalAmount.toLocaleString('id-ID')}
🕐 *Waktu:* ${order.timestamp}

📦 *Item Pesanan:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
Segera proses pesanan ini.
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Order notification sent to Telegram');
      }
    } catch (error) {
      console.error("Telegram Bot Error:", getErrorDetail(error));
    }
  },

  // Send payment notification to Telegram
  async sendPaymentNotification(orderId: string, amount: number, paymentMethod: string, status: string): Promise<void> {
    if (!isTelegramConfigured) {
      console.warn('Telegram credentials not configured, skipping notification');
      return;
    }
    try {
      const statusEmoji = status === 'success' ? '✅' : '❌';
      const message = `
${statusEmoji} *NOTIFIKASI PEMBAYARAN*

📋 *ID Pesanan:* #${orderId}
💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
💳 *Metode:* ${paymentMethod}
📊 *Status:* ${status.toUpperCase()}
🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}

━━━━━━━━━━━━━━━━━━━━
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Payment notification sent to Telegram');
      }
    } catch (error) {
      console.error("Telegram Bot Error:", getErrorDetail(error));
    }
  },

  // Send custom message to Telegram
  async sendCustomMessage(message: string): Promise<void> {
    if (!isTelegramConfigured) {
      console.warn('Telegram credentials not configured, skipping notification');
      return;
    }
    try {
      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Custom message sent to Telegram');
      }
    } catch (error) {
      console.error("Telegram Bot Error:", getErrorDetail(error));
    }
  },

  // Test bot connection
  async testConnection(): Promise<boolean> {
    if (!isTelegramConfigured) {
      console.warn('Telegram credentials not configured');
      return false;
    }
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
      return response.data.ok;
    } catch {
      console.error('Telegram bot connection test failed');
      return false;
    }
  }
};
