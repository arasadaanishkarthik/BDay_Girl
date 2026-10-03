import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { photos, totalPhotos } from '../data/mediaLoader';

/**
 * Ultra-Optimized Virtualized Polaroid Stack (Sections 3, 4, 5, 6, 24, 30)
 * - Renders MAXIMUM 5 to 7 cards in the DOM at any time
 * - Zero continuous requestAnimationFrame loops
 * - Zero multi-axis per-frame GSAP scrub thrashing
 * - Static pre-computed offsets when idle
 * - Supports ANY number of photos (20, 50, 100, 200+)
 * - Instant 60 FPS scrolling and buttery-smooth card transitions
 */
export default function Memories({ onSelectPhoto }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef(null);

  const maxVisibleCards = 6; // Sections 4 & 30: 5–7 cards maximum
  const total = photos.length;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Keyboard navigation when hovered/focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [total]);

  // Windowed virtual slice of exactly 5–6 items around currentIndex
  const visibleCards = [];
  for (let i = 0; i < Math.min(maxVisibleCards, total); i++) {
    const photoIdx = (currentIndex + i) % total;
    visibleCards.push({
      photo: photos[photoIdx],
      stackRank: i, // 0 is top active card, 1 is behind it, etc.
      index: photoIdx
    });
  }

  // Pre-calculated static stack styles (GPU transforms only)
  const getStackStyle = (rank) => {
    // Top card (rank 0)
    if (rank === 0) {
      return {
        transform: 'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)',
        zIndex: 30,
        opacity: 1,
      };
    }
    // Cards behind: stacked with subtle static rotation and gentle scale down
    const rotList = [-3, 3.5, -4.5, 4, -2];
    const yOffsets = [0, 14, 28, 42, 56];
    const xOffsets = [0, -8, 10, -12, 14];
    const scales = [1, 0.96, 0.92, 0.88, 0.84];
    const opacities = [1, 0.9, 0.75, 0.55, 0.35];

    const rot = rotList[(rank - 1) % rotList.length];
    const y = yOffsets[rank] || 50;
    const x = xOffsets[rank] || 0;
    const scale = scales[rank] || 0.8;
    const opacity = opacities[rank] || 0.3;

    return {
      transform: `translate3d(${x}px, ${y}px, 0px) rotate(${rot}deg) scale(${scale})`,
      zIndex: 30 - rank,
      opacity,
    };
  };

  return (
    <section
      id="memories"
      ref={containerRef}
      className="relative w-full min-h-[95vh] py-24 md:py-32 bg-[#0c0c10] text-[#f7f3eb] overflow-hidden select-none flex flex-col items-center justify-between"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="z-10 text-center px-6 max-w-2xl">
        <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-gold/80 mb-2 block">
          Chapter II • Constellation
        </span>
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-wide uppercase">
          Moments Suspended
        </h2>
        <p className="font-serif italic text-white/60 text-sm md:text-base mt-2">
          Flip through her living memory stack
        </p>
      </div>

      {/* Virtualized Polaroid Stack Stage */}
      <div className="relative w-full max-w-md h-[460px] sm:h-[520px] flex items-center justify-center my-8 z-10">
        {visibleCards.map(({ photo, stackRank, index }) => {
          const isTop = stackRank === 0;
          const style = getStackStyle(stackRank);

          return (
            <div
              key={photo.id}
              style={style}
              onClick={() => {
                if (isTop) {
                  onSelectPhoto(photo);
                } else {
                  handleNext();
                }
              }}
              className={`absolute w-[280px] sm:w-[320px] md:w-[340px] bg-[#16161f] p-3 pb-6 rounded-md border border-white/15 shadow-2xl transition-all duration-300 ease-out cursor-pointer transform-gpu ${
                isTop ? 'hover:border-gold shadow-[0_20px_50px_rgba(0,0,0,0.8)]' : 'pointer-events-auto'
              }`}
            >
              {/* Photo Area */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-black">
                <picture>
                  <source media="(min-width: 1024px)" srcSet={photo.medium} type="image/webp" />
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    loading={isTop ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                  />
                </picture>

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Dynamic Frame Counter Badge (Section 13) */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-white/15 text-[9px] font-mono tracking-widest text-gold uppercase">
                  {String(index + 1).padStart(2, '0')} / {String(totalPhotos).padStart(2, '0')}
                </div>
              </div>

              {/* Polaroid Footer */}
              <div className="mt-3 px-1 flex flex-col">
                <span className="font-display text-base text-white/95 font-medium truncate">
                  {photo.title}
                </span>
                <span className="font-serif italic text-xs text-white/60 truncate mt-0.5">
                  "{photo.caption}"
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Interactive Controls */}
      <div className="z-10 flex items-center gap-6">
        <button
          onClick={handlePrev}
          aria-label="Previous photograph"
          className="w-12 h-12 rounded-full border border-white/20 bg-[#121218] hover:border-gold hover:text-gold text-white/80 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-mono text-xs tracking-[0.25em] text-gold uppercase">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalPhotos).padStart(2, '0')}
        </span>

        <button
          onClick={handleNext}
          aria-label="Next photograph"
          className="w-12 h-12 rounded-full border border-white/20 bg-[#121218] hover:border-gold hover:text-gold text-white/80 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
