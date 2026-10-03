import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Gift } from 'lucide-react';
import { SITE_CONFIG } from '../data/config';
import { photos } from '../data/mediaLoader';
import MagneticButton from './MagneticButton';
import { soundManager } from '../utils/sound';

export default function StoryBirthdaySection({ onSelectPhoto }) {
  const [wished, setWished] = useState(false);

  // Take 4 scrapbook photos dynamically
  const scrapbookPhotos = photos.slice(0, Math.min(4, photos.length));

  const triggerCelebration = () => {
    soundManager.playChime();
    setWished(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#d4af37', '#f3e5ab', '#ffffff', '#e6ca65', '#b4838f'],
      disableForReducedMotion: true,
    });
  };

  return (
    <section
      id="birthday-story"
      className="relative w-full py-28 md:py-44 bg-[#0d0d12] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
              {SITE_CONFIG.BIRTHDAY_TOUCH.tagline}
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight">
            {SITE_CONFIG.BIRTHDAY_TOUCH.heading}
          </h2>

          <p className="font-serif italic text-white/70 max-w-2xl text-base md:text-xl mt-4 leading-relaxed">
            "{SITE_CONFIG.BIRTHDAY_TOUCH.message}"
          </p>
        </div>

        {/* Digital Scrapbook Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {scrapbookPhotos.map((photo, idx) => {
            const rotations = [-2.5, 2, -1.8, 2.5];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={`scrap-${photo.id}`}
                style={{ transform: `rotate(${rot}deg)` }}
                onClick={() => onSelectPhoto && onSelectPhoto(photo)}
                className="relative bg-[#fcfaf7] text-neutral-800 p-3 pb-8 rounded-sm shadow-2xl transition-transform duration-300 hover:scale-103 cursor-pointer group"
              >
                {/* Vintage Washi Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-100/60 backdrop-blur-sm border-t border-b border-amber-300/30 rotate-2 pointer-events-none shadow-sm" />

                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 rounded-[1px]">
                  <picture>
                    <source media="(min-width: 1024px)" srcSet={photo.medium || photo.src} type="image/webp" />
                    <img
                      src={photo.thumbnail || photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                  </picture>
                </div>

                <div className="mt-4 px-2 text-center">
                  <span className="font-editorial-italic text-sm text-neutral-700 block">
                    {photo.title}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                    Memory 0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wish Box */}
        <div className="flex flex-col items-center justify-center p-8 md:p-12 rounded-2xl bg-gradient-to-b from-[#181824] to-[#12121a] border border-gold/20 text-center max-w-2xl mx-auto shadow-2xl">
          <Gift className="w-8 h-8 text-gold mb-3" />
          <h3 className="font-display text-2xl md:text-3xl text-white font-light">
            A Wish for You, {SITE_CONFIG.HER_NAME}
          </h3>
          <p className="font-serif italic text-white/60 text-sm md:text-base mt-2 mb-6">
            {SITE_CONFIG.BIRTHDAY_TOUCH.wish}
          </p>

          <MagneticButton
            onClick={triggerCelebration}
            ariaLabel="Celebrate Birthday Wish"
            className="px-8 py-3.5 rounded-full border border-gold bg-gold hover:bg-gold-light text-black font-sans text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black group-hover:rotate-45 transition-transform" />
            <span>{wished ? 'Wishes Sent! ✧' : 'Celebrate Moment ✧'}</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
