import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Palette } from 'lucide-react';
import { useTheme, LUXURY_THEMES, ThemePreset } from '../../context/ThemeContext';
import { soundEngine } from '../../lib/soundEngine';

export const ThemeSelectorModal: React.FC = () => {
  const { currentTheme, setTheme, isThemePickerOpen, closeThemePicker } = useTheme();

  if (!isThemePickerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-xl liquid-glass-elevated rounded-[30px] p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-vyro-primary to-vyro-accent text-white shadow-glow-pink">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Flagship Luxury Themes
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-vyro-primary/20 text-vyro-accent font-bold uppercase">
                  Available to All
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Switch instant hardware-tier color grading & AMOLED contrast
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playHapticClick();
              closeThemePicker();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar p-1">
          {Object.values(LUXURY_THEMES).map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => setTheme(theme.id as ThemePreset)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
                  isSelected
                    ? 'border-vyro-primary bg-white/10 shadow-[0_0_20px_rgba(139,92,246,0.35)] scale-[1.02]'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                {/* Preview Gradient Stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.previewGradient}`}
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {theme.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-vyro-primary flex items-center justify-center text-white text-xs shadow-glow-purple">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-vyro-accent transition">
                    {theme.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.bg }}
                    title="Background"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.primary }}
                    title="Primary"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                    title="Accent"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.border }}
                    title="Border"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
