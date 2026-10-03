import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Sparkles, Film } from 'lucide-react';
import { SITE_CONFIG } from '../data/config';
import { totalPhotos, totalVideos } from '../data/mediaLoader';
import MagneticButton from './MagneticButton';
import { soundManager } from '../utils/sound';

export default function Navbar({ onBirthdayClick, onOpenSecretLock }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDiscoveryToast, setShowDiscoveryToast] = useState(false);
  const clickTimestamps = React.useRef([]);

  // Lock body scroll while menu is open
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [menuOpen]);

  const toggleSound = () => {
    const playing = soundManager.toggle();
    setIsPlayingAudio(playing);
  };

  // Easter egg: 5 clicks on SANJANA within 2 seconds (Requirement 1)
  const handleLogoClick = (e) => {
    const now = Date.now();
    clickTimestamps.current = [...clickTimestamps.current, now].filter((t) => now - t <= 2000);

    if (clickTimestamps.current.length >= 5) {
      e.preventDefault();
      clickTimestamps.current = [];
      setShowDiscoveryToast(true);
    }
  };

  const navLinks = [
    { label: 'HOME',     href: '#hero',         desc: 'Opening cinematic reveal' },
    { label: 'PROLOGUE', href: '#introduction',  desc: 'Some moments deserve to be remembered' },
    { label: 'MOMENTS',  href: '#memories',      desc: 'Virtualized living memory stack' },
    { label: 'MOTION',   href: '#motion',        desc: 'Moments in motion — personal video archive' },
    { label: 'BIRTHDAY', href: '#birthday',      desc: 'October 04 — A special day' },
    { label: 'EPILOGUE', href: '#final-section', desc: 'Until the next memory' },
  ];

  const handleLinkClick = (href) => {
    setMenuOpen(false);
    const targetSelector = href === '#moments' ? '#memories' : href;
    const target = document.querySelector(targetSelector);
    if (target) {
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-12 py-4 sm:py-6 flex items-center justify-between pointer-events-none">
        {/* Left: SANJANA (with 5-click Easter Egg) */}
        <div className="pointer-events-auto">
          <a
            href="#hero"
            onClick={handleLogoClick}
            className="group flex items-center gap-2 sm:gap-3 cursor-pointer select-none py-2"
            title="Sanjana"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-display text-base sm:text-lg md:text-xl tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white font-light group-hover:text-gold transition-colors">
              {SITE_CONFIG.HER_NAME}
            </span>
          </a>
        </div>

        {/* Secret Discovery Toast (Requirement 1: "You found something... ENTER") */}
        <AnimatePresence>
          {showDiscoveryToast && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 left-4 sm:left-6 md:left-12 pointer-events-auto z-50 flex items-center gap-3.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#12121a]/95 backdrop-blur-xl border border-gold/50 shadow-[0_10px_35px_rgba(212,175,55,0.3)] select-none"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '4s' }} />
                <span className="font-serif italic text-xs sm:text-sm text-white/95">
                  You found something...
                </span>
              </div>

              <button
                onClick={() => {
                  setShowDiscoveryToast(false);
                  if (onOpenSecretLock) onOpenSecretLock();
                }}
                className="px-3.5 py-1 min-h-[36px] rounded-full bg-gold text-black font-sans text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-colors cursor-pointer active:scale-95 shadow-sm"
              >
                ENTER
              </button>

              <button
                onClick={() => setShowDiscoveryToast(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer text-xs ml-0.5 p-1"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Controls & Menu */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5 pointer-events-auto">
          {/* Quick Motion Link (Desktop only) */}
          <button
            onClick={() => handleLinkClick('#motion')}
            className="hidden md:flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full border border-white/20 bg-black/60 hover:bg-gold/10 hover:border-gold/40 text-white/80 hover:text-gold text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-widest">Motion</span>
          </button>

          {/* Birthday Pill (Desktop/Tablet only) */}
          {SITE_CONFIG.BIRTHDAY_TOUCH.enabled && (
            <button
              onClick={onBirthdayClick}
              className="hidden sm:flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold text-xs tracking-wider transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-sans text-[11px] uppercase tracking-widest">Special Day</span>
            </button>
          )}

          {/* Sound Toggle */}
          <MagneticButton
            onClick={toggleSound}
            ariaLabel="Toggle ambient soundtrack"
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full border border-white/20 bg-charcoal-900/60 backdrop-blur-md text-white/80 hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center cursor-pointer"
          >
            {isPlayingAudio ? (
              <div className="flex items-center gap-0.5">
                <span className="w-0.5 h-3 bg-gold animate-pulse" />
                <span className="w-0.5 h-4 bg-gold animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 h-2 bg-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <VolumeX className="w-4 h-4 text-white/60" />
            )}
          </MagneticButton>

          {/* MENU Button */}
          <MagneticButton
            id="nav-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            ariaLabel="Open navigation menu"
            className="min-h-[44px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 bg-charcoal-900/80 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-sans text-xs tracking-[0.2em] uppercase font-medium">
              {menuOpen ? 'CLOSE' : 'MENU'}
            </span>
            {menuOpen ? (
              <X className="w-3.5 h-3.5 text-gold" />
            ) : (
              <div className="flex flex-col gap-1 w-3.5">
                <span className="w-full h-[1.5px] bg-white group-hover:bg-gold transition-colors" />
                <span className="w-2/3 h-[1.5px] bg-white group-hover:bg-gold transition-colors ml-auto" />
              </div>
            )}
          </MagneticButton>
        </div>
      </header>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            data-lenis-prevent
            initial={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 60px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#0c0c0f] text-white flex flex-col justify-between p-6 sm:p-8 md:p-16 select-none overflow-y-auto overscroll-contain"
          >
            <div className="absolute right-10 bottom-10 font-display text-[15vw] leading-none text-white/[0.02] pointer-events-none select-none uppercase font-light">
              {SITE_CONFIG.HER_NAME}
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-6 pt-12 md:pt-4">
              <span className="text-xs uppercase tracking-widest text-gold font-sans">
                Exhibition Navigation
              </span>
              <span className="text-xs uppercase tracking-widest text-white/40 font-mono">
                {totalPhotos} Moments • {totalVideos} Living Motions
              </span>
            </div>

            <div className="my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 md:gap-x-12 max-w-5xl">
              {navLinks.map((item, idx) => (
                <div key={item.label} className="group">
                  <button
                    onClick={() => handleLinkClick(item.href)}
                    className="flex flex-col text-left w-full border-b border-white/5 pb-3 group-hover:border-gold/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-gold/60">0{idx + 1}</span>
                      <span className="font-display text-2xl md:text-4xl text-white/90 group-hover:text-gold group-hover:translate-x-3 transition-all duration-300 font-light">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-sans text-white/40 pl-8 group-hover:text-white/70 transition-colors mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-sans text-white/40">
              <div>
                Crafted for <span className="text-white font-medium">{SITE_CONFIG.HER_NAME}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-gold/80">{totalPhotos} Photographs</span>
                <span>•</span>
                <span className="text-gold/80">{totalVideos} Living Videos</span>
                <span>•</span>
                <span>Infinite Memories</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
