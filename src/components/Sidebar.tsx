import { X, Home, ShoppingBag, User, Heart, Headphones, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { ultraAudio } from '@/lib/audio';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { cart, favorites, isDarkMode, language } = useAppStore();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (path: string) => {
    ultraAudio.playClick();
    ultraAudio.haptic('light');
    onClose();
    navigate(path);
  };

  const navItems = [
    { id: 'home', label: language === 'id' ? 'Beranda' : 'Home', labelEn: 'Home', icon: Home, path: '/', badge: null },
    { id: 'cart', label: language === 'id' ? 'Keranjang' : 'Cart', labelEn: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { id: 'favorites', label: language === 'id' ? 'Favorit' : 'Favorites', labelEn: 'Favorites', icon: Heart, path: '/favorites', badge: favorites.length },
    { id: 'profile', label: language === 'id' ? 'Profil' : 'Profile', labelEn: 'Profile', icon: User, path: '/profile', badge: null },
    { id: 'support', label: language === 'id' ? 'Bantuan' : 'Support', labelEn: 'Support', icon: Headphones, path: '/support', badge: null },
  ];

  const bgClass = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const hoverClass = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <>
      {/* Overlay with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 transition-opacity"
          onClick={() => {
            ultraAudio.playClick();
            onClose();
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 ${bgClass} z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with gradient */}
        <div className={`relative overflow-hidden ${
          isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-orange-500" />
                </div>
                <span className="font-bold text-lg text-white">
                  Digital Store
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  ultraAudio.playClick();
                  onClose();
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                <AvatarFallback className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-orange-500'} text-lg font-bold`}>
                  <Sparkles className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {language === 'id' ? 'Selamat Datang!' : 'Welcome!'}
                </p>
                <p className="text-sm text-white/80 truncate">
                  {language === 'id' ? 'Nikmati belanja Anda' : 'Enjoy your shopping'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-4 w-full p-4 rounded-xl ${hoverClass} transition-all duration-200 text-left group active:scale-95 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isDarkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-orange-50 group-hover:bg-orange-100'
                }`}>
                  <Icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-orange-500'}`} />
                </div>
                <span className="flex-1 font-medium">
                  {language === 'id' ? item.label : item.labelEn}
                </span>
                {item.badge !== null && item.badge > 0 && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${borderClass} ${bgClass}`}>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
            <p className={`text-xs ${subTextClass} text-center`}>
              © 2025 Digital Store v2.0
            </p>
            <p className={`text-[10px] ${subTextClass} text-center mt-1`}>
              {language === 'id' ? 'Dibuat dengan' : 'Made with'} ❤️ {language === 'id' ? 'di Indonesia' : 'in Indonesia'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
