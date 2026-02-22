import { Home, ShoppingBag, User, Headphones } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';

export function BottomNav() {
  const location = useLocation();
  const { isDarkMode, language, cart } = useAppStore();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: 'home', label: language === 'id' ? 'Beranda' : 'Home', labelEn: 'Home', icon: Home, path: '/' },
    { id: 'cart', label: language === 'id' ? 'Keranjang' : 'Cart', labelEn: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartCount },
    { id: 'support', label: language === 'id' ? 'Bantuan' : 'Support', labelEn: 'Support', icon: Headphones, path: '/support' },
    { id: 'profile', label: language === 'id' ? 'Profil' : 'Profile', labelEn: 'Profile', icon: User, path: '/profile' },
  ];

  const handleClick = () => {
    ultraAudio.playTap();
    ultraAudio.haptic('light');
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-2xl ${
      isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white'
    }`}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative ${
                isActive 
                  ? 'text-orange-500' 
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative transition-all duration-300 ${isActive ? 'transform -translate-y-1' : ''}`}>
                <Icon className={`h-5 w-5 mb-1 transition-all duration-300 ${isActive ? 'fill-current' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{language === 'id' ? item.label : item.labelEn}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
