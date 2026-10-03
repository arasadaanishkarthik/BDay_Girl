import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

// Global singleton to track the currently playing video element (Section 17)
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
 * High-performance VideoCard (Sections 15, 16, 17, 18, 19):
 * - Standard browser cursor
 * - WebP poster first
 * - Autoplays ONLY when in viewport via IntersectionObserver
 * - ONLY ONE active video playing at a time
 * - Pauses automatically when leaving viewport
 */
export default function VideoCard({
  video,
  onClick,
  className = '',
  aspectRatio = 'aspect-[9/16] md:aspect-[3/4]',
  priority = false,
  displayIndex
}) {
  const [isInView, setIsInView] = useState(priority);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            const currentVid = videoRef.current;
            if (currentVid) {
              // Pause any other previously playing video (Section 17)
              if (currentlyPlayingVideo && currentlyPlayingVideo !== currentVid) {
                currentlyPlayingVideo.pause();
              }
              const playPromise = currentVid.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    currentlyPlayingVideo = currentVid;
                    setIsPlaying(true);
                  })
                  .catch(() => {});
              }
            }
          } else {
            const currentVid = videoRef.current;
            if (currentVid) {
              currentVid.pause();
              if (currentlyPlayingVideo === currentVid) {
                currentlyPlayingVideo = null;
              }
              setIsPlaying(false);
            }
          }
        });
      },
      { rootMargin: '80px 0px', threshold: 0.3 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const indexLabel = displayIndex !== undefined ? String(displayIndex).padStart(2, '0') : video.index ? String(video.index).padStart(2, '0') : '01';

  return (
    <div
      ref={containerRef}
      onClick={() => onClick && onClick(video)}
      className={`group relative overflow-hidden rounded-md bg-[#121218] border border-white/10 hover:border-gold/80 shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform ${className}`}
    >
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-black`}>
        {/* Video Element */}
        {isInView ? (
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <img
            src={video.poster || '/images/thumbnails/photo03.webp'}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
        )}

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Dynamic Video Frame Badge (Section 13) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-mono text-gold uppercase tracking-widest z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>MOTION {indexLabel}</span>
        </div>

        {/* Subtle Play Icon (Section 19) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full border border-gold/40 bg-black/60 backdrop-blur-md flex items-center justify-center text-gold group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-xl">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Bottom Meta Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col transform translate-y-1 group-hover:translate-y-0 transition-transform">
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
