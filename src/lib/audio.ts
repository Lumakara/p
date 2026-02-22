// Ultra Audio Service - iOS Style Experience
class UltraAudioService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgMusic: HTMLAudioElement | null = null;
  private isInitialized = false;
  private currentTrack = 0;
  private volume = 0.5;
  private isMuted = false;

  // Premium sound effects - High quality from reliable CDN
  private readonly SOUND_URLS = {
    // UI Interactions
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    tap: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
    warning: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    
    // Modal & Navigation
    pop: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    open: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
    close: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
    swipe: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
    slide: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
    
    // Cart & Shopping
    addToCart: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    remove: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    checkout: 'https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3',
    coin: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
    
    // Interactive
    toggle: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
    typing: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    whoosh: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3',
    
    // Payment
    paymentSuccess: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    paymentProcessing: 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3',
    
    // Special Effects
    achievement: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    magic: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
    sparkle: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    heart: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3',
    send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    refresh: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  };

  // Background music tracks - Ambient & Modern
  private readonly MUSIC_URLS = [
    'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    'https://assets.mixkit.co/music/preview/mixkit-ambient-piano-1065.mp3',
    'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-1207.mp3',
  ];

  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Preload critical sounds
      const criticalSounds = ['click', 'success', 'error', 'pop', 'addToCart'];
      criticalSounds.forEach((key) => {
        const url = this.SOUND_URLS[key as keyof typeof this.SOUND_URLS];
        if (url) {
          const audio = new Audio(url);
          audio.volume = this.getVolumeForSound(key);
          audio.preload = 'auto';
          this.sounds.set(key, audio);
        }
      });

      // Initialize background music
      this.bgMusic = new Audio(this.MUSIC_URLS[0]);
      this.bgMusic.volume = 0.08;
      this.bgMusic.loop = false;
      this.bgMusic.addEventListener('ended', () => this.playNextTrack());

      this.isInitialized = true;
      console.log('🎵 Ultra Audio Service Initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private getVolumeForSound(soundName: string): number {
    const volumes: Record<string, number> = {
      click: 0.3,
      tap: 0.25,
      success: 0.5,
      error: 0.4,
      warning: 0.35,
      notification: 0.4,
      pop: 0.3,
      open: 0.25,
      close: 0.25,
      swipe: 0.2,
      slide: 0.2,
      addToCart: 0.45,
      remove: 0.3,
      checkout: 0.5,
      coin: 0.35,
      toggle: 0.25,
      typing: 0.15,
      whoosh: 0.3,
      paymentSuccess: 0.6,
      paymentProcessing: 0.4,
      achievement: 0.55,
      magic: 0.45,
      sparkle: 0.35,
      heart: 0.4,
      send: 0.35,
      refresh: 0.3,
    };
    return volumes[soundName] || 0.3;
  }

  private loadSound(name: string): HTMLAudioElement | null {
    if (this.sounds.has(name)) {
      return this.sounds.get(name)!;
    }
    
    const url = this.SOUND_URLS[name as keyof typeof this.SOUND_URLS];
    if (!url) return null;
    
    const audio = new Audio(url);
    audio.volume = this.getVolumeForSound(name);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
    return audio;
  }

  private playSound(name: string) {
    if (this.isMuted || !this.isSoundEnabled()) return;
    
    if (!this.isInitialized) this.initialize();
    
    const sound = this.sounds.get(name) || this.loadSound(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore autoplay restrictions
      });
    }
  }

  // Public sound methods
  playClick() { this.playSound('click'); }
  playTap() { this.playSound('tap'); }
  playSuccess() { this.playSound('success'); }
  playError() { this.playSound('error'); }
  playWarning() { this.playSound('warning'); }
  playNotification() { this.playSound('notification'); }
  playPop() { this.playSound('pop'); }
  playOpen() { this.playSound('open'); }
  playClose() { this.playSound('close'); }
  playSwipe() { this.playSound('swipe'); }
  playSlide() { this.playSound('slide'); }
  playAddToCart() { this.playSound('addToCart'); }
  playRemove() { this.playSound('remove'); }
  playCheckout() { this.playSound('checkout'); }
  playCoin() { this.playSound('coin'); }
  playToggle() { this.playSound('toggle'); }
  playTyping() { this.playSound('typing'); }
  playWhoosh() { this.playSound('whoosh'); }
  playPaymentSuccess() { this.playSound('paymentSuccess'); }
  playPaymentProcessing() { this.playSound('paymentProcessing'); }
  playAchievement() { this.playSound('achievement'); }
  playMagic() { this.playSound('magic'); }
  playSparkle() { this.playSound('sparkle'); }
  playHeart() { this.playSound('heart'); }
  playSend() { this.playSound('send'); }
  playRefresh() { this.playSound('refresh'); }

  // Haptic feedback for mobile
  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 100, 50],
        warning: [30, 50, 30, 50, 30],
      };
      navigator.vibrate(patterns[type]);
    }
  }

  // Background Music Control
  playBackgroundMusic() {
    if (!this.isInitialized) this.initialize();
    if (this.bgMusic && !this.isMuted) {
      this.bgMusic.play().catch(() => {});
    }
  }

  pauseBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  private playNextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.MUSIC_URLS.length;
    if (this.bgMusic) {
      this.bgMusic.src = this.MUSIC_URLS[this.currentTrack];
      this.bgMusic.play().catch(() => {});
    }
  }

  setMusicVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.volume * 0.15;
    }
  }

  mute() {
    this.isMuted = true;
    this.pauseBackgroundMusic();
  }

  unmute() {
    this.isMuted = false;
  }

  // Check if sound is enabled in store
  private isSoundEnabled(): boolean {
    try {
      const store = localStorage.getItem('digital-store-v3');
      if (store) {
        const data = JSON.parse(store);
        return data.state?.soundEnabled !== false;
      }
    } catch {}
    return true;
  }

  // Check if music is enabled in store
  isMusicEnabled(): boolean {
    try {
      const store = localStorage.getItem('digital-store-v3');
      if (store) {
        const data = JSON.parse(store);
        return data.state?.musicEnabled === true;
      }
    } catch {}
    return false;
  }
}

export const ultraAudio = new UltraAudioService();

// Backward compatibility
export const audioService = ultraAudio;
export const useUltraAudio = () => ultraAudio;
