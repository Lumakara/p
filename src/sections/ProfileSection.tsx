import { useState, useMemo } from 'react';
import { 
  ShoppingBag, Heart, ChevronRight, Moon, Sun, Music, VolumeX, 
  Globe, Package, Sparkles, Info,
  TrendingUp, Zap
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';
import { Link } from 'react-router-dom';

const themeOptions = [
  { id: 'default', name: 'Default', nameEn: 'Default', gradient: 'from-orange-500 to-red-500', color: 'bg-orange-500' },
  { id: 'ocean', name: 'Ocean', nameEn: 'Ocean', gradient: 'from-blue-500 to-cyan-500', color: 'bg-blue-500' },
  { id: 'sunset', name: 'Sunset', nameEn: 'Sunset', gradient: 'from-pink-500 to-purple-500', color: 'bg-pink-500' },
  { id: 'forest', name: 'Forest', nameEn: 'Forest', gradient: 'from-green-500 to-emerald-500', color: 'bg-green-500' },
];

const newsItems = [
  {
    id: 1,
    title: 'Selamat Datang di Digital Store v2.0',
    content: 'Kami telah melakukan pembaruan besar dengan fitur AI Chatbot, tema baru, dan pengalaman berbelanja yang lebih baik.',
    date: '2025-02-22',
    type: 'update',
    icon: Sparkles
  },
  {
    id: 2,
    title: 'Diskon Spesial 20%',
    content: 'Dapatkan diskon 20% untuk pembelian pertama Anda dengan kode FIRST20. Berlaku hingga akhir bulan!',
    date: '2025-02-20',
    type: 'promo',
    icon: TrendingUp
  },
  {
    id: 3,
    title: 'Layanan Baru: AI Assistant',
    content: 'Sekarang Anda bisa mendapatkan bantuan instan 24/7 melalui AI Assistant kami di menu Bantuan.',
    date: '2025-02-18',
    type: 'info',
    icon: Zap
  }
];



export function ProfileSection() {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    language, 
    setLanguage,
    musicEnabled,
    toggleMusic,
    soundEnabled,
    toggleSound,
    theme,
    setTheme,
    favorites,
    cart,
    orders,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');

  const t = useMemo(() => ({
    profile: language === 'id' ? 'Profil' : 'Profile',
    overview: language === 'id' ? 'Ikhtisar' : 'Overview',
    settings: language === 'id' ? 'Pengaturan' : 'Settings',
    theme: language === 'id' ? 'Tema' : 'Theme',
    darkMode: language === 'id' ? 'Mode Gelap' : 'Dark Mode',
    darkModeDesc: language === 'id' ? 'Tampilan gelap untuk mata' : 'Dark theme for eyes',
    music: language === 'id' ? 'Musik Latar' : 'Background Music',
    musicDesc: language === 'id' ? 'Musik saat browsing' : 'Music while browsing',
    sound: language === 'id' ? 'Efek Suara' : 'Sound Effects',
    soundDesc: language === 'id' ? 'Suara klik dan notifikasi' : 'Click & notification sounds',
    language: language === 'id' ? 'Bahasa' : 'Language',
    languageDesc: language === 'id' ? 'Pilih bahasa tampilan' : 'Select display language',
    cart: language === 'id' ? 'Keranjang Belanja' : 'Shopping Cart',
    favorites: language === 'id' ? 'Produk Favorit' : 'Favorite Products',
    orders: language === 'id' ? 'Riwayat Pesanan' : 'Order History',
    news: language === 'id' ? 'Berita & Update' : 'News & Updates',
    about: language === 'id' ? 'Tentang Kami' : 'About Us',
    version: language === 'id' ? 'Versi Aplikasi' : 'App Version',
    seeAll: language === 'id' ? 'Lihat Semua' : 'See All',
    guest: language === 'id' ? 'Pengunjung' : 'Guest',
    welcome: language === 'id' ? 'Selamat Datang!' : 'Welcome!',
    welcomeDesc: language === 'id' 
      ? 'Nikmati pengalaman berbelanja digital terbaik' 
      : 'Enjoy the best digital shopping experience',
  }), [language]);

  const getThemeGradient = () => {
    const currentTheme = themeOptions.find(t => t.id === theme);
    return currentTheme?.gradient || 'from-orange-500 to-red-500';
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    ultraAudio.playClick();
    ultraAudio.haptic('light');
  };

  const handleToggle = (type: 'dark' | 'music' | 'sound') => {
    ultraAudio.playToggle();
    ultraAudio.haptic('medium');
    
    switch (type) {
      case 'dark':
        toggleDarkMode();
        break;
      case 'music':
        toggleMusic();
        if (!musicEnabled) {
          ultraAudio.playBackgroundMusic();
        } else {
          ultraAudio.pauseBackgroundMusic();
        }
        break;
      case 'sound':
        toggleSound();
        break;
    }
  };

  return (
    <div className={`min-h-screen pb-24 px-4 pt-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Profile Header */}
      <div className={`relative overflow-hidden rounded-3xl p-6 mb-6 bg-gradient-to-r ${getThemeGradient()}`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-800" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t.welcome}</h2>
          <p className="text-white/80 text-sm mt-1">{t.welcomeDesc}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Package, label: t.orders, value: orders.length, color: 'bg-blue-500', link: '/orders' },
          { icon: Heart, label: t.favorites, value: favorites.length, color: 'bg-red-500', link: '/favorites' },
          { icon: ShoppingBag, label: t.cart, value: cart.length, color: 'bg-green-500', link: '/cart' },
        ].map((stat, index) => (
          <Link key={index} to={stat.link} onClick={() => ultraAudio.playClick()}>
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-all active:scale-95`}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full grid-cols-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <TabsTrigger value="overview" className="rounded-lg">
            {t.overview}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">
            {t.settings}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>{t.cart}</h3>
                      <p className="text-xs text-gray-500">{cart.length} items</p>
                    </div>
                  </div>
                  <Link to="/cart" onClick={() => ultraAudio.playClick()}>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {cart.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : ''}`}>{item.title}</p>
                        <p className="text-xs text-gray-500">{item.tier} x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-orange-600">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <p className="text-center text-xs text-gray-500 pt-2">
                      +{cart.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Favorites Summary */}
          {favorites.length > 0 && (
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>{t.favorites}</h3>
                      <p className="text-xs text-gray-500">{favorites.length} items</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* News & Updates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>{t.news}</h3>
            </div>
            <div className="space-y-3">
              {newsItems.map((news) => {
                const Icon = news.icon;
                return (
                  <Card 
                    key={news.id} 
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} overflow-hidden`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          news.type === 'update' ? 'bg-blue-100' :
                          news.type === 'promo' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            news.type === 'update' ? 'text-blue-600' :
                            news.type === 'promo' ? 'text-red-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : ''}`}>{news.title}</h4>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {news.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{news.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* Theme Selection */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-4">
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : ''}`}>{t.theme}</h3>
              <div className="grid grid-cols-2 gap-3">
                {themeOptions.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      theme === themeOption.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${themeOption.gradient} mx-auto mb-2`} />
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : ''}`}>
                      {language === 'id' ? themeOption.name : themeOption.nameEn}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-4 space-y-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>
                {language === 'id' ? 'Tampilan' : 'Appearance'}
              </h3>
              
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDarkMode ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Sun className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{t.darkMode}</p>
                    <p className="text-xs text-gray-500">{t.darkModeDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={() => handleToggle('dark')}
                />
              </div>

              {/* Music */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    musicEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Music className={`h-5 w-5 ${musicEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{t.music}</p>
                    <p className="text-xs text-gray-500">{t.musicDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={musicEnabled} 
                  onCheckedChange={() => handleToggle('music')}
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    soundEnabled ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {soundEnabled ? (
                      <VolumeX className="h-5 w-5 text-blue-600" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{t.sound}</p>
                    <p className="text-xs text-gray-500">{t.soundDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={soundEnabled} 
                  onCheckedChange={() => handleToggle('sound')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{t.language}</p>
                  <p className="text-xs text-gray-500">{t.languageDesc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setLanguage('id');
                    ultraAudio.playClick();
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    language === 'id'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-lg mr-2">🇮🇩</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>Indonesia</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    ultraAudio.playClick();
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    language === 'en'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-lg mr-2">🇺🇸</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>English</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Info className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{t.version}</p>
                    <p className="text-xs text-gray-500">v2.0.0</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
