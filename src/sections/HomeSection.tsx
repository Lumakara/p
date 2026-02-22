import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Star, Clock, ShoppingCart, Check, ChevronLeft, ChevronRight,
  Sparkles, Shield, Headphones, Award, Heart,
  Zap, TrendingUp, BadgeCheck, Wallet, 
  X, SlidersHorizontal, ChevronDown, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/useProducts';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/lib/supabase';

// Trust Badges Data - Ultra Detail
const trustBadges = [
  { 
    icon: Shield, 
    title: 'Garansi 30 Hari', 
    subtitle: '100% Uang Kembali',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50'
  },
  { 
    icon: Headphones, 
    title: 'Support 24/7', 
    subtitle: 'Siap Membantu',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50'
  },
  { 
    icon: BadgeCheck, 
    title: 'Produk Original', 
    subtitle: 'Bergaransi Resmi',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50'
  },
  { 
    icon: Wallet, 
    title: 'Pembayaran Aman', 
    subtitle: 'Terenkripsi SSL',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50'
  },
];

// Categories with icons
const categories = [
  { id: 'all', label: 'Semua', labelEn: 'All', icon: Sparkles },
  { id: 'installation', label: 'Instalasi', labelEn: 'Installation', icon: Zap },
  { id: 'creative', label: 'Kreatif', labelEn: 'Creative', icon: Award },
  { id: 'technical', label: 'Teknis', labelEn: 'Technical', icon: TrendingUp },
];

// Sort options
const sortOptions = [
  { id: 'popular', label: 'Paling Populer', labelEn: 'Most Popular', icon: TrendingUp },
  { id: 'price_asc', label: 'Harga Terendah', labelEn: 'Lowest Price', icon: ChevronDown },
  { id: 'price_desc', label: 'Harga Tertinggi', labelEn: 'Highest Price', icon: ChevronDown },
  { id: 'rating', label: 'Rating Tertinggi', labelEn: 'Highest Rated', icon: Star },
  { id: 'newest', label: 'Terbaru', labelEn: 'Newest', icon: Sparkles },
];

