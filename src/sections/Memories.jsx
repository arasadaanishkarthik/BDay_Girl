import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryPhotos } from '../data/mediaLoader';

/**
 * Chapter II: Moments Suspended — Wide Horizontal Film Strip Stream (Left to Right)
 *
 * Requirements 1 to 14:
 * - Wide horizontal composition stretching across the viewport width.
 * - Visual flow: LEFT → CENTER → RIGHT.
 * - 7 active positions: [-3, -2, -1, 0, 1, 2, 3].
 *   [small] [small] [medium] [MAIN PHOTO] [medium] [small] [small]
 * - Main photo in center: scale 1, opacity 1, dominant.
 * - Surrounding photos progressively smaller and softer.
 * - Smooth GSAP power3.out transitions (0.85s).
 * - Automatic progression every ~4s, pausing on interaction.
 * - Desktop drag & mobile swipe (drag left -> next, drag right -> prev).
 * - Dynamic photo counter (e.g. 01 / 31).
 * - Exactly 7 active cards in DOM, zero duplicates.
 */
export default function Memories({ onSelectPhoto }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const containerRef    = useRef(null);
  const stageRef        = useRef(null);
  const cardRefs        = useRef(new Map());
  const autoSlideTimer  = useRef(null);
  const resumeTimer     = useRef(null);
  const isInteracting   = useRef(false);
  const isVisible       = useRef(false);

  // Drag tracking
  const dragStartX      = useRef(null);
  const dragStartY      = useRef(null);
  const isDragging      = useRef(false);

  const total = galleryPhotos.length;

  // Track window resize for fluid responsive positioning across viewports
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (total === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Pause auto-sliding on interaction and resume after 6s of idle
  const pauseAutoSlide = useCallback(() => {
    isInteracting.current = true;
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);

    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
      startAutoSlide();
    }, 6000);
  }, []);

  // Auto-slide loop (4 seconds)
  const startAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      if (!isInteracting.current && isVisible.current) {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % total);
      }
    }, 4000);
  }, [total]);

  // Viewport intersection observer: only auto-slide when section is in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            startAutoSlide();
          } else {
            if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [startAutoSlide]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isVisible.current) return;
      if (e.key === 'ArrowRight') {
        pauseAutoSlide();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        pauseAutoSlide();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, pauseAutoSlide]);

  // ─── RESPONSIVE CARD OFFSETS (Mobile: 3 cards, Desktop: 7 cards) ────────
  const isMobileView = windowWidth < 640;
  const visibleOffsets = isMobileView
    ? [-1, 0, 1] // Requirement 12: exactly 3 cards on mobile!
    : total >= 7
    ? [-3, -2, -1, 0, 1, 2, 3]
    : total >= 5
    ? [-2, -1, 0, 1, 2]
    : total >= 3
    ? [-1, 0, 1]
    : [0];

  const visibleCards = visibleOffsets.map((offset) => {
    const photoIdx = ((currentIndex + offset) % total + total) % total;
    return {
      photo: galleryPhotos[photoIdx],
      offset,
      photoIndex: photoIdx,
    };
  });

  // Calculate position parameters across the viewport
  const getSlotParams = useCallback((offset, width) => {
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    // Step spacing between cards (responsive across monitor sizes)
    const step = isMobile
      ? Math.min(95, Math.max(65, width * 0.24))
      : isTablet
      ? Math.max(140, width * 0.22)
      : Math.min(320, Math.max(200, width * 0.19));

    if (offset === 0) {
      // Position 0 = MAIN PHOTO: center, dominant, upright
      return {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: 40,
      };
    }

    const sign = offset > 0 ? 1 : -1;
    const abs = Math.abs(offset);

    if (abs === 1) {
      // Position ±1: MEDIUM, near center
      return {
        x: sign * step,
        y: isMobile ? 8 : 10,
        scale: isMobile ? 0.85 : 0.88,
        rotation: sign * 3,
        opacity: 0.78,
        zIndex: 30,
      };
    }

    if (abs === 2) {
      // Position ±2: SMALL, mid distance
      return {
        x: sign * step * 1.9,
        y: isMobile ? 16 : 20,
        scale: isMobile ? 0.72 : 0.76,
        rotation: sign * 6,
        opacity: 0.5,
        zIndex: 20,
      };
    }

    // Position ±3: SMALL, outer edges (entering/exiting)
    return {
      x: sign * step * 2.7,
      y: isMobile ? 22 : 28,
      scale: isMobile ? 0.6 : 0.64,
      rotation: sign * 9,
      opacity: 0.25,
      zIndex: 10,
    };
  }, []);

  // ─── GSAP TRANSITION ON INDEX CHANGE ──────────────────────────────────────
  useEffect(() => {
    visibleCards.forEach(({ photo, offset }) => {
      const el = cardRefs.current.get(photo.id);
      if (!el) return;

      const target = getSlotParams(offset, windowWidth);

      // Hardware-accelerated smooth slide with GSAP power3.out
      gsap.to(el, {
        x: target.x,
        y: target.y,
        scale: target.scale,
        rotation: target.rotation,
        opacity: target.opacity,
        duration: 0.85,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      el.style.zIndex = target.zIndex;
    });
  }, [currentIndex, windowWidth, getSlotParams]);

  // Pointer / Drag / Swipe interactions
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    isDragging.current = true;
    pauseAutoSlide();
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const clientX = e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY ?? (e.changedTouches && e.changedTouches[0].clientY);
    const diffX = clientX - dragStartX.current;
    const diffY = clientY - (dragStartY.current || 0);

    isDragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;

    // Horizontal drag threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext(); // Drag left -> next photo
      } else {
        handlePrev(); // Drag right -> prev photo
      }
    }
  };

  const handleCardClick = (offset, photo) => {
    pauseAutoSlide();
    if (offset === 0) {
      // Main Center Card: open in fullscreen lightbox
      if (onSelectPhoto) onSelectPhoto(photo);
    } else {
      // Surrounding Card: animate that card to the center main slot
      setDirection(offset > 0 ? 1 : -1);
      setCurrentIndex((prev) => ((prev + offset) % total + total) % total);
    }
  };

  if (total === 0) return null;

  return (
    <section
      id="memories"
      ref={containerRef}
      onMouseEnter={pauseAutoSlide}
      onMouseLeave={() => {
        isInteracting.current = false;
        startAutoSlide();
      }}
      className="relative w-full min-h-[95vh] py-24 md:py-36 bg-[#0c0c10] text-[#f7f3eb] overflow-hidden select-none flex flex-col items-center justify-between"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/[0.035] rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="z-10 text-center px-6 max-w-2xl mb-2">
        <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-gold/80 mb-2 block">
          Chapter II • Constellation
        </span>
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-wide uppercase">
          Moments Suspended
        </h2>
        <p className="font-serif italic text-white/60 text-sm md:text-base mt-2">
          "Each photograph a chapter, traveling through time."
        </p>
      </div>

      {/* ─── WIDE HORIZONTAL FILM STRIP STAGE (LEFT → CENTER → RIGHT) ───── */}
      <div
        ref={stageRef}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        className="relative w-full h-[470px] sm:h-[530px] md:h-[590px] flex items-center justify-center my-4 z-10 cursor-grab active:cursor-grabbing touch-pan-y overflow-visible"
      >
        {visibleCards.map(({ photo, offset, photoIndex }) => {
          const isMain = offset === 0;
          const initialParams = getSlotParams(offset, windowWidth);

          return (
            <div
              key={photo.id}
              ref={(el) => {
                if (el) cardRefs.current.set(photo.id, el);
                else cardRefs.current.delete(photo.id);
              }}
              onClick={() => handleCardClick(offset, photo)}
              style={{
                zIndex: initialParams.zIndex,
                transform: `translate3d(${initialParams.x}px, ${initialParams.y}px, 0px) scale(${initialParams.scale}) rotate(${initialParams.rotation}deg)`,
                opacity: initialParams.opacity,
              }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] sm:w-[270px] md:w-[25vw] md:max-w-[350px] bg-[#14141d] p-3 pb-5 rounded-xl border transition-colors duration-300 shadow-2xl transform-gpu will-change-transform ${
                isMain
                  ? 'border-gold/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer'
                  : 'border-white/10 hover:border-white/30 cursor-pointer pointer-events-auto'
              }`}
            >
              {/* Photo Frame */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black">
                <picture>
                  <source media="(min-width: 1024px)" srcSet={photo.medium} type="image/webp" />
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    loading={isMain ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out"
                  />
                </picture>

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Photo Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-mono tracking-widest text-gold uppercase pointer-events-none">
                  {String(photoIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </div>
              </div>

              {/* Polaroid Footer */}
              <div className="mt-3 px-1 flex flex-col pointer-events-none">
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

      {/* ─── BOTTOM CONTROLS & DYNAMIC COUNTER ────────────────────────────── */}
      <div className="z-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              pauseAutoSlide();
              handlePrev();
            }}
            aria-label="Previous photograph"
            className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full border border-white/20 bg-[#121218] hover:border-gold hover:text-gold text-white/80 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dynamic Photo Counter (Requirement 13: 01 / TOTAL) */}
          <span className="font-mono text-xs tracking-[0.25em] text-gold uppercase select-none">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          <button
            onClick={() => {
              pauseAutoSlide();
              handleNext();
            }}
            aria-label="Next photograph"
            className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full border border-white/20 bg-[#121218] hover:border-gold hover:text-gold text-white/80 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="font-serif italic text-[11px] text-white/40 tracking-wider">
          Swipe or click cards to travel through moments
        </p>
      </div>
    </section>
  );
}
