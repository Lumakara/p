import { useState, useCallback } from 'react';
import { TicketService, type SupportTicket } from '@/lib/supabase';
import { TelegramBot } from '@/lib/telegram';

export interface TicketFormData {
  subject: string;
  category: string;
  email: string;
  description: string;
}

export const useSupport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const submitTicket = useCallback(async (formData: TicketFormData): Promise<SupportTicket> => {
    setIsSubmitting(true);
    try {
      // Create ticket in Supabase
      const ticket = await TicketService.create({
        subject: formData.subject,
        category: formData.category,
        email: formData.email,
        description: formData.description,
      });

      // Send notification to Telegram
      await TelegramBot.sendTicketNotification({
        ticketId: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        email: ticket.email,
        description: ticket.description,
        timestamp: new Date(ticket.created_at || '').toLocaleString('id-ID'),
      });

      return ticket;
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const fetchAllTickets = useCallback(async () => {
    try {
      const allTickets = await TicketService.getAll();
      setTickets(allTickets);
    } catch (error) {
      console.error('Error fetching all tickets:', error);
    }
  }, []);

  return {
    tickets,
    isSubmitting,
    submitTicket,
    fetchAllTickets,
  };
};
