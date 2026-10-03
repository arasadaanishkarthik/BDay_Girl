import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { photos as defaultPhotos } from '../data/mediaLoader';

/**
 * Dedicated Fullscreen Photo Lightbox
 *
 * Requirements:
 * 1. Receives selectedPhoto (never video)
 * 2. Operates strictly on photos[] array (never videos[])
 * 3. Renders <img> with progressive loading (blur/medium -> large)
 * 4. Displays photo title & caption from photo object
 * 5. Counter strictly shows photo index / totalPhotos
 * 6. Preloads adjacent photos
 * 7. Zero video crossover
 */
export default function PhotoLightbox({
  photo,
  photos = defaultPhotos,
  onClose,
  onSelectPhoto
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentIndex = photos.findIndex((p) => p.id === photo?.id);
  const total = photos.length;
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentPhoto = photos[activeIndex] || photo;

  const handleNext = useCallback(() => {
    soundManager.playChime();
    setImageLoaded(false);
    const nextIdx = (activeIndex + 1) % total;
    if (onSelectPhoto) {
      onSelectPhoto(photos[nextIdx]);
    }
  }, [activeIndex, onSelectPhoto, total, photos]);

  const handlePrev = useCallback(() => {
    soundManager.playChime();
    setImageLoaded(false);
    const prevIdx = (activeIndex - 1 + total) % total;
    if (onSelectPhoto) {
      onSelectPhoto(photos[prevIdx]);
    }
  }, [activeIndex, onSelectPhoto, total, photos]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, []);

  // Preload ONLY immediate previous & next image
  useEffect(() => {
    if (activeIndex === -1 || total === 0) return;
    const prev = photos[(activeIndex - 1 + total) % total];
    const next = photos[(activeIndex + 1) % total];

    if (prev?.large) {
      const p = new Image();
      p.src = prev.large;
    }
    if (next?.large) {
      const n = new Image();
      n.src = next.large;
    }
  }, [activeIndex, photos, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Touch swipe support for mobile
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - (touchStartY.current || 0);

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext(); // swipe left -> next
      } else {
        handlePrev(); // swipe right -> prev
      }
    }
  };

  if (!currentPhoto) return null;

  const counterString = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        data-lenis-prevent
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100000] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-4 sm:p-6 md:p-10 select-none min-h-[100svh]"
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-xs sm:text-sm tracking-widest text-gold font-medium">
              {counterString}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-white/50 font-sans">
              Photograph Archive
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close fullscreen photograph viewer"
            className="min-h-[44px] px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-sans font-medium">Close</span>
            <X className="w-4 h-4 text-gold group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Center Media Stage */}
        <div className="relative flex-1 w-full flex items-center justify-center p-1 sm:p-2 md:p-6 overflow-hidden">
          <motion.div
            key={currentPhoto.id}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative max-h-full max-w-full flex flex-col items-center shadow-2xl"
          >
            <div className="relative max-h-[72vh] md:max-h-[78vh] flex items-center justify-center">
              <img
                src={currentPhoto.medium || currentPhoto.thumbnail || currentPhoto.src}
                alt=""
                aria-hidden="true"
                className={`max-h-[72vh] md:max-h-[78vh] w-auto object-contain rounded-sm shadow-2xl border border-white/10 transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-0 absolute inset-0' : 'opacity-100'
                }`}
              />
              <img
                src={currentPhoto.large || currentPhoto.src}
                alt={currentPhoto.title || 'Photograph'}
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                className={`max-h-[72vh] md:max-h-[78vh] w-auto object-contain rounded-sm shadow-2xl border border-white/10 transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </motion.div>

          {/* Left Arrow Button */}
          {total > 1 && (
            <div className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={handlePrev}
                aria-label="Previous photograph"
                className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Right Arrow Button */}
          {total > 1 && (
            <div className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={handleNext}
                aria-label="Next photograph"
                className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Caption & Metadata */}
        <div className="text-center z-20 max-w-xl px-4">
          <h2 className="font-display text-lg md:text-2xl text-white font-light tracking-wider">
            {currentPhoto.title}
          </h2>
          {currentPhoto.caption && (
            <p className="font-serif italic text-sm md:text-base text-white/70 mt-1">
              "{currentPhoto.caption}"
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-mono tracking-widest text-gold/60 uppercase">
            <span>Photograph • {counterString}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
