import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';

// Global singleton to track the currently playing video element
let currentlyPlayingVideo = null;

export const pauseActiveVideo = () => {
  if (currentlyPlayingVideo) {
    try {
      currentlyPlayingVideo.pause();
    } catch (e) {}
    currentlyPlayingVideo = null;
  }
};

/**
 * High-performance VideoCard:
 * - IntersectionObserver for lazy loading / autoplay
 * - preload="metadata" so browser can actually buffer
 * - Autoplay fallback: centered ▶ PLAY button if autoplay is blocked
 * - Error state with retry
 * - Only ONE video playing at a time (global singleton)
 * - Standard browser cursor
 */
export default function VideoCard({
  video,
  onClick,
  className = '',
  aspectRatio = 'aspect-[9/16] md:aspect-[3/4]',
  priority = false,
  displayIndex
}) {
  const [isInView, setIsInView]           = useState(priority);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [hasError, setHasError]           = useState(false);
  const videoRef    = useRef(null);
  const containerRef = useRef(null);

  // Attempt playback, surface result
  const attemptPlay = (vid) => {
    if (!vid) return;
    if (currentlyPlayingVideo && currentlyPlayingVideo !== vid) {
      try { currentlyPlayingVideo.pause(); } catch (_) {}
    }
    const promise = vid.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          currentlyPlayingVideo = vid;
          setIsPlaying(true);
          setNeedsManualPlay(false);
        })
        .catch(() => {
          // Autoplay blocked — show manual play button
          setNeedsManualPlay(true);
          setIsPlaying(false);
        });
    }
  };

  // IntersectionObserver: load & play when in viewport; pause when leaving
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            const vid = videoRef.current;
            if (vid) {
              attemptPlay(vid);
            }
          } else {
            const vid = videoRef.current;
            if (vid) {
              try { vid.pause(); } catch (_) {}
              if (currentlyPlayingVideo === vid) currentlyPlayingVideo = null;
              setIsPlaying(false);
            }
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Once video element mounts (isInView becomes true), attempt autoplay
  useEffect(() => {
    if (isInView && videoRef.current) {
      attemptPlay(videoRef.current);
    }
  }, [isInView]);

  const handleManualPlay = (e) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true; // ensure muted for browser compat
    attemptPlay(vid);
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    const vid = videoRef.current;
    if (vid) {
      vid.load();
      attemptPlay(vid);
    }
  };

  const indexLabel = displayIndex !== undefined
    ? String(displayIndex).padStart(2, '0')
    : video.index
      ? String(video.index).padStart(2, '0')
      : '01';

  return (
    <div
      ref={containerRef}
      onClick={() => onClick && onClick(video)}
      className={`group relative overflow-hidden rounded-md bg-[#121218] border border-white/10 hover:border-gold/80 shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform ${className}`}
    >
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-black`}>

        {/* Video element — loads when in view */}
        {isInView ? (
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => { setIsPlaying(true); setNeedsManualPlay(false); }}
            onPause={() => setIsPlaying(false)}
            onError={() => { setHasError(true); setIsPlaying(false); }}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          /* Poster placeholder before entering view */
          video.poster ? (
            <img
              src={video.poster}
              alt={video.title}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-[#0d0d14] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center">
                <Play className="w-4 h-4 text-gold/50 ml-0.5" />
              </div>
            </div>
          )
        )}

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-3">
            <AlertCircle className="w-8 h-8 text-gold/60" />
            <span className="text-xs font-mono text-white/60 uppercase tracking-wider text-center px-4">
              Unable to play this video
            </span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold/40 text-gold text-xs font-mono uppercase tracking-wider hover:bg-gold/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Manual Play Button — shown when autoplay is blocked */}
        {!hasError && !isPlaying && needsManualPlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-auto">
            <button
              onClick={handleManualPlay}
              className="flex flex-col items-center gap-2 group/play cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border-2 border-gold bg-black/70 backdrop-blur-sm flex items-center justify-center group-hover/play:bg-gold group-hover/play:border-gold transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                <Play className="w-6 h-6 text-gold group-hover/play:text-black ml-0.5 fill-current transition-colors" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80">
                PLAY
              </span>
            </button>
          </div>
        )}

        {/* Subtle Play/Pause icon — shows when autoplay is running (or not yet manually needed) */}
        {!hasError && !needsManualPlay && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-full border border-gold/40 bg-black/60 backdrop-blur-md flex items-center justify-center text-gold group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-xl">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
          </div>
        )}

        {/* Video Frame Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-mono text-gold uppercase tracking-widest z-10 pointer-events-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-gold animate-pulse' : 'bg-white/40'}`} />
          <span>MOTION {indexLabel}</span>
        </div>

        {/* Bottom Meta Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col transform translate-y-1 group-hover:translate-y-0 transition-transform pointer-events-none">
          <h4 className="font-display text-lg text-white font-medium group-hover:text-gold transition-colors">
            {video.title}
          </h4>
          <p className="font-serif italic text-xs text-white/70 mt-0.5 line-clamp-1">
            "{video.caption}"
          </p>
        </div>
      </div>
    </div>
  );
}
