import { useState } from 'react';
import { Menu, ShoppingBag, Search, Heart, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { ultraAudio } from '@/lib/audio';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const { 
    cart, 
    favorites,
    isDarkMode,
    language,
    getSelectedItems, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection,
  } = useAppStore();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const selectedItems = getSelectedItems();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCartClick = () => {
    ultraAudio.playClick();
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    ultraAudio.playCheckout();
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const t = {
    shoppingCart: language === 'id' ? 'Keranjang Belanja' : 'Shopping Cart',
    emptyCart: language === 'id' ? 'Keranjang Anda kosong' : 'Your cart is empty',
    explore: language === 'id' ? 'Jelajahi Produk' : 'Explore Products',
    subtotal: language === 'id' ? 'Subtotal' : 'Subtotal',
    items: language === 'id' ? 'item' : 'items',
    checkout: language === 'id' ? 'Checkout' : 'Checkout',
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-950/95 border-b border-gray-800' 
          : 'bg-white/95 backdrop-blur-md'
      } shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-xl`}
            onClick={() => {
              ultraAudio.playClick();
              onMenuClick();
            }}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => ultraAudio.playClick()}>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg hidden sm:block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Digital Store
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-xl relative`}
              onClick={() => {
                ultraAudio.playClick();
                onSearchClick();
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="icon"
              className={`${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-xl relative hidden sm:flex`}
              onClick={() => {
                ultraAudio.playClick();
                navigate('/profile');
              }}
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>

            {/* Cart Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-xl relative`}
                  onClick={handleCartClick}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className={`w-full sm:max-w-md ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white'}`}>
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    <ShoppingBag className="w-5 h-5" />
                    {t.shoppingCart}
                    {cartCount > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                        {cartCount} {t.items}
                      </Badge>
                    )}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-4 flex flex-col h-[calc(100vh-180px)]">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
                        <ShoppingBag className={`h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-orange-300'}`} />
                      </div>
                      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t.emptyCart}
                      </p>
                      <Button 
                        className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/');
                        }}
                      >
                        {t.explore}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-auto space-y-3 pr-2">
                        {cart.map((item, index) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-gray-50 border-gray-100'
                            } ${item.selected ? 'ring-2 ring-orange-500' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => {
                                ultraAudio.playToggle();
                                toggleItemSelection(index);
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                            />
                            <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : ''}`}>
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">{item.tier}</p>
                              <p className="text-orange-600 font-bold text-sm mt-1">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => {
                                  ultraAudio.playRemove();
                                  removeFromCart(index);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    ultraAudio.playClick();
                                    updateQuantity(index, -1);
                                  }}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                    isDarkMode 
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                      : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
                                  }`}
                                >
                                  −
                                </button>
                                <span className={`w-8 text-center text-sm font-medium ${isDarkMode ? 'text-white' : ''}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    ultraAudio.playClick();
                                    updateQuantity(index, 1);
                                  }}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                    isDarkMode 
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                      : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={`border-t pt-4 mt-4 ${isDarkMode ? 'border-gray-800' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.subtotal} ({selectedItems.length} {t.items})
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              Rp {cartTotal.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <Button 
                          className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 rounded-xl font-semibold shadow-lg"
                          disabled={selectedItems.length === 0}
                          onClick={handleCheckout}
                        >
                          {t.checkout}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Profile Avatar */}
            <Link to="/profile" onClick={() => ultraAudio.playClick()}>
              <Avatar className="h-9 w-9 border-2 border-orange-200 cursor-pointer hover:scale-105 transition-transform">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