export function HomeSection() {
  const { products, isLoading } = useProducts();
  const { 
    addToCart, 
    cart, 
    addRecentlyViewed, 
    isDarkMode,
    toggleFavorite,
    isFavorite,
    language,
    theme,
  } = useAppStore();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Text based on language
  const t = useMemo(() => ({
    searchPlaceholder: language === 'id' ? 'Cari produk...' : 'Search products...',
    featuredProducts: language === 'id' ? 'Produk Pilihan' : 'Featured Products',
    allProducts: language === 'id' ? 'Semua Produk' : 'All Products',
    seeAll: language === 'id' ? 'Lihat Semua' : 'See All',
    choosePackage: language === 'id' ? 'Pilih Paket' : 'Choose Package',
    addToCart: language === 'id' ? 'Tambah ke Keranjang' : 'Add to Cart',
    added: language === 'id' ? 'Ditambahkan' : 'Added',
    reviews: language === 'id' ? 'ulasan' : 'reviews',
    stock: language === 'id' ? 'Stok' : 'Stock',
    limitedStock: language === 'id' ? 'Stok Terbatas' : 'Limited Stock',
    viewReviews: language === 'id' ? 'Lihat Ulasan' : 'View Reviews',
    noResults: language === 'id' ? 'Produk tidak ditemukan' : 'No products found',
    resetFilter: language === 'id' ? 'Reset Filter' : 'Reset Filter',
    filter: language === 'id' ? 'Filter' : 'Filter',
    category: language === 'id' ? 'Kategori' : 'Category',
    sort: language === 'id' ? 'Urutkan' : 'Sort',
  }), [language]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero banner auto-rotate
  useEffect(() => {
    heroIntervalRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => {
      if (heroIntervalRef.current) clearInterval(heroIntervalRef.current);
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => ((a.discount_price || a.base_price || 0) - (b.discount_price || b.base_price || 0)));
        break;
      case 'price_desc':
        result.sort((a, b) => ((b.discount_price || b.base_price || 0) - (a.discount_price || a.base_price || 0)));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      default:
        // Keep original order for popular
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Featured products
  const featuredProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const handleCategoryClick = (catId: string) => {
    ultraAudio.playClick();
    ultraAudio.haptic('light');
    setSelectedCategory(catId);
  };

  const handleProductClick = (product: Product) => {
    ultraAudio.playClick();
    setSelectedProduct(product);
    setSelectedTier(product.tiers[0]?.name || '');
    setShowProductDialog(true);
    addRecentlyViewed(product.id);
  };

  const handleAddToCart = () => {
    if (selectedProduct && selectedTier) {
      addToCart(selectedProduct, selectedTier);
      ultraAudio.playAddToCart();
      ultraAudio.haptic('success');
      setAddedToCart(`${selectedProduct.id}-${selectedTier}`);
      setTimeout(() => setAddedToCart(null), 2000);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleFavorite(productId);
    ultraAudio.playHeart();
    ultraAudio.haptic('medium');
  };

  const isInCart = (productId: string, tierName: string) => {
    return cart.some(item => item.productId === productId && item.tier === tierName);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productScrollRef.current) {
      const scrollAmount = 320;
      productScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getThemeGradient = () => {
    switch (theme) {
      case 'ocean': return 'from-blue-600 to-cyan-500';
      case 'sunset': return 'from-orange-500 to-pink-500';
      case 'forest': return 'from-green-600 to-emerald-500';
      default: return 'from-orange-500 to-red-500';
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Hero Banner - Ultra Smooth iOS Style */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        {/* Slides */}
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              heroIndex === index 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={`/images/banners/hero-${index + 1}.jpg`}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"

              onError={(e) => {
                // Fallback gradient
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.className = `w-full h-full bg-gradient-to-br ${
                    index === 0 ? 'from-orange-500 to-red-500' :
                    index === 1 ? 'from-blue-500 to-purple-500' :
                    'from-green-500 to-teal-500'
                  }`;
                }
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center px-6 sm:px-10">
              <div className="max-w-md animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <Badge className={`mb-3 bg-gradient-to-r ${getThemeGradient()} text-white border-0 shadow-lg`}>
                  {index === 0 ? 'Promo Spesial' : index === 1 ? 'Terbaru' : 'Best Seller'}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                  {index === 0 ? 'Diskon 20%' : index === 1 ? 'WiFi 6 Install' : 'CCTV Package'}
                </h2>
                <p className="text-white/90 text-sm sm:text-base mb-5">
                  {index === 0 
                    ? 'Untuk pembelian pertama Anda' 
                    : index === 1 
                      ? 'Kecepatan hingga 1Gbps dengan teknologi terbaru' 
                      : 'Keamanan 24/7 untuk rumah dan kantor Anda'}
                </p>
                <Button 
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
                  onClick={() => ultraAudio.playClick()}
                >
                  {language === 'id' ? 'Lihat Detail' : 'View Details'}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => {
                ultraAudio.playTap();
                setHeroIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                heroIndex === index 
                  ? 'w-8 bg-white shadow-lg' 
                  : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badges - Ultra Detail */}
      <div className={`px-4 py-5 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-white'
      }`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center p-2 sm:p-3 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:shadow-md ${
                  isDarkMode ? 'hover:bg-gray-800' : badge.bgColor
                }`}
                onClick={() => {
                  ultraAudio.playClick();
                  ultraAudio.haptic('light');
                }}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-2 shadow-lg`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">
                  {badge.title}
                </p>
                <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                  {badge.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Search & Filter - Ultra Detail */}
      <div className={`sticky top-0 z-30 px-4 py-3 transition-all duration-300 ${
        isScrolled 
          ? isDarkMode 
            ? 'bg-gray-950/95 shadow-xl backdrop-blur-xl' 
            : 'bg-white/95 shadow-lg backdrop-blur-xl'
          : ''
      }`}>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              placeholder={t.searchPlaceholder}
              className={`pl-10 rounded-xl h-11 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500' 
                  : 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-orange-200'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className={`rounded-xl h-11 w-11 transition-all active:scale-95 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => ultraAudio.playClick()}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className={`h-[70vh] rounded-t-3xl ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white'
            }`}>
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className={isDarkMode ? 'text-white' : ''}>{t.filter}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6 overflow-y-auto h-[calc(70vh-120px)]">
                {/* Categories */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>{t.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryClick(cat.id);
                            if (window.innerWidth >= 1024) setShowFilterSheet(false);
                          }}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                            isSelected
                              ? `bg-gradient-to-r ${getThemeGradient()} text-white shadow-lg`
                              : isDarkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {language === 'id' ? cat.label : cat.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Sort Options */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>{t.sort}</h4>
                  <div className="space-y-2">
                    {sortOptions.map((sort) => {
                      const Icon = sort.icon;
                      const isSelected = sortBy === sort.id;
                      return (
                        <button
                          key={sort.id}
                          onClick={() => {
                            setSortBy(sort.id);
                            ultraAudio.playClick();
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-xl text-sm transition-all active:scale-95 ${
                            isSelected
                              ? `bg-gradient-to-r ${getThemeGradient()} text-white shadow-lg`
                              : isDarkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {language === 'id' ? sort.label : sort.labelEn}
                          </span>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="relative">
          <button
            onClick={() => {
              ultraAudio.playClick();
              scrollCategories('left');
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 shadow-lg rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div 
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-1"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all duration-300 active:scale-95 ${
                    isSelected
                      ? `bg-gradient-to-r ${getThemeGradient()} text-white shadow-lg scale-105`
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {language === 'id' ? cat.label : cat.labelEn}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => {
              ultraAudio.playClick();
              scrollCategories('right');
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 shadow-lg rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Featured Products Section - Swipeable */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.featuredProducts}
          </h2>
          <button 
            onClick={() => {
              ultraAudio.playClick();
              setSelectedCategory('all');
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="text-sm text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            {t.seeAll}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Horizontal Scroll Products */}
        <div className="relative">
          <button
            onClick={() => {
              ultraAudio.playClick();
              scrollProducts('left');
            }}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div 
            ref={productScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-8 py-2 -mx-4"
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-shrink-0 w-44 h-64 rounded-2xl animate-pulse ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                />
              ))
            ) : (
              featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                  isInCart={isInCart(product.id, product.tiers[0]?.name || '')}
                  isFav={isFavorite(product.id)}
                  onFavorite={(e) => handleFavoriteClick(e, product.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  variant="horizontal"
                  isDarkMode={isDarkMode}
                  theme={theme}
                />
              ))
            )}
          </div>

          <button
            onClick={() => {
              ultraAudio.playClick();
              scrollProducts('right');
            }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* All Products Grid */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.allProducts}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} {language === 'id' ? 'produk' : 'products'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`rounded-2xl h-72 animate-pulse ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className={`h-10 w-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {t.noResults}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4 rounded-full"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t.resetFilter}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                isInCart={isInCart(product.id, product.tiers[0]?.name || '')}
                isFav={isFavorite(product.id)}
                onFavorite={(e) => handleFavoriteClick(e, product.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
                variant="vertical"
                isDarkMode={isDarkMode}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Dialog - Ultra Detail */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className={`max-w-lg max-h-[90vh] overflow-auto rounded-2xl p-0 gap-0 ${
          isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white'
        }`}>
          {selectedProduct && (
            <>
              {/* Product Image */}
              <div className="relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteClick(e, selectedProduct.id)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                >
                  <Heart 
                    className={`w-6 h-6 ${isFavorite(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </button>

                {/* Discount Badge */}
                {selectedProduct.discount_price && selectedProduct.base_price && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 text-sm px-3 py-1">
                    -{Math.round(((selectedProduct.base_price - selectedProduct.discount_price) / selectedProduct.base_price) * 100)}%
                  </Badge>
                )}

                {/* Stock Badge */}
                {selectedProduct.stock !== undefined && selectedProduct.stock < 20 && (
                  <Badge className="absolute bottom-4 left-4 bg-orange-500 text-white border-0">
                    {t.limitedStock}
                  </Badge>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
                  {selectedProduct.title}
                </h2>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-bold text-yellow-700 dark:text-yellow-400">
                      {selectedProduct.rating}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedProduct.reviews} {t.reviews}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-4 w-4" />
                    <span className="ml-1 text-sm">{selectedProduct.duration}</span>
                  </div>
                </div>

                <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedProduct.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedProduct.tags?.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={`text-xs rounded-full ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Tier Selection */}
                <div className="mt-5">
                  <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>
                    {t.choosePackage}
                  </h4>
                  <div className="space-y-2">
                    {selectedProduct.tiers.map((tier) => (
                      <button
                        key={tier.name}
                        onClick={() => {
                          ultraAudio.playClick();
                          setSelectedTier(tier.name);
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${
                          selectedTier === tier.name
                            ? `border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 shadow-lg`
                            : isDarkMode
                              ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                              : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>
                            {tier.name}
                          </span>
                          <span className="text-orange-600 font-bold text-lg">
                            Rp {tier.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {tier.features.slice(0, 3).map((feature, idx) => (
                            <li 
                              key={idx} 
                              className={`text-xs flex items-center ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className={`w-full mt-6 h-14 bg-gradient-to-r ${getThemeGradient()} hover:opacity-90 rounded-xl font-semibold shadow-lg active:scale-[0.98] transition-all text-lg`}
                  onClick={handleAddToCart}
                  disabled={addedToCart === `${selectedProduct.id}-${selectedTier}` || !selectedTier}
                >
                  {addedToCart === `${selectedProduct.id}-${selectedTier}` ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      {t.added}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t.addToCart}
                    </>
                  )}
                </Button>

                {/* Reviews Link */}
                <button
                  onClick={() => {
                    setShowProductDialog(false);
                    navigate(`/reviews/${selectedProduct.id}`);
                  }}
                  className="w-full mt-3 text-center text-sm text-orange-500 font-medium hover:underline"
                >
                  {t.viewReviews}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Card Component - Ultra Detail
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isInCart: boolean;
  isFav: boolean;
  onFavorite: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  variant: 'horizontal' | 'vertical';
  isDarkMode: boolean;
  theme: string;
}

function ProductCard({ product, onClick, isInCart, isFav, onFavorite, style, variant, isDarkMode, theme }: ProductCardProps) {
  const price = product.discount_price || product.base_price || 0;
  const hasDiscount = product.discount_price && product.base_price && product.discount_price < product.base_price;
  const discountPercent = hasDiscount && product.base_price
    ? Math.round(((product.base_price - (product.discount_price || 0)) / product.base_price) * 100)
    : 0;

  const getThemeColor = () => {
    switch (theme) {
      case 'ocean': return 'text-blue-600';
      case 'sunset': return 'text-pink-600';
      case 'forest': return 'text-green-600';
      default: return 'text-orange-600';
    }
  };

  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`flex-shrink-0 w-44 cursor-pointer group animate-fade-in ${isDarkMode ? 'text-white' : ''}`}
        style={style}
      >
        <div className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group-active:scale-95 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Image */}
          <div className="relative aspect-square">
            <img
              src={product.icon}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Discount Badge */}
            {hasDiscount && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] shadow-lg">
                -{discountPercent}%
              </Badge>
            )}

            {/* Favorite Button */}
            <button
              onClick={onFavorite}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>

            {/* Cart Indicator */}
            {isInCart && (
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{product.rating}</span>
            </div>
            <div className="mt-2">
              <span className={`${getThemeColor()} font-bold text-sm`}>
                Rp {(price || 0).toLocaleString('id-ID')}
              </span>
              {hasDiscount && product.base_price && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  Rp {product.base_price.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group animate-fade-in ${isDarkMode ? 'text-white' : ''}`}
      style={style}
    >
      <div className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group-active:scale-[0.98] ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="relative aspect-square">
          <img
            src={product.icon}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 shadow-lg">
              -{discountPercent}%
            </Badge>
          )}

          <button
            onClick={onFavorite}
            className="absolute top-2 right-2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {isInCart && (
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
          )}

          {product.stock !== undefined && product.stock < 20 && (
            <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs">
              Stok Terbatas
            </Badge>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
          <p className={`text-xs line-clamp-2 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className={`${getThemeColor()} font-bold text-sm`}>
                Rp {(price || 0).toLocaleString('id-ID')}
              </span>
              {hasDiscount && product.base_price && (
                <span className={`text-xs line-through ml-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Rp {product.base_price.toLocaleString('id-ID')}
                </span>
              )}
            </div>
            <div className="flex items-center text-yellow-500 text-xs bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
              <Star className="h-3 w-3 fill-current" />
              <span className="ml-0.5 font-medium">{product.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
