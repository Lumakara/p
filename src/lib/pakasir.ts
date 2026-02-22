import axios from 'axios';

// Pakasir Payment Gateway Integration
// Docs: https://pakasir.com/p/docs

const PAKASIR_API_URL = 'https://app.pakasir.com/api';
const PAKASIR_PROJECT_SLUG = import.meta.env.VITE_PAKASIR_SLUG || 'your-project-slug';
const PAKASIR_API_KEY = import.meta.env.VITE_PAKASIR_API_KEY || '';

// Re-export PaymentMethod from types for consistency
import type { PaymentMethod } from '@/types';
export type { PaymentMethod };

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  method?: PaymentMethod;
}

export interface PaymentResponse {
  success: boolean;
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number: string;
  expired_at: string;
  qr_string?: string;
  qr_code_url?: string;
  va_number?: string;
  payment_url?: string;
}

export interface PaymentStatus {
  project: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'completed';
  payment_method?: string;
  paid_at?: string;
  completed_at?: string;
}

export interface WebhookData {
  amount: number;
  order_id: string;
  project: string;
  status: 'completed' | 'pending' | 'cancelled';
  payment_method: string;
  completed_at?: string;
}

export const PakasirPayment = {
  // Create payment via API
  async createPayment(
    request: PaymentRequest,
    method: PaymentMethod = 'qris'
  ): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/transactioncreate/${method}`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: request.orderId,
          amount: Math.round(request.amount),
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      
      return {
        success: true,
        project: data.payment.project,
        order_id: data.payment.order_id,
        amount: data.payment.amount,
        fee: data.payment.fee,
        total_payment: data.payment.total_payment,
        payment_method: data.payment.payment_method,
        payment_number: data.payment.payment_number,
        expired_at: data.payment.expired_at,
        qr_string: data.payment.payment_number,
        qr_code_url: data.payment.payment_number 
          ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.payment.payment_number)}`
          : undefined,
      };
    } catch (error: any) {
      console.error('Pakasir Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  },

  // Create payment via URL redirect
  createPaymentURL(request: PaymentRequest, options?: { 
    qrisOnly?: boolean; 
    redirect?: string;
    method?: PaymentMethod;
  }): string {
    const amount = Math.round(request.amount);
    let url = `https://app.pakasir.com/${options?.method === 'paypal' ? 'paypal' : 'pay'}/${PAKASIR_PROJECT_SLUG}/${amount}?order_id=${encodeURIComponent(request.orderId)}`;
    
    if (options?.qrisOnly) {
      url += '&qris_only=1';
    }
    
    if (options?.redirect) {
      url += `&redirect=${encodeURIComponent(options.redirect)}`;
    }
    
    return url;
  },

  // Check payment status
  async checkStatus(orderId: string, amount: number): Promise<PaymentStatus> {
    try {
      const response = await axios.get(
        `${PAKASIR_API_URL}/transactiondetail`,
        {
          params: {
            project: PAKASIR_PROJECT_SLUG,
            order_id: orderId,
            amount: Math.round(amount),
            api_key: PAKASIR_API_KEY,
          },
          timeout: 10000,
        }
      );

      return response.data.transaction;
    } catch (error: any) {
      console.error('Check status error:', error.response?.data || error.message);
      throw new Error('Failed to check payment status');
    }
  },

  // Cancel payment
  async cancelPayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/transactioncancel`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: orderId,
          amount: Math.round(amount),
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data.success || true;
    } catch (error: any) {
      console.error('Cancel payment error:', error.response?.data || error.message);
      return false;
    }
  },

  // Simulate payment (sandbox only)
  async simulatePayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/paymentsimulation`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: orderId,
          amount: Math.round(amount),
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data.success || true;
    } catch (error: any) {
      console.error('Simulation error:', error.response?.data || error.message);
      return false;
    }
  },

  // Format amount to Rupiah
  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Calculate expiry time remaining
  getExpiryTimeRemaining(expiryTime: string): number {
    const expiry = new Date(expiryTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  },

  // Format seconds to MM:SS
  formatExpiryTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Generate QR code URL
  generateQRCodeURL(qrString: string, size: number = 300): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrString)}`;
  },

  // Handle webhook
  verifyWebhook(data: WebhookData): boolean {
    // Verify that the webhook is from Pakasir
    return data.project === PAKASIR_PROJECT_SLUG;
  },

  // Available payment methods
  getPaymentMethods(): { id: PaymentMethod; name: string; icon: string; fee: string; description: string }[] {
    return [
      { 
        id: 'qris', 
        name: 'QRIS', 
        icon: 'qr', 
        fee: '0.7%',
        description: 'Scan dengan Gopay, OVO, DANA, LinkAja, dll'
      },
      { 
        id: 'bni_va', 
        name: 'BNI Virtual Account', 
        icon: 'bank', 
        fee: 'Rp 4.000',
        description: 'Transfer via BNI Mobile/ATM'
      },
      { 
        id: 'bri_va', 
        name: 'BRI Virtual Account', 
        icon: 'bank', 
        fee: 'Rp 4.000',
        description: 'Transfer via BRIMo/ATM'
      },
      { 
        id: 'permata_va', 
        name: 'Permata Virtual Account', 
        icon: 'bank', 
        fee: 'Rp 4.000',
        description: 'Transfer via PermataMobile/ATM'
      },
      { 
        id: 'cimb_niaga_va', 
        name: 'CIMB Niaga Virtual Account', 
        icon: 'bank', 
        fee: 'Rp 4.000',
        description: 'Transfer via OCTO Mobile/ATM'
      },
      { 
        id: 'maybank_va', 
        name: 'Maybank Virtual Account', 
        icon: 'bank', 
        fee: 'Rp 4.000',
        description: 'Transfer via M2U/ATM'
      },
      { 
        id: 'paypal', 
        name: 'PayPal', 
        icon: 'paypal', 
        fee: '4.4% + $0.30',
        description: 'Pembayaran internasional'
      },
    ];
  },
};

// Poll payment status
export const pollPaymentStatus = async (
  orderId: string,
  amount: number,
  onStatusChange: (status: PaymentStatus) => void,
  interval: number = 5000,
  maxAttempts: number = 60
): Promise<void> => {
  let attempts = 0;
  
  const check = async () => {
    try {
      const status = await PakasirPayment.checkStatus(orderId, amount);
      onStatusChange(status);
      
      if (status.status === 'completed' || status.status === 'cancelled' || status.status === 'expired') {
        return;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(check, interval);
      }
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(check, interval);
      }
    }
  };
  
  check();
};
