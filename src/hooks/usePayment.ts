import { useState, useEffect } from 'react';
import { PakasirPayment, type PaymentResponse, type PaymentMethod } from '@/lib/pakasir';
import { OrderService } from '@/lib/supabase';
import { TelegramBot } from '@/lib/telegram';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';

export const usePayment = () => {
  const { profile, getSelectedItems, clearCart } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired' | 'cancelled' | null>(null);
  const [countdown, setCountdown] = useState(1800); // 30 minutes in seconds
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('qris');

  // Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (paymentData && !paymentStatus) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentData, paymentStatus]);

  const createPayment = async (): Promise<PaymentResponse> => {
    setIsProcessing(true);
    ultraAudio.playPaymentProcessing();
    
    try {
      const selectedItems = getSelectedItems();
      if (selectedItems.length === 0) {
        throw new Error('No items selected');
      }

      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const request = {
        orderId,
        amount: subtotal,
        customerName: profile?.name || 'Guest',
        customerEmail: profile?.email || '',
        description: `Pembelian ${selectedItems.length} layanan di Digital Store`,
      };

      const response = await PakasirPayment.createPayment(request, selectedMethod);
      setPaymentData(response);
      setCountdown(1800); // Reset countdown
      
      // Create order in database
      try {
        const order = await OrderService.create({
          user_id: profile?.id || 'guest',
          items: selectedItems.map(item => ({
            product_id: item.productId,
            title: item.title,
            tier: item.tier,
            price: item.price,
            quantity: item.quantity,
          })),
          total_amount: subtotal,
          status: 'pending',
          payment_method: selectedMethod.toUpperCase(),
          payment_reference: response.order_id,
        });

        // Send notification to Telegram
        await TelegramBot.sendOrderNotification({
          orderId: order.id,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          totalAmount: subtotal,
          items: selectedItems.map(item => ({
            title: item.title,
            tier: item.tier,
            quantity: item.quantity,
            price: item.price,
          })),
          timestamp: new Date().toLocaleString('id-ID'),
        });
      } catch (error) {
        console.error('Error creating order or sending notifications:', error);
        // Continue even if order creation fails
      }

      return response;
    } catch (error: any) {
      console.error('Payment creation error:', error);
      ultraAudio.playError();
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (orderId: string, amount: number): Promise<void> => {
    try {
      const status = await PakasirPayment.checkStatus(orderId, amount);
      setPaymentStatus(status.status as any);
      
      if (status.status === 'completed') {
        ultraAudio.playPaymentSuccess();
        // Clear cart on successful payment
        clearCart();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const cancelPayment = async (orderId: string, amount: number): Promise<boolean> => {
    try {
      const result = await PakasirPayment.cancelPayment(orderId, amount);
      if (result) {
        setPaymentData(null);
        setPaymentStatus(null);
        setCountdown(1800);
        ultraAudio.playClose();
      }
      return result;
    } catch (error: any) {
      console.error('Cancel payment error:', error);
      return false;
    }
  };

  const simulatePayment = async (orderId: string, amount: number): Promise<boolean> => {
    try {
      const result = await PakasirPayment.simulatePayment(orderId, amount);
      if (result) {
        setPaymentStatus('paid');
        ultraAudio.playPaymentSuccess();
        clearCart();
      }
      return result;
    } catch (error) {
      console.error('Simulation error:', error);
      return false;
    }
  };

  const formatCountdown = (): string => {
    return PakasirPayment.formatExpiryTime(countdown);
  };

  const openPaymentPage = () => {
    if (paymentData) {
      const url = PakasirPayment.createPaymentURL(
        { 
          orderId: paymentData.order_id, 
          amount: paymentData.amount 
        },
        { 
          method: selectedMethod,
          qrisOnly: selectedMethod === 'qris',
          redirect: window.location.origin + '/profile'
        }
      );
      window.open(url, '_blank');
    }
  };

  return {
    isProcessing,
    paymentData,
    paymentStatus,
    countdown,
    selectedMethod,
    setSelectedMethod,
    formatCountdown,
    createPayment,
    checkPaymentStatus,
    cancelPayment,
    simulatePayment,
    openPaymentPage,
    formatRupiah: PakasirPayment.formatRupiah,
    getPaymentMethods: PakasirPayment.getPaymentMethods,
  };
};
