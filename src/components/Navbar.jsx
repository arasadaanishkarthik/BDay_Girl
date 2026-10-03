import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Sparkles, Film } from 'lucide-react';
import { SITE_CONFIG } from '../data/config';
import { totalPhotos, totalVideos } from '../data/mediaLoader';
import MagneticButton from './MagneticButton';
import { soundManager } from '../utils/sound';

export default function Navbar({ onBirthdayClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSound = () => {
    const playing = soundManager.toggle();
    setIsPlayingAudio(playing);
  };

  const navLinks = [
    { label: 'HOME', href: '#hero', desc: 'Opening cinematic reveal' },
    { label: 'PROLOGUE', href: '#introduction', desc: 'Some moments deserve to be remembered' },
    { label: 'MEMORIES', href: '#memories', desc: 'Virtualized living memory stack' },
    { label: 'MOTION', href: '#motion', desc: 'Moments in motion — personal video archive' },
    { label: 'TIMELINE', href: '#timeline', desc: 'Interwoven photo & video visual story' },
    { label: 'EDITORIAL', href: '#horizontal-gallery', desc: 'High-fashion runway strip' },
    { label: 'SCRAPBOOK', href: '#birthday-story', desc: 'Personal reflections & celebration' },
    { label: 'EPILOGUE', href: '#final-section', desc: 'Until the next memory' },
  ];

  const handleLinkClick = (href) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-none">
        {/* Left: SANJANA */}
        <div className="pointer-events-auto">
          <a
            href="#hero"
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-display text-lg md:text-xl tracking-[0.25em] uppercase text-white font-light group-hover:text-gold transition-colors">
              {SITE_CONFIG.HER_NAME}
            </span>
          </a>
        </div>

        {/* Right: Controls & Menu */}
        <div className="flex items-center gap-3 md:gap-5 pointer-events-auto">
          {/* Quick Motion Link */}
          <button
            onClick={() => handleLinkClick('#motion')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-black/60 hover:bg-gold/10 hover:border-gold/40 text-white/80 hover:text-gold text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-widest">Motion</span>
          </button>

          {/* Birthday Pill */}
          {SITE_CONFIG.BIRTHDAY_TOUCH.enabled && (
            <button
              onClick={onBirthdayClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold text-xs tracking-wider transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-sans text-[11px] uppercase tracking-widest">Special Day</span>
            </button>
          )}

          {/* Sound Toggle */}
          <MagneticButton
            onClick={toggleSound}
            ariaLabel="Toggle ambient soundtrack"
            className="w-10 h-10 rounded-full border border-white/20 bg-charcoal-900/60 backdrop-blur-md text-white/80 hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center cursor-pointer"
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
            className="px-5 py-2.5 rounded-full border border-white/20 bg-charcoal-900/80 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center gap-2 group cursor-pointer"
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
            initial={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 60px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#0c0c0f] text-white flex flex-col justify-between p-8 md:p-16 select-none overflow-y-auto"
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
