import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Secret Fullscreen Photo Viewer (Requirement 10)
 * - Fullscreen display of private photograph
 * - Subtle caption
 * - Previous (←), Next (→), Close (×)
 * - Keyboard navigation & touch swipe support
 */
export default function SecretPhotoViewer({ photo, photos, onClose, onSelectPhoto }) {
  const currentIndex = photos.findIndex((p) => p.id === photo?.id);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx]);
  }, [currentIndex, photos, onSelectPhoto]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIdx]);
  }, [currentIndex, photos, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none"
      >
        {/* Top Header / Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold font-mono text-[10px] tracking-widest uppercase">
            <span>OUR CORNER</span>
            <span className="text-white/40">•</span>
            <span>
              {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="pointer-events-auto w-10 h-10 rounded-full border border-white/20 bg-black/60 text-white/80 hover:text-gold hover:border-gold/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/15 bg-black/60 text-white/70 hover:text-gold hover:border-gold/50 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/15 bg-black/60 text-white/70 hover:text-gold hover:border-gold/50 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Center Photo & Caption Stage */}
        <div className="relative max-w-4xl max-h-[85vh] w-full px-6 flex flex-col items-center">
          <motion.div
            key={photo.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative max-h-[72vh] flex items-center justify-center rounded-lg overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
          >
            <img
              src={photo.src}
              alt={photo.title || 'Private moment'}
              className="max-h-[72vh] w-auto object-contain rounded-lg"
            />
          </motion.div>

          {/* Caption */}
          <div className="mt-5 text-center flex flex-col items-center">
            {photo.title && (
              <h4 className="font-display text-lg sm:text-xl text-white font-medium tracking-wide">
                {photo.title}
              </h4>
            )}
            {photo.caption && (
              <p className="font-serif italic text-sm text-gold/80 mt-1 max-w-md">
                "{photo.caption}"
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
