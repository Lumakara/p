import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';
import { ShoppingBag } from 'lucide-react';

export function WelcomeScreen() {
  const { setIsAppLoading, language } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [logoScale, setLogoScale] = useState(0.5);
  const [textOpacity, setTextOpacity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#f97316', '#fb923c', '#fdba74', '#3b82f6', '#60a5fa'];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    // Logo entrance animation
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
      ultraAudio.playPop();
    }, 200);

    // Logo scale animation
    const scaleInterval = setInterval(() => {
      setLogoScale((prev) => {
        if (prev >= 1) {
          clearInterval(scaleInterval);
          return 1;
        }
        return prev + 0.05;
      });
    }, 30);

    // Text fade in
    const textTimer = setTimeout(() => {
      setTextOpacity(1);
    }, 600);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Easing function
        const remaining = 100 - prev;
        const increment = Math.max(0.5, remaining * 0.08);
        return Math.min(100, prev + increment);
      });
    }, 40);

    // Complete loading
    const completeTimer = setTimeout(() => {
      ultraAudio.playSuccess();
      setIsAppLoading(false);
    }, 3000);

    return () => {
      clearTimeout(logoTimer);
      clearInterval(scaleInterval);
      clearTimeout(textTimer);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [setIsAppLoading]);

  const text = language === 'id' 
    ? { loading: 'Memuat...', ready: 'Siap!' }
    : { loading: 'Loading...', ready: 'Ready!' };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white/20 animate-ping"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* Logo Container */}
      <div 
        className="relative transition-all duration-500"
        style={{
          transform: `scale(${logoScale})`,
          opacity: showLogo ? 1 : 0,
        }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-white/40 rounded-3xl blur-3xl scale-150 animate-pulse" />
        
        {/* Rotating Ring */}
        <div className="absolute -inset-4 border-2 border-white/30 rounded-3xl animate-spin" 
          style={{ animationDuration: '3s' }} 
        />
        
        {/* Logo Box */}
        <div className="relative w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-transparent" />
          <ShoppingBag className="w-14 h-14 text-orange-500 relative z-10" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" 
            style={{ animation: 'shimmer 2s infinite' }}
          />
        </div>
        
        {/* Floating particles around logo */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-float"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* Store Name */}
      <div 
        className="mt-8 text-center transition-all duration-700"
        style={{ opacity: textOpacity }}
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight">
          Digital Store
        </h1>
        <p className="text-white/90 text-sm mt-2 font-medium">
          {language === 'id' ? 'Belanja Cepat & Aman' : 'Fast & Safe Shopping'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 w-64 relative">
        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-white rounded-full transition-all duration-100 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-white/70 text-xs font-medium">
            {progress < 100 ? text.loading : text.ready}
          </p>
          <p className="text-white/70 text-xs font-mono">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/60 text-xs">
          © 2025 Digital Store
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
