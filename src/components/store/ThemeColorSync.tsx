"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { ultraAudio } from "@/services/audio";

const THEME_COLORS: Record<string, { primary: string; ring: string }> = {
  // HSL values matching globals.css --primary
  default: { primary: "24 95% 53%", ring: "24 95% 53%" },
  ocean: { primary: "199 89% 48%", ring: "199 89% 48%" },
  sunset: { primary: "12 90% 55%", ring: "12 90% 55%" },
  forest: { primary: "160 84% 39%", ring: "160 84% 39%" },
};

/** Applies the selected color scheme to CSS vars and manages background music. */
export function ThemeColorSync() {
  const themeColor = useAppStore((s) => s.themeColor);
  const musicEnabled = useAppStore((s) => s.musicEnabled);

  useEffect(() => {
    const root = document.documentElement;
    const c = THEME_COLORS[themeColor] || THEME_COLORS.default;
    root.style.setProperty("--primary", c.primary);
    root.style.setProperty("--ring", c.ring);
  }, [themeColor]);

  useEffect(() => {
    try {
      ultraAudio.initialize?.();
      if (musicEnabled) ultraAudio.playBackgroundMusic?.();
      else ultraAudio.pauseBackgroundMusic?.();
    } catch {
      /* audio is best-effort */
    }
    return () => {
      try {
        ultraAudio.stopBackgroundMusic?.();
      } catch {
        /* noop */
      }
    };
  }, [musicEnabled]);

  return null;
}
