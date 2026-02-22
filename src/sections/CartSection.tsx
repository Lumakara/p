import { useState, useMemo } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ChevronRight, Shield, 
  Truck, BadgeCheck, Wallet, ArrowLeft, Gift, Sparkles,
  AlertCircle, Heart, Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';
import { Link, useNavigate } from 'react-router-dom';

// Cart benefits
const cartBenefits = [
  { icon: Shield, text: 'Transaksi Aman & Terenkripsi' },
  { icon: Truck, text: 'Pengiriman Cepat 1-3 Hari' },
  { icon: BadgeCheck, text: 'Garansi 30 Hari Uang Kembali' },
  { icon: Wallet, text: 'Pembayaran Aman' },
];

export function CartSection() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection,
    selectAllItems,
    clearCart,
    isDarkMode,
    language,
    favorites,
    toggleFavorite,
    products,
  } = useAppStore();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(true);

  const t = useMemo(() => ({
    shoppingCart: language === 'id' ? 'Keranjang Belanja' : 'Shopping Cart',
    emptyCart: language === 'id' ? 'Keranjang Kosong' : 'Empty Cart',
    emptyCartDesc: language === 'id' 
      ? 'Keranjang belanja Anda masih kosong. Yuk, jelajahi layanan kami!' 
      : 'Your cart is empty. Explore our services!',
    explore: language === 'id' ? 'Jelajahi Layanan' : 'Explore Services',
    selectAll: language === 'id' ? 'Pilih Semua' : 'Select All',
    deleteAll: language === 'id' ? 'Hapus Semua' : 'Delete All',
    subtotal: language === 'id' ? 'Subtotal' : 'Subtotal',
    items: language === 'id' ? 'item' : 'items',
    checkout: language === 'id' ? 'Checkout' : 'Checkout',
    moveToFavorites: language === 'id' ? 'Pindah ke Favorit' : 'Move to Favorites',
    delete: language === 'id' ? 'Hapus' : 'Delete',
    stock: language === 'id' ? 'Stok' : 'Stock',
    available: language === 'id' ? 'Tersedia' : 'Available',
    discount: language === 'id' ? 'Diskon' : 'Discount',
    totalDiscount: language === 'id' ? 'Total Diskon' : 'Total Discount',
    totalPayment: language === 'id' ? 'Total Pembayaran' : 'Total Payment',
  }), [language]);

  const selectedItems = cart.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate discount
  const totalDiscount = selectedItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (product?.discount_price && product.discount_price < product.base_price) {
      return sum + (product.base_price - product.discount_price) * item.quantity;
    }
    return sum;
  }, 0);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    selectAllItems(checked);
    ultraAudio.playToggle();
  };

  const handleQuantityChange = (index: number, change: number) => {
    ultraAudio.playClick();
    updateQuantity(index, change);
  };

  const handleRemove = (index: number) => {
    ultraAudio.playRemove();
    removeFromCart(index);
    setShowDeleteConfirm(null);
  };

  const handleMoveToFavorites = (item: typeof cart[0]) => {
    toggleFavorite(item.productId);
    ultraAudio.playHeart();
    ultraAudio.haptic('medium');
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      ultraAudio.playError();
      return;
    }
    ultraAudio.playCheckout();
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className={`min-h-[80vh] flex flex-col items-center justify-center px-4 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-orange-100'
        }`}>
          <ShoppingBag className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-orange-400'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t.emptyCart}
        </h2>
        <p className={`text-center mb-8 max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.emptyCartDesc}
        </p>
        <Link to="/">
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 rounded-full px-8 h-12 text-lg shadow-lg"
            onClick={() => ultraAudio.playClick()}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {t.explore}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-40 px-4 pt-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>{t.shoppingCart}</h1>
            <p className="text-sm text-gray-500">{cart.length} {t.items}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (confirm(language === 'id' ? 'Hapus semua item?' : 'Delete all items?')) {
              clearCart();
              ultraAudio.playRemove();
            }
          }}
          className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
        >
          <Trash className="h-4 w-4" />
          {t.deleteAll}
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {cartBenefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div 
              key={index}
              className={`flex items-center gap-2 p-3 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {benefit.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Select All */}
      <div className={`flex items-center gap-2 mb-4 p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <Checkbox 
          checked={selectAll} 
          onCheckedChange={handleSelectAll}
          id="select-all"
          className="border-2"
        />
        <label htmlFor="select-all" className={`text-sm font-medium cursor-pointer flex-1 ${
          isDarkMode ? 'text-white' : ''
        }`}>
          {t.selectAll} ({cart.length} {t.items})
        </label>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-600">
            {selectedCount} {t.items}
          </Badge>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cart.map((item, index) => {
          const product = products.find(p => p.id === item.productId);
          return (
            <Card 
              key={item.id} 
              className={`overflow-hidden transition-all duration-300 ${
                item.selected ? 'ring-2 ring-orange-500 shadow-lg' : ''
              } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Checkbox 
                    checked={item.selected}
                    onCheckedChange={() => {
                      toggleItemSelection(index);
                      ultraAudio.playToggle();
                    }}
                    className="mt-1 border-2"
                  />
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    {product?.discount_price && (
                      <Badge className="absolute -top-1 -left-1 bg-red-500 text-[10px]">
                        -{Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : ''}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">{item.tier}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                      {product?.discount_price && (
                        <span className="text-xs text-gray-400 line-through">
                          Rp {(product.base_price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center rounded-lg overflow-hidden ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <button
                          onClick={() => handleQuantityChange(index, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(index, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveToFavorites(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.includes(item.productId) 
                              ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(item.productId) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className={`fixed bottom-16 left-0 right-0 border-t shadow-2xl p-4 z-30 ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'
      }`}>
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Gift className="h-4 w-4" />
              {t.totalDiscount}
            </span>
            <span className="text-green-600 font-medium">
              -Rp {totalDiscount.toLocaleString('id-ID')}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.totalPayment} ({selectedCount} {t.items})
            </p>
            <p className="text-2xl font-bold text-orange-600">
              Rp {subtotal.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 h-14 rounded-xl text-lg font-semibold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          {t.checkout}
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl p-6 max-w-sm w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-white' : ''}`}>
              {language === 'id' ? 'Hapus Item?' : 'Delete Item?'}
            </h3>
            <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'id' 
                ? 'Item akan dihapus dari keranjang Anda' 
                : 'Item will be removed from your cart'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12"
                onClick={() => setShowDeleteConfirm(null)}
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl h-12"
                onClick={() => handleRemove(showDeleteConfirm)}
              >
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
