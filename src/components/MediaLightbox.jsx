import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { soundManager } from '../utils/sound';

/**
 * Unified Fullscreen Media Lightbox (Section 20 & 21):
 * - Supports BOTH high-res images and videos
 * - Preloads ONLY immediate previous and next image
 * - Single active video instance with memory cleanup on unmount
 * - Native controls & custom playback bar
 * - Keyboard support (Escape, ArrowLeft, ArrowRight, Space)
 */
export default function MediaLightbox({
  item,
  items,
  onClose,
  onSelectItem
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef(null);

  const currentIndex = items.findIndex((m) => m.id === item?.id);
  const total = items.length;

  const isVideo = item?.type === 'video';

  const handleNext = useCallback(() => {
    soundManager.playChime();
    setImageLoaded(false);
    const nextIdx = (currentIndex + 1) % total;
    onSelectItem(items[nextIdx]);
  }, [currentIndex, items, onSelectItem, total]);

  const handlePrev = useCallback(() => {
    soundManager.playChime();
    setImageLoaded(false);
    const prevIdx = (currentIndex - 1 + total) % total;
    onSelectItem(items[prevIdx]);
  }, [currentIndex, items, onSelectItem, total]);

  // Section 21: Preload ONLY immediate previous & next image
  useEffect(() => {
    if (currentIndex === -1) return;
    const prev = items[(currentIndex - 1 + total) % total];
    const next = items[(currentIndex + 1) % total];

    if (prev?.type === 'image' && prev?.large) {
      const p = new Image();
      p.src = prev.large;
    }
    if (next?.type === 'image' && next?.large) {
      const n = new Image();
      n.src = next.large;
    }
  }, [currentIndex, items, total]);

  // Video playback toggles
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Keyboard navigation & Video cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' && isVideo) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Clean up video stream on close
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [handleNext, handlePrev, onClose, isVideo]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100000] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-6 md:p-10 select-none"
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm tracking-widest text-gold">
              {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-white/50 font-sans">
              {isVideo ? 'Motion Archive' : 'Photograph Archive'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close fullscreen viewer"
            className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-sans font-medium">Close</span>
            <X className="w-4 h-4 text-gold group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Center Media Stage */}
        <div className="relative flex-1 w-full flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <motion.div
            key={item.id}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative max-h-full max-w-full flex flex-col items-center shadow-2xl"
          >
            {isVideo ? (
              // Video Viewer
              <div className="relative max-h-[72vh] md:max-h-[78vh] aspect-video w-auto max-w-full flex items-center justify-center rounded-sm overflow-hidden border border-white/15 bg-black">
                <video
                  ref={videoRef}
                  src={item.src}
                  poster={item.poster}
                  autoPlay
                  playsInline
                  loop
                  controls={false}
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Floating Video Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white z-20">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="hover:text-gold transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="hover:text-gold transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    aria-label="Fullscreen"
                    className="hover:text-gold transition-colors cursor-pointer"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Image Viewer with Progressive Loading
              <div className="relative max-h-[72vh] md:max-h-[78vh] flex items-center justify-center">
                <img
                  src={item.medium || item.thumbnail}
                  alt=""
                  aria-hidden="true"
                  className={`max-h-[72vh] md:max-h-[78vh] w-auto object-contain rounded-sm shadow-2xl border border-white/10 transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-0 absolute inset-0' : 'opacity-100'
                  }`}
                />
                <img
                  src={item.large || item.src}
                  alt={item.title || 'Photograph'}
                  decoding="async"
                  onLoad={() => setImageLoaded(true)}
                  className={`max-h-[72vh] md:max-h-[78vh] w-auto object-contain rounded-sm shadow-2xl border border-white/10 transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            )}
          </motion.div>

          {/* Left Arrow Button */}
          <div className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={handlePrev}
              aria-label="Previous media item"
              className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Right Arrow Button */}
          <div className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={handleNext}
              aria-label="Next media item"
              className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-gold hover:border-gold/60 transition-all flex items-center justify-center shadow-lg cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Caption & Metadata */}
        <div className="text-center z-20 max-w-xl px-4">
          <h2 className="font-display text-lg md:text-2xl text-white font-light tracking-wider">
            {item.title}
          </h2>
          {item.caption && (
            <p className="font-serif italic text-sm md:text-base text-white/70 mt-1">
              "{item.caption}"
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] tracking-widest text-white/30 uppercase font-mono">
            <span>ITEM • {String(currentIndex + 1).padStart(2, '0')}</span>
            <span>•</span>
            <span>DYNAMIC HIGH-RES EXHIBITION</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
