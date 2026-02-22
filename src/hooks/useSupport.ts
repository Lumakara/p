import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import type { SupportTicket, TicketCategory } from '@/types';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export interface TicketFormData {
  subject: string;
  category: TicketCategory;
  email: string;
  description: string;
}

export const useSupport = () => {
  const { tickets, addTicket } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTelegramNotification = async (ticket: SupportTicket) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram credentials not configured');
      return;
    }

    const message = `
🎫 *Tiket Baru*

📌 *Subjek:* ${ticket.subject}
📂 *Kategori:* ${ticket.category}
📧 *Email:* ${ticket.email}
📝 *Deskripsi:*
${ticket.description}
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram notification');
      }
    } catch (err) {
      console.error('Error sending Telegram notification:', err);
    }
  };

  const submitTicket = useCallback(async (formData: TicketFormData): Promise<SupportTicket> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const ticket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        subject: formData.subject,
        category: formData.category,
        email: formData.email,
        description: formData.description,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to store
      addTicket(ticket);

      // Send Telegram notification
      await sendTelegramNotification(ticket);

      return ticket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit ticket';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [addTicket]);

  const getTicketById = useCallback((id: string): SupportTicket | undefined => {
    return tickets.find((t) => t.id === id);
  }, [tickets]);

  const getTicketsByEmail = useCallback((email: string): SupportTicket[] => {
    return tickets.filter((t) => t.email.toLowerCase() === email.toLowerCase());
  }, [tickets]);

  return {
    tickets,
    isSubmitting,
    error,
    submitTicket,
    getTicketById,
    getTicketsByEmail,
  };
};
