import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { HomeSection } from '@/sections/HomeSection';
import { CartSection } from '@/sections/CartSection';
import { CheckoutSection } from '@/sections/CheckoutSection';
import { SupportSection } from '@/sections/SupportSection';
import { ProfileSection } from '@/sections/ProfileSection';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PromoModal } from '@/components/PromoModal';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { useAppStore } from '@/store/appStore';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ultraAudio } from '@/lib/audio';
import './App.css';

// Search Modal Component
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { products, isDarkMode, language } = useAppStore();
  const navigate = useNavigate();

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  if (!isOpen) return null;

  const t = {
    search: language === 'id' ? 'Cari produk...' : 'Search products...',
    noResults: language === 'id' ? 'Tidak ada hasil' : 'No results',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black/80' : 'bg-black/60'} backdrop-blur-md`}
      onClick={onClose}
    >
      <div 
        className={`absolute top-20 left-4 right-4 rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-auto ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder={t.search}
          className={`w-full p-4 border rounded-xl mb-4 text-base ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' 
              : 'bg-gray-50 border-gray-200'
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="space-y-2">
          {query && filtered.map(product => (
            <div 
              key={product.id} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-95 ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                onClose();
                navigate(`/?product=${product.id}`);
              }}
            >
              <img 
                src={product.icon} 
                alt={product.title} 
                className="w-14 h-14 object-cover rounded-lg" 
              />
              <div className="flex-1">
                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>
                  {product.title}
                </p>
                <p className="text-xs text-orange-500 font-semibold">
                  Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
          {query && filtered.length === 0 && (
            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.noResults}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Theme Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode, theme } = useAppStore();
  
  useEffect(() => {
    const root = document.documentElement;
    
    // Handle dark mode
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Handle theme colors
    const themeColors: Record<string, { primary: string; secondary: string }> = {
      default: { primary: '#f97316', secondary: '#ef4444' },
      ocean: { primary: '#0ea5e9', secondary: '#06b6d4' },
      sunset: { primary: '#f97316', secondary: '#ec4899' },
      forest: { primary: '#10b981', secondary: '#84cc16' },
    };

    const colors = themeColors[theme] || themeColors.default;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);

  }, [isDarkMode, theme]);

  return <>{children}</>;
}

// Main App Component
function App() {
  const { 
    notification, 
    setNotification, 
    isDarkMode, 
    isAppLoading,
    musicEnabled,
  } = useAppStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Handle notifications
  useEffect(() => {
    if (notification) {
      toast[notification.type](notification.message);
      setNotification(null);
    }
  }, [notification, setNotification]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        ultraAudio.playClick();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize audio and music
  useEffect(() => {
    ultraAudio.initialize();
    
    if (musicEnabled && !isAppLoading) {
      ultraAudio.playBackgroundMusic();
    } else {
      ultraAudio.pauseBackgroundMusic();
    }

    return () => {
      ultraAudio.stopBackgroundMusic();
    };
  }, [musicEnabled, isAppLoading]);

  // Don't show header/bottom nav on checkout
  const isCheckout = location.pathname === '/checkout';
  const isReviews = location.pathname.startsWith('/reviews');

  // Show loading screen
  if (isAppLoading) {
    return (
      <ThemeProvider>
        <WelcomeScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        {/* Promo Modal */}
        <PromoModal />

        {/* Header */}
        {!isCheckout && !isReviews && (
          <Header 
            onMenuClick={() => {
              ultraAudio.playClick();
              setSidebarOpen(true);
            }} 
            onSearchClick={() => {
              ultraAudio.playClick();
              setSearchOpen(true);
            }}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Search Modal */}
        <SearchModal 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />

        {/* Main Content */}
        <main className={`min-h-screen ${!isCheckout && !isReviews ? 'pt-16 pb-20' : ''}`}>
          <Routes>
            <Route path="/" element={<HomeSection />} />
            <Route path="/cart" element={<CartSection />} />
            <Route path="/checkout" element={<CheckoutSection />} />
            <Route path="/support" element={<SupportSection />} />
            <Route path="/profile" element={<ProfileSection />} />
            <Route path="/reviews/:productId" element={<ReviewsPage />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        {!isCheckout && !isReviews && <BottomNav />}

        {/* Toast notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
              border: isDarkMode ? '1px solid #374151' : 'none',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
