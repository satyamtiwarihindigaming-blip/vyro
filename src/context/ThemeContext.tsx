import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundEngine } from '../lib/soundEngine';
import { apiRequest } from '../lib/api';

export type ThemePreset =
  | 'obsidian'
  | 'amoled'
  | 'cyberpunk'
  | 'aurora'
  | 'pearl'
  | 'vedic';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  badge: string;
  description: string;
  bg: string;
  card: string;
  primary: string;
  accent: string;
  border: string;
  glow: string;
  text: string;
  previewGradient: string;
}

export const LUXURY_THEMES: Record<ThemePreset, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Titanium',
    badge: 'Apple Pro',
    description: 'Brushed space-gray titanium, frosted platinum glass & ice sapphire.',
    bg: '#090B10',
    card: 'rgba(18, 22, 34, 0.75)',
    primary: '#F1F5F9',
    accent: '#38BDF8',
    border: 'rgba(255, 255, 255, 0.12)',
    glow: 'rgba(56, 189, 248, 0.35)',
    text: '#F8FAFC',
    previewGradient: 'from-slate-900 via-slate-800 to-sky-500',
  },
  amoled: {
    id: 'amoled',
    name: 'Midnight AMOLED',
    badge: 'Samsung Ultra',
    description: '100% True-Black (0-nit) with vibrant electric cobalt & violet edge glow.',
    bg: '#000000',
    card: 'rgba(8, 8, 8, 0.85)',
    primary: '#3B82F6',
    accent: '#A855F7',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(59, 130, 246, 0.45)',
    text: '#FFFFFF',
    previewGradient: 'from-black via-zinc-950 to-blue-600',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    badge: 'VYRO Signature',
    description: 'Hyper violet, hot magenta neon & laser cyan synthwave aura.',
    bg: '#070A14',
    card: 'rgba(15, 23, 42, 0.8)',
    primary: '#8B5CF6',
    accent: '#EC4899',
    border: 'rgba(139, 92, 246, 0.3)',
    glow: 'rgba(236, 72, 153, 0.45)',
    text: '#F1F5F9',
    previewGradient: 'from-purple-950 via-fuchsia-900 to-cyan-500',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    badge: 'Emerald Velvet',
    description: 'Cosmic twilight teal, luminescent emerald & celestial indigo.',
    bg: '#040D10',
    card: 'rgba(7, 24, 30, 0.8)',
    primary: '#10B981',
    accent: '#6366F1',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: '#F0FDF4',
    previewGradient: 'from-teal-950 via-emerald-900 to-indigo-500',
  },
  pearl: {
    id: 'pearl',
    name: 'Pearl Champagne',
    badge: 'Daylight Luxe',
    description: 'Refined daylight porcelain ivory, rich midnight slate & champagne gold.',
    bg: '#0F172A',
    card: 'rgba(30, 41, 59, 0.85)',
    primary: '#F59E0B',
    accent: '#38BDF8',
    border: 'rgba(245, 158, 11, 0.25)',
    glow: 'rgba(245, 158, 11, 0.3)',
    text: '#F8FAFC',
    previewGradient: 'from-slate-900 via-amber-950 to-amber-500',
  },
  vedic: {
    id: 'vedic',
    name: 'Vedic Gold & Crimson',
    badge: 'Royal Heritage',
    description: 'Sacred 24K temple gold, deep crimson saffron & divine Devnagari vibe.',
    bg: '#100507',
    card: 'rgba(32, 10, 16, 0.85)',
    primary: '#F59E0B',
    accent: '#EF4444',
    border: 'rgba(245, 158, 11, 0.35)',
    glow: 'rgba(245, 158, 11, 0.5)',
    text: '#FFFBEB',
    previewGradient: 'from-red-950 via-amber-900 to-amber-400',
  },
};

interface ThemeContextType {
  currentTheme: ThemePreset;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemePreset) => void;
  isThemePickerOpen: boolean;
  openThemePicker: () => void;
  closeThemePicker: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemePreset>('cyberpunk');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // Apply CSS custom properties dynamically to :root
  const applyThemeToDOM = (theme: ThemePreset) => {
    const config = LUXURY_THEMES[theme] || LUXURY_THEMES.cyberpunk;
    const root = document.documentElement;

    root.style.setProperty('--vyro-bg', config.bg);
    root.style.setProperty('--vyro-card', config.card);
    root.style.setProperty('--vyro-primary', config.primary);
    root.style.setProperty('--vyro-accent', config.accent);
    root.style.setProperty('--vyro-border', config.border);
    root.style.setProperty('--vyro-glow', config.glow);
    root.style.setProperty('--vyro-text', config.text);

    // Toggle AMOLED edge glow class
    if (theme === 'amoled') {
      root.classList.add('theme-amoled-active');
    } else {
      root.classList.remove('theme-amoled-active');
    }

    root.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('vyro_theme_preset') as ThemePreset | null;
    if (saved && LUXURY_THEMES[saved]) {
      setCurrentThemeState(saved);
      applyThemeToDOM(saved);
    } else {
      applyThemeToDOM('cyberpunk');
    }
  }, []);

  const setTheme = (theme: ThemePreset) => {
    if (!LUXURY_THEMES[theme]) return;
    soundEngine.playHapticClick();
    setCurrentThemeState(theme);
    localStorage.setItem('vyro_theme_preset', theme);
    applyThemeToDOM(theme);

    // Sync to user profile on backend if logged in
    apiRequest('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({ themePreference: theme }),
    }).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig: LUXURY_THEMES[currentTheme],
        setTheme,
        isThemePickerOpen,
        openThemePicker: () => setIsThemePickerOpen(true),
        closeThemePicker: () => setIsThemePickerOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
