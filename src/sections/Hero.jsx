import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_CONFIG } from '../data/config';
import { heroPhoto } from '../data/mediaLoader';
import MagneticButton from '../components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

/**
 * Ultra-Lightweight Cinematic Hero (Section 14 & 23):
 * - Loads only ONE optimized image initially
 * - Standard browser cursor
 * - GPU transform parallax
 */
export default function Hero({ onSelectPhoto }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // heroPhoto is pre-assigned by the central registry (photo index 0)

  useEffect(() => {
    const container = containerRef.current;
    const img = imageRef.current;
    const txt = textRef.current;

    if (!container || !img) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    tl.to(img, {
      yPercent: 18,
      scale: 1.08,
      ease: 'none',
    }, 0);

    if (txt) {
      tl.to(txt, {
        yPercent: -30,
        opacity: 0.15,
        ease: 'none',
      }, 0);
    }

    return () => {
      tl.kill();
    };
  }, []);

  const titleLetters = SITE_CONFIG.HER_NAME.split('');
  const subtitleLetters = SITE_CONFIG.SUBTITLE.split('');

  const handleScrollDown = () => {
    const introSection = document.querySelector('#introduction');
    if (introSection) {
      introSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-[100svh] h-[100svh] overflow-hidden flex flex-col justify-between items-center bg-[#09090b] text-white select-none"
    >
      {/* Background Hero Image with Progressive Blur-Up & GPU Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {heroPhoto?.blur && (
          <img
            src={heroPhoto.blur}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 pointer-events-none transition-opacity duration-700 ${
              heroLoaded ? 'opacity-0' : 'opacity-80'
            }`}
          />
        )}

        {heroPhoto && (
          <picture>
            <source media="(min-width: 1024px)" srcSet={heroPhoto.large || heroPhoto.src} type="image/webp" />
            <source media="(max-width: 1023px)" srcSet={heroPhoto.medium || heroPhoto.src} type="image/webp" />
            <img
              ref={imageRef}
              src={heroPhoto.medium || heroPhoto.src}
              alt={SITE_CONFIG.HER_NAME}
              loading="eager"
              decoding="async"
              onLoad={() => setHeroLoaded(true)}
              onClick={() => onSelectPhoto && onSelectPhoto(heroPhoto)}
              className={`w-full h-full object-cover object-center cursor-pointer will-change-transform transform-gpu transition-opacity duration-700 ${
                heroLoaded ? 'opacity-85' : 'opacity-0'
              }`}
            />
          </picture>
        )}

        {/* Dark Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/40 to-black/60 pointer-events-none" />
      </div>

      {/* Top spacing placeholder */}
      <div className="h-20 sm:h-24 w-full" />

      {/* Center Typography Letter-by-Letter for SANJANA */}
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl will-change-transform transform-gpu"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
        >
          <span className="w-6 sm:w-8 h-[1px] bg-gold/60" />
          <span className="font-serif italic text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.25em] text-gold uppercase">
            A Living Digital Exhibition
          </span>
          <span className="w-6 sm:w-8 h-[1px] bg-gold/60" />
        </motion.div>

        {/* Her Name: SANJANA */}
        <h1 className="font-display font-light text-4xl sm:text-6xl md:text-8xl lg:text-9xl uppercase tracking-[0.16em] sm:tracking-[0.25em] text-[#faf6ee] drop-shadow-2xl overflow-hidden flex flex-wrap justify-center">
          {titleLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3 + index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block hover:text-gold transition-colors duration-300"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p className="font-serif italic text-base sm:text-lg md:text-2xl text-white/80 tracking-widest mt-4 drop-shadow flex flex-wrap justify-center">
          {subtitleLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.6 + index * 0.02,
                ease: 'easeOut',
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.p>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="relative z-10 pb-10 flex flex-col items-center">
        <MagneticButton
          onClick={handleScrollDown}
          ariaLabel="Scroll down to explore"
          className="flex flex-col items-center gap-2 group text-white/60 hover:text-gold transition-colors cursor-pointer"
        >
          <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase font-light">
            Scroll to explore
          </span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-lg md:text-xl text-gold"
          >
            ↓
          </motion.span>
        </MagneticButton>
      </div>
    </section>
  );
}
