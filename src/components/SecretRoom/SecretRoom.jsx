import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Heart, Film, Image as ImageIcon, Play, Pause } from 'lucide-react';
import { privatePhotos, privateVideos, totalPrivatePhotos, totalPrivateVideos } from '../../data/secretLoader';
import { SECRET_CONFIG } from '../../data/config';
import SecretMediaViewer from './SecretMediaViewer';

/**
 * Secret Memory Room (3 Private Photos + 1 Private Video)
 *
 * Structure:
 * 1. OUR LITTLE CORNER (Header & Intro)
 * 2. PRIVATE MOMENTS (3 Photos in a 3-card cinematic row, counter: 3 photos)
 * 3. PRIVATE MOTION (1 Video with muted, playsInline, controls, autoplay & play button)
 * 4. FINAL PRIVATE MESSAGE
 * 5. 🔒 LOCK ROOM button & 15-minute auto-lock
 */
export default function SecretRoom({ isOpen, onLock }) {
  const [activeMedia, setActiveMedia] = useState(null);
  const [activeMediaList, setActiveMediaList] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoBlocked, setIsVideoBlocked] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Inactivity Auto-Lock (Requirement: 15 minutes)
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleLockRoom();
    }, SECRET_CONFIG.INACTIVITY_TIMEOUT_MS || 15 * 60 * 1000);
  }, []);

  const handleLockRoom = useCallback(() => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (_) {}
    }
    setActiveMedia(null);
    onLock();
  }, [onLock]);

  // Body overflow and scroll lock cleanup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    resetTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [isOpen, resetTimer]);

  // Autoplay attempt for the private video
  useEffect(() => {
    if (isOpen && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true;
      const promise = vid.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsVideoPlaying(true);
            setIsVideoBlocked(false);
          })
          .catch(() => {
            setIsVideoBlocked(true);
            setIsVideoPlaying(false);
          });
      }
    }
  }, [isOpen]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (isVideoPlaying) {
      vid.pause();
      setIsVideoPlaying(false);
    } else {
      vid.muted = true;
      vid.play()
        .then(() => {
          setIsVideoPlaying(true);
          setIsVideoBlocked(false);
        })
        .catch(() => {
          setIsVideoBlocked(true);
        });
    }
  };

  if (!isOpen) return null;

  const theVideo = privateVideos[0] || null;

  return (
    <div
      data-lenis-prevent
      style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}
      className="fixed inset-0 z-[100] bg-[#07070b] text-[#f7f3eb] overflow-y-auto overscroll-contain selection:bg-gold selection:text-black w-full min-h-[100svh]"
    >
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold/[0.035] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* ─── STICKY HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 md:px-12 py-3.5 sm:py-4 flex items-center justify-between bg-[#07070b]/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="font-display text-[11px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white font-light">
            OUR LITTLE CORNER
          </span>
        </div>

        {/* 🔒 LOCK ROOM Button (min 44px touch target) */}
        <button
          onClick={handleLockRoom}
          aria-label="Lock secret room and return to public website"
          className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold hover:text-black text-gold font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>LOCK ROOM</span>
        </button>
      </header>

      {/* ─── MAIN SECRET CONTENT ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 flex flex-col items-center relative z-10 gap-16 sm:gap-20 md:gap-28 w-full">

        {/* 1. INTRO / WELCOME MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-2xl"
        >
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-gold uppercase">
              Exclusive Archive • From p/
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl text-white font-light tracking-wide uppercase">
            OUR LITTLE CORNER
          </h1>

          <p className="font-serif italic text-gold/90 text-base sm:text-xl md:text-2xl mt-3">
            "Some memories deserved their own little place."
          </p>

          <div className="w-12 h-px bg-gold/30 my-6" />

          <p className="font-serif italic text-white/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
            Welcome to the little corner that wasn't on the main tour.
          </p>
        </motion.div>

        {/* 2. PRIVATE MOMENTS (Exact 3 Photos in a Responsive Grid) */}
        {totalPrivatePhotos > 0 && (
          <section className="w-full flex flex-col items-center">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase">
                  PRIVATE MOMENTS
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-light uppercase tracking-wider">
                Unseen Photographs
              </h2>
              <p className="font-mono text-xs tracking-[0.25em] text-gold/80 uppercase mt-2">
                {totalPrivatePhotos} {totalPrivatePhotos === 1 ? 'Photograph' : 'Photographs'}
              </p>
            </div>

            {/* Responsive Photo Gallery (Desktop: 3 in a row, Tablet: 2, Mobile: 1 per row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 w-full max-w-5xl mx-auto px-1 sm:px-0">
              {privatePhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  onClick={() => {
                    setActiveMedia(photo);
                    setActiveMediaList(privatePhotos);
                  }}
                  className="group relative bg-[#13131c] p-3 sm:p-3.5 pb-4 sm:pb-5 rounded-xl border border-white/15 hover:border-gold/60 shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 pointer-events-none" />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[9px] font-mono tracking-widest text-gold uppercase pointer-events-none">
                      0{i + 1} / 0{totalPrivatePhotos}
                    </div>
                  </div>

                  {/* Polaroid caption footer */}
                  <div className="mt-3 px-1 flex flex-col pointer-events-none">
                    <span className="font-display text-base text-white/95 font-medium group-hover:text-gold transition-colors truncate">
                      {photo.title}
                    </span>
                    <span className="font-serif italic text-xs text-white/60 group-hover:text-white/80 transition-colors mt-0.5 truncate">
                      "{photo.caption}"
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 3. PRIVATE MOTION (Exact 1 Video) */}
        {theVideo && (
          <section className="w-full flex flex-col items-center">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 mb-3">
                <Film className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase">
                  PRIVATE MOTION
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-light uppercase tracking-wider">
                Living Moment
              </h2>
              <p className="font-mono text-xs tracking-[0.25em] text-gold/80 uppercase mt-2">
                1 Video
              </p>
            </div>

            {/* Single Large Video Player */}
            <div className="w-full max-w-3xl mx-auto px-1 sm:px-0">
              <div
                onClick={() => {
                  setActiveMedia(theVideo);
                  setActiveMediaList(privateVideos);
                }}
                className="group relative rounded-xl overflow-hidden bg-[#121218] border border-gold/40 shadow-[0_20px_50px_rgba(212,175,55,0.15)] aspect-video cursor-pointer"
              >
                <video
                  ref={videoRef}
                  src={theVideo.src}
                  muted
                  playsInline
                  loop
                  controls
                  preload="metadata"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  className="w-full h-full object-cover object-center"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[9px] font-mono text-gold uppercase tracking-widest pointer-events-none z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${isVideoPlaying ? 'bg-gold animate-pulse' : 'bg-white/40'}`} />
                  <span>PRIVATE FILM • 01 / 01</span>
                </div>

                {/* Visible Circular Play/Pause Button when paused or blocked */}
                {(!isVideoPlaying || isVideoBlocked) && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <button
                      onClick={handleTogglePlay}
                      className="pointer-events-auto flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gold/80 bg-black/70 backdrop-blur-md text-gold hover:bg-gold hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.35)] cursor-pointer active:scale-95"
                      aria-label="Play video"
                    >
                      <Play className="w-6 h-6 ml-0.5 fill-current" />
                    </button>
                  </div>
                )}

                {/* Bottom title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10 flex flex-col pointer-events-none">
                  <h4 className="font-display text-base sm:text-lg text-white font-medium">
                    {theVideo.title}
                  </h4>
                  <p className="font-serif italic text-xs text-white/70 mt-0.5">
                    "{theVideo.caption}"
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. FINAL PRIVATE MESSAGE */}
        <div className="flex flex-col items-center text-center max-w-lg pb-12 px-4">
          <Heart className="w-5 h-5 text-gold mb-4" />
          <h3 className="font-display text-xl sm:text-2xl text-white font-light uppercase tracking-widest">
            Always Ours
          </h3>
          <p className="font-serif italic text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
            "To the unscripted seconds, the quiet smiles, and the memories that belong only to us. Hidden from the world, kept safe forever."
          </p>

          {/* Bottom Lock Room Button (touch target min 44px) */}
          <button
            onClick={handleLockRoom}
            className="mt-8 flex items-center gap-2 min-h-[44px] px-8 py-3 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold hover:text-black text-gold font-mono text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer active:scale-95 shadow-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOCK ROOM</span>
          </button>
        </div>

      </main>

      {/* ─── FULLSCREEN SECRET MEDIA VIEWER ─────────────────────────────────── */}
      {activeMedia && (
        <SecretMediaViewer
          item={activeMedia}
          items={activeMediaList}
          onClose={() => setActiveMedia(null)}
          onSelectItem={setActiveMedia}
        />
      )}
    </div>
  );
}
