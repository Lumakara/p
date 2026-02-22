import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, CreditCard, QrCode, Clock, Check, Copy, X, 
  ExternalLink, Shield, Truck, BadgeCheck, Wallet,
  Loader2, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useAppStore } from '@/store/appStore';
import { usePayment } from '@/hooks/usePayment';

import { ultraAudio } from '@/lib/audio';
import { Link, useNavigate } from 'react-router-dom';

// Checkout benefits
const checkoutBenefits = [
  { icon: Shield, text: 'Transaksi Aman Terenkripsi' },
  { icon: BadgeCheck, text: 'Garansi 30 Hari Uang Kembali' },
  { icon: Truck, text: 'Proses Cepat 1-3 Hari Kerja' },
  { icon: Wallet, text: 'Pembayaran Aman & Terpercaya' },
];

export function CheckoutSection() {
  const { getSelectedItems, clearCart, isDarkMode, language } = useAppStore();
  const selectedItems = getSelectedItems();
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();
  
  const { 
    isProcessing, 
    paymentData, 
    paymentStatus, 
    formatCountdown,
    selectedMethod,
    setSelectedMethod,
    createPayment, 
    cancelPayment,
    formatRupiah,
    getPaymentMethods,
    openPaymentPage,
    simulatePayment,
  } = usePayment();
  
  const [showQRIS, setShowQRIS] = useState(false);
  const [copied, setCopied] = useState(false);


  const t = useMemo(() => ({
    checkout: language === 'id' ? 'Checkout' : 'Checkout',
    orderSummary: language === 'id' ? 'Ringkasan Pesanan' : 'Order Summary',
    paymentMethod: language === 'id' ? 'Metode Pembayaran' : 'Payment Method',
    payNow: language === 'id' ? 'Bayar Sekarang' : 'Pay Now',
    processing: language === 'id' ? 'Memproses...' : 'Processing...',
    secureTransaction: language === 'id' ? 'Transaksi Aman' : 'Secure Transaction',
    total: language === 'id' ? 'Total' : 'Total',
    item: language === 'id' ? 'item' : 'item',
    changeMethod: language === 'id' ? 'Ganti Metode' : 'Change Method',
    completePayment: language === 'id' ? 'Selesaikan Pembayaran' : 'Complete Payment',
    paymentSuccess: language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!',
    paymentSuccessDesc: language === 'id' 
      ? 'Terima kasih telah berbelanja. Pesanan Anda sedang diproses.' 
      : 'Thank you for shopping. Your order is being processed.',
    backToHome: language === 'id' ? 'Kembali ke Beranda' : 'Back to Home',
    cancelPayment: language === 'id' ? 'Batalkan Pembayaran' : 'Cancel Payment',
    scanQRIS: language === 'id' ? 'Scan kode QR dengan aplikasi e-wallet Anda' : 'Scan QR code with your e-wallet app',
    copyQR: language === 'id' ? 'Salin Kode QR' : 'Copy QR Code',
    copied: language === 'id' ? 'Tersalin!' : 'Copied!',
    paymentInstructions: language === 'id' ? 'Cara Pembayaran:' : 'Payment Instructions:',
    openPaymentPage: language === 'id' ? 'Buka Halaman Pembayaran' : 'Open Payment Page',
    selectMethod: language === 'id' ? 'Pilih Metode Pembayaran' : 'Select Payment Method',
  }), [language]);

  useEffect(() => {
    if (selectedItems.length === 0 && !paymentData) {
      navigate('/cart');
    }
  }, [selectedItems.length, paymentData, navigate]);

  const handleCreatePayment = async () => {
    try {
      await createPayment();
      setShowQRIS(true);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleCopyQR = () => {
    if (paymentData?.qr_string) {
      navigator.clipboard.writeText(paymentData.qr_string);
      setCopied(true);
      ultraAudio.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = async () => {
    if (paymentData) {
      await cancelPayment(paymentData.order_id, paymentData.amount);
      setShowQRIS(false);
    }
  };

  const handleSimulate = async () => {
    if (paymentData) {
      await simulatePayment(paymentData.order_id, paymentData.amount);
    }
  };

  if (paymentStatus === 'paid') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Card className={`w-full max-w-md text-center p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">{t.paymentSuccess}</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.paymentSuccessDesc}
          </p>
          <div className={`space-y-2 mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-500">{language === 'id' ? 'ID Transaksi' : 'Transaction ID'}</p>
            <p className="font-mono font-medium">{paymentData?.order_id}</p>
          </div>
          <Link to="/">
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 h-12 rounded-xl text-lg"
              onClick={clearCart}
            >
              {t.backToHome}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (showQRIS && paymentData) {
    return (
      <div className={`min-h-screen px-4 py-6 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={handleCancel} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>{t.completePayment}</h1>
          </div>

          <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            {/* Timer */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 text-center">
              <p className="text-sm text-white/90 mb-1">
                {language === 'id' ? 'Selesaikan pembayaran dalam' : 'Complete payment in'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-3xl font-bold font-mono">{formatCountdown()}</span>
              </div>
            </div>

            <CardContent className="p-6">
              {/* QR Code */}
              {paymentData.qr_code_url && (
                <div className="text-center mb-6">
                  <div className={`p-4 rounded-2xl border-2 border-dashed inline-block ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}>
                    <img 
                      src={paymentData.qr_code_url} 
                      alt="QRIS Code" 
                      className="w-56 h-56"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {t.scanQRIS}
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500">{t.total}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatRupiah(subtotal)}
                </p>
              </div>

              {/* Open Payment Page */}
              <Button
                onClick={openPaymentPage}
                className="w-full mb-4 bg-green-600 hover:bg-green-700 h-12 rounded-xl"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.openPaymentPage}
              </Button>

              {/* Copy QR String */}
              {paymentData.qr_string && (
                <button
                  onClick={handleCopyQR}
                  className={`w-full flex items-center justify-center gap-2 p-3 border-2 rounded-xl mb-4 transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{t.copyQR}</span>
                    </>
                  )}
                </button>
              )}

              {/* Instructions */}
              <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="font-medium">{t.paymentInstructions}</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>{language === 'id' ? 'Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)' : 'Open e-wallet app (GoPay, OVO, DANA, etc)'}</li>
                  <li>{language === 'id' ? 'Pilih menu Scan QR' : 'Select Scan QR menu'}</li>
                  <li>{language === 'id' ? 'Scan kode QR di atas' : 'Scan the QR code above'}</li>
                  <li>{language === 'id' ? 'Konfirmasi pembayaran' : 'Confirm payment'}</li>
                </ol>
              </div>

              <div className="border-t my-4 dark:border-gray-600" />

              {/* Simulate Payment (for testing) */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={handleSimulate}
                >
                  Simulate Payment (Dev Only)
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                {t.cancelPayment}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-6 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>{t.checkout}</h1>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {checkoutBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className={`flex items-center gap-2 p-3 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <Icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {benefit.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <Card className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <h2 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>{t.orderSummary}</h2>
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : ''}`}>{item.title}</p>
                    <p className="text-xs text-gray-500">{item.tier} x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t my-3 dark:border-gray-600" />
            <div className="flex justify-between">
              <span className="font-semibold">{t.total}</span>
              <span className="font-bold text-orange-600 text-lg">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <h2 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>{t.paymentMethod}</h2>
            <div className="space-y-2">
              {getPaymentMethods().map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id as any);
                    ultraAudio.playClick();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedMethod === method.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}>
                    {method.id === 'qris' ? (
                      <QrCode className="h-5 w-5" />
                    ) : method.id === 'paypal' ? (
                      <Wallet className="h-5 w-5" />
                    ) : (
                      <Banknote className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{method.name}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id
                      ? 'border-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 py-6 rounded-xl text-lg font-semibold shadow-lg"
          onClick={handleCreatePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t.processing}
            </span>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              {t.payNow}
            </>
          )}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" />
          {t.secureTransaction}
        </p>
      </div>
    </div>
  );
}
