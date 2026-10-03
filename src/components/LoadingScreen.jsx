import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_CONFIG } from '../data/config';
import { totalPhotos } from '../data/mediaLoader';
import { soundManager } from '../utils/sound';

export default function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(Math.min(totalPhotos, 30));
  const [showBegin, setShowBegin] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 2) {
          clearInterval(interval);
          setShowBegin(true);
          return 1;
        }
        return prev - 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleBegin = () => {
    soundManager.playChime();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 850);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0, filter: 'blur(16px)' } : { opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] text-[#f4efe6] select-none overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
        {/* Name: SANJANA */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display tracking-[0.35em] text-3xl md:text-5xl uppercase font-light text-[#f7f3eb] mb-3"
        >
          {SITE_CONFIG.HER_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif italic text-base md:text-lg text-gold/80 tracking-widest uppercase mb-12"
        >
          {totalPhotos} moments • Motion Archive
        </motion.p>

        <div className="h-28 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!showBegin ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(6px)' }}
                className="flex items-baseline gap-2 font-display text-5xl md:text-7xl font-extralight text-white/90"
              >
                <span>{String(count).padStart(2, '0')}</span>
                <span className="text-xs uppercase tracking-widest text-white/40 font-sans">
                  / {String(totalPhotos).padStart(2, '0')}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="begin-button"
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <button
                  id="begin-experience-btn"
                  onClick={handleBegin}
                  className="group relative px-8 py-3.5 border border-gold/40 hover:border-gold rounded-full bg-gold/5 hover:bg-gold/15 backdrop-blur-md transition-all duration-300 shadow-[0_0_30px_-5px_rgba(212,175,55,0.25)] cursor-pointer"
                >
                  <span className="relative z-10 font-sans text-xs md:text-sm tracking-[0.3em] uppercase text-white font-medium group-hover:text-gold transition-colors">
                    Begin Experience
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showBegin && (
          <button
            onClick={handleBegin}
            className="mt-8 text-[11px] tracking-widest uppercase text-white/30 hover:text-white/70 transition-colors font-sans cursor-pointer"
          >
            Skip Intro →
          </button>
        )}
      </div>
    </motion.div>
  );
}
