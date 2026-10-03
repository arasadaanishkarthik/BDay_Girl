import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos, totalPhotos } from '../data/mediaLoader';

gsap.registerPlugin(ScrollTrigger);

/**
 * High-performance Horizontal Gallery (Section 21):
 * - Standard browser cursor
 * - GSAP ScrollTrigger animating ONLY transform
 * - will-change: transform ONLY active during scroll
 * - Dynamically handles any number of photos
 */
export default function HorizontalGallery({ onSelectPhoto }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Take up to 10 photos dynamically from the catalog
  const editorialPhotos = photos.slice(0, Math.min(10, photos.length));

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 120);

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${track.scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          if (track) {
            track.style.willChange = self.isActive ? 'transform' : 'auto';
          }
        },
      },
    });

    return () => {
      tween.kill();
    };
  }, [editorialPhotos.length]);

  const photoStyles = [
    { width: 'w-[300px] md:w-[360px]', height: 'h-[500px]' },
    { width: 'w-[400px] md:w-[480px]', height: 'h-[400px]' },
    { width: 'w-[280px] md:w-[340px]', height: 'h-[340px]' },
    { width: 'w-[320px] md:w-[380px]', height: 'h-[520px]' },
    { width: 'w-[420px] md:w-[500px]', height: 'h-[420px]' },
    { width: 'w-[280px] md:w-[320px]', height: 'h-[480px]' },
    { width: 'w-[340px] md:w-[400px]', height: 'h-[400px]' },
    { width: 'w-[400px] md:w-[480px]', height: 'h-[460px]' },
  ];

  return (
    <section
      id="horizontal-gallery"
      ref={sectionRef}
      className="relative w-full h-screen bg-[#0e0e13] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="absolute top-1/2 left-10 -translate-y-1/2 font-display text-[14vw] font-black uppercase text-white/[0.02] pointer-events-none select-none">
        RUNWAY
      </div>

      <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none">
        <div>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.35em] uppercase text-gold">
            Chapter V • The Runway
          </span>
          <h2 className="font-display text-xl md:text-3xl uppercase tracking-wider text-white font-light">
            Editorial Perspectives
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-white/50 text-xs font-mono">
          <span>HORIZONTAL STRIP</span>
          <span>→</span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="h-full flex items-center gap-10 md:gap-16 pl-12 md:pl-24 pr-48"
      >
        {/* Intro Runway Card */}
        <div className="flex-shrink-0 w-[280px] md:w-[340px] flex flex-col justify-center">
          <span className="font-mono text-xs text-gold/80 tracking-widest uppercase mb-3">
            CURATED SELECTION
          </span>
          <h3 className="font-display text-3xl md:text-4xl text-white font-light leading-snug">
            Moments in motion.
          </h3>
          <p className="font-serif italic text-white/60 text-sm mt-4">
            An unbroken ribbon of candid beauty, geometry, and personal grace.
          </p>
          <div className="mt-8 flex items-center gap-2 text-gold text-xs font-mono">
            <span>SCROLL DOWN TO ADVANCE</span>
            <span className="animate-pulse">→</span>
          </div>
        </div>

        {/* Editorial Photos */}
        {editorialPhotos.map((photo, idx) => {
          const style = photoStyles[idx % photoStyles.length];
          const displayNum = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={`horiz-${photo.id}`}
              onClick={() => onSelectPhoto && onSelectPhoto(photo)}
              className={`flex-shrink-0 ${style.width} group cursor-pointer transition-all duration-300`}
            >
              <div
                className={`relative w-full ${style.height} overflow-hidden rounded-sm bg-[#181820] border border-white/10 group-hover:border-gold/60 shadow-2xl transition-all duration-300`}
              >
                <picture>
                  <source media="(min-width: 1024px)" srcSet={photo.medium || photo.src} type="image/webp" />
                  <img
                    src={photo.thumbnail || photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104 group-hover:brightness-105"
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-gold font-medium">
                    {displayNum} / {String(totalPhotos).padStart(2, '0')}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="font-display text-lg md:text-xl text-white font-normal group-hover:text-gold transition-colors">
                    {photo.title}
                  </h4>
                  <p className="font-serif italic text-xs md:text-sm text-white/70 line-clamp-1 mt-0.5">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
