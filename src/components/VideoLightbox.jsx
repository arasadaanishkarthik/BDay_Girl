import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { videos as defaultVideos } from '../data/mediaLoader';

/**
 * Dedicated Fullscreen Video Lightbox
 *
 * Requirements:
 * 1. Receives selectedVideo (never photo)
 * 2. Operates strictly on videos[] array (never photos[])
 * 3. Renders actual <video key={video.src} src={video.src} controls playsInline autoPlay muted />
 * 4. Displays video title & description from video object
 * 5. Counter strictly shows "01 / 02" based on videos.length
 * 6. Autoplay attempt on mount/change with fallback to paused controls
 * 7. Clean up video playback on close/unmount
 * 8. Zero photo crossover
 * 9. Preserves cinematic dark design, black background, close button, prev/next arrows
 */
export default function VideoLightbox({
  video,
  videos = defaultVideos,
  onClose,
  onSelectVideo
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentIndex = videos.findIndex(
    (v) => v.id === video?.id || v.src === video?.src
  );
  const total = videos.length;
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentVideo = videos[activeIndex] || video;

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }
    if (onClose) onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    soundManager.playChime();
    const nextIdx = (activeIndex + 1) % total;
    if (onSelectVideo) {
      onSelectVideo(videos[nextIdx]);
    }
  }, [activeIndex, onSelectVideo, total, videos]);

  const handlePrev = useCallback(() => {
    soundManager.playChime();
    const prevIdx = (activeIndex - 1 + total) % total;
    if (onSelectVideo) {
      onSelectVideo(videos[prevIdx]);
    }
  }, [activeIndex, onSelectVideo, total, videos]);

  // Lock body scroll while video lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, []);

  // Autoplay attempt when active video changes
  useEffect(() => {
    if (videoRef.current) {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            // If autoplay is blocked by browser policy, leave paused with controls ready
            console.warn('VideoLightbox autoplay blocked by browser policy:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentVideo?.src]);

  // Keyboard navigation & video cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (_) {}
      }
    };
  }, [handleClose, handleNext, handlePrev]);

  if (!currentVideo) return null;

  const counterString = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        data-lenis-prevent
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
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-white/60 font-sans">
              Motion Archive
            </span>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close fullscreen video viewer"
            className="min-h-[44px] px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-sans font-medium">Close</span>
            <X className="w-4 h-4 text-gold group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Center Video Stage */}
        <div className="relative flex-1 w-full flex items-center justify-center p-1 sm:p-2 md:p-6 overflow-hidden">
          <motion.div
            key={currentVideo.src}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative max-h-full max-w-full flex flex-col items-center shadow-2xl"
          >
            <div className="relative max-h-[72vh] md:max-h-[78vh] aspect-video w-auto max-w-full flex items-center justify-center rounded-sm overflow-hidden border border-white/15 bg-black shadow-2xl">
              <video
                ref={videoRef}
                key={currentVideo.src}
                src={currentVideo.src}
                poster={currentVideo.poster}
                controls
                playsInline
                autoPlay
                muted
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          {/* Left Arrow Button */}
          {total > 1 && (
            <div className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={handlePrev}
                aria-label="Previous video"
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
                aria-label="Next video"
                className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Title & Description */}
        <div className="text-center z-20 max-w-xl px-4">
          <h2 className="font-display text-lg md:text-2xl text-white font-light tracking-wider">
            {currentVideo.title}
          </h2>
          {(currentVideo.description || currentVideo.caption) && (
            <p className="font-serif italic text-sm md:text-base text-white/70 mt-1">
              "{currentVideo.description || currentVideo.caption}"
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-mono tracking-widest text-gold/60 uppercase">
            <span>Living Film • {counterString}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
