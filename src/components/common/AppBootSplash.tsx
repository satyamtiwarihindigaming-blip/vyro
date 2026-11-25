import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '../../lib/soundEngine';

interface AppBootSplashProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const AppBootSplash: React.FC<AppBootSplashProps> = ({ forceShow = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    // Only play on fresh session or when explicitly requested
    const hasBooted = sessionStorage.getItem('vyro_boot_sequence_v2');
    if (!hasBooted || forceShow) {
      setIsVisible(true);
      sessionStorage.setItem('vyro_boot_sequence_v2', 'true');

      // Trigger PlayStation/Apple-tier 55Hz sub-bass and crystal chime sound signature
      try {
        soundEngine.playCinematicBootSound();
      } catch {
        // Audio might need first user interaction on some mobile browsers
      }

      // Stage Timeline
      const t1 = setTimeout(() => setStage(2), 450);  // Laser vector drawing
      const t2 = setTimeout(() => setStage(3), 1100); // Core ignition & letter expansion
      const t3 = setTimeout(() => setStage(4), 1800); // Iris zoom & fade
      const t4 = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2300);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [forceShow, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden"
          title="Click anywhere to skip intro"
        >
          {/* Subtle Ambient Nebula Glow in Background */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: stage >= 3 ? 1.4 : 1,
              opacity: stage >= 2 ? 0.35 : 0.15,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan blur-[120px] pointer-events-none"
          />

          {/* Central Insignia Canvas */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              {/* Radial shockwave pulse on stage 3 */}
              {stage >= 3 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-vyro-cyan/80 pointer-events-none"
                />
              )}

              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]"
              >
                <defs>
                  <linearGradient id="boot-wing-grad" x1="10" y1="12" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E2E8F0" />
                    <stop offset="0.5" stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#EC4899" />
                  </linearGradient>
                  <linearGradient id="boot-core-grad" x1="54" y1="12" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="0.5" stopColor="#06B6D4" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>

                {/* Left Aerodynamic Wing Animated Draw */}
                <motion.path
                  d="M10 14L32 54L27 54L6 18C5.5 17 6 14 8 14H10Z"
                  fill="url(#boot-wing-grad)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Right Aerodynamic Wing Animated Draw */}
                <motion.path
                  d="M54 14L32 54L37 54L58 18C58.5 17 58 14 56 14H54Z"
                  fill="url(#boot-core-grad)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Inner Optical Prism */}
                <motion.path
                  d="M19 16L32 44L25 44L15 21C14 20 15 17 17 16H19Z"
                  fill="#F43F5E"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: stage >= 2 ? 0.95 : 0, scale: stage >= 2 ? 1 : 0.8 }}
                  transition={{ duration: 0.4 }}
                />

                <motion.path
                  d="M45 16L32 44L39 44L49 21C50 20 49 17 47 16H45Z"
                  fill="#A855F7"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: stage >= 2 ? 0.95 : 0, scale: stage >= 2 ? 1 : 0.8 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Core Laser Node Ignition */}
                <motion.circle
                  cx="32"
                  cy="27"
                  r="6"
                  fill="#00F0FF"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: stage >= 3 ? [1, 1.4, 1.1] : 0,
                    opacity: stage >= 3 ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="32"
                  cy="27"
                  r="3"
                  fill="#FFFFFF"
                  initial={{ scale: 0 }}
                  animate={{ scale: stage >= 3 ? 1 : 0 }}
                />
              </svg>
            </div>

            {/* Kinetic Typographic Wordmark: V Y R O */}
            <motion.div
              initial={{ opacity: 0, y: 16, letterSpacing: '0.6em' }}
              animate={{
                opacity: stage >= 3 ? 1 : 0,
                y: stage >= 3 ? 0 : 16,
                letterSpacing: stage >= 3 ? '0.3em' : '0.6em',
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-col items-center text-center"
            >
              <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-vyro-accent tracking-widest pl-2">
                VYRO
              </h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 3 ? 0.8 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[11px] uppercase tracking-[0.4em] text-vyro-cyan font-bold mt-1.5 pl-1"
              >
                1B CREATOR PLATFORM • OS
              </motion.span>
            </motion.div>
          </div>

          {/* Skip Hint */}
          <div className="absolute bottom-8 text-[11px] text-slate-500 font-medium tracking-wider">
            TAP ANYWHERE TO ENTER
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
