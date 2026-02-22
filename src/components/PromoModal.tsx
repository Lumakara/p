import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, ChevronLeft, X, Truck, Shield, 
  Sparkles, Percent
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';

const promoSlides = [
  {
    id: 1,
    icon: Percent,
    title: 'Diskon Spesial 20%',
    subtitle: 'Untuk pembelian pertama',
    description: 'Gunakan kode FIRST20 saat checkout dan nikmati diskon 20% untuk pembelian pertama Anda. Berlaku untuk semua produk!',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    buttonColor: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    id: 2,
    icon: Truck,
    title: 'Gratis Instalasi',
    subtitle: 'Minimal pembelian Rp 500rb',
    description: 'Dapatkan layanan instalasi GRATIS untuk pembelian minimal Rp 500.000. Tim profesional kami siap membantu instalasi!',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 3,
    icon: Shield,
    title: 'Garansi 30 Hari',
    subtitle: '100% uang kembali',
    description: 'Kami memberikan garansi 30 hari untuk semua layanan. Jika tidak puas, uang Anda kembali 100% tanpa syarat!',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    buttonColor: 'bg-green-500 hover:bg-green-600',
  },
];

export function PromoModal() {
  const { hasSeenPromo, setHasSeenPromo, language } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        ultraAudio.playOpen();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenPromo]);

  const handleClose = useCallback(() => {
    ultraAudio.playClose();
    setIsOpen(false);
    setHasSeenPromo(true);
  }, [setHasSeenPromo]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    
    ultraAudio.playSwipe();
    setIsAnimating(true);
    setDirection('right');
    
    if (currentSlide < promoSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleClose();
    }
    
    setTimeout(() => setIsAnimating(false), 400);
  }, [currentSlide, isAnimating, handleClose]);

  const handlePrev = useCallback(() => {
    if (isAnimating || currentSlide === 0) return;
    
    ultraAudio.playSwipe();
    setIsAnimating(true);
    setDirection('left');
    setCurrentSlide((prev) => prev - 1);
    
    setTimeout(() => setIsAnimating(false), 400);
  }, [currentSlide, isAnimating]);

  const handleSkip = useCallback(() => {
    ultraAudio.playClick();
    handleClose();
  }, [handleClose]);

  const currentData = promoSlides[currentSlide];
  const Icon = currentData.icon;

  const text = language === 'id' 
    ? { skip: 'Lewati', next: 'Selanjutnya', start: 'Mulai Belanja' }
    : { skip: 'Skip', next: 'Next', start: 'Start Shopping' };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <div 
          className={`relative bg-gradient-to-br ${currentData.bgColor} rounded-2xl overflow-hidden`}
          style={{ minHeight: '500px' }}
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 active:scale-95 hover:rotate-90"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Progress Dots */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            {promoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setDirection(index > currentSlide ? 'right' : 'left');
                    setCurrentSlide(index);
                    ultraAudio.playClick();
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? `w-8 bg-gradient-to-r ${currentData.color}` 
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="pt-20 pb-8 px-6 flex flex-col items-center">
            {/* Icon with Animation */}
            <div 
              className={`relative mb-8 transition-all duration-400 ${
                isAnimating 
                  ? direction === 'right' 
                    ? 'opacity-0 -translate-x-10' 
                    : 'opacity-0 translate-x-10'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {/* Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentData.color} rounded-3xl blur-2xl opacity-30 animate-pulse`} />
              
              {/* Icon Container */}
              <div 
                className={`relative w-32 h-32 rounded-3xl bg-gradient-to-r ${currentData.color} flex items-center justify-center shadow-2xl`}
                style={{
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                <Icon className="w-16 h-16 text-white" />
                
                {/* Sparkles */}
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div 
              className={`text-center transition-all duration-400 delay-100 ${
                isAnimating 
                  ? direction === 'right' 
                    ? 'opacity-0 -translate-x-10' 
                    : 'opacity-0 translate-x-10'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${currentData.color} bg-clip-text text-transparent mb-2`}>
                {currentData.title}
              </h2>
              <p className="text-gray-600 font-medium mb-4">
                {currentData.subtitle}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {currentData.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/50 to-transparent">
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-2 border-gray-200 hover:bg-white hover:border-gray-300 transition-all active:scale-95"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  {language === 'id' ? 'Kembali' : 'Back'}
                </Button>
              )}
              <Button
                className={`flex-1 h-14 rounded-2xl ${currentData.buttonColor} text-white shadow-lg hover:shadow-xl transition-all active:scale-95 text-lg font-semibold`}
                onClick={handleNext}
              >
                {currentSlide === promoSlides.length - 1 ? text.start : text.next}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>

            {/* Skip Text */}
            {currentSlide < promoSlides.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-center text-gray-400 text-sm hover:text-gray-600 transition-colors font-medium"
              >
                {text.skip}
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(3deg); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
