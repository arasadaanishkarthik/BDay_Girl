import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Play, Pause, Maximize2, Sparkles } from 'lucide-react';
import { videos } from '../data/mediaLoader';

/**
 * Chapter III: Moments in Motion — Asymmetric Video Layout
 *
 * Requirements 15 to 28:
 * - Asymmetric layout: ONE SMALL VIDEO (30-35% width, 280-400px height) +
 *                      ONE LARGE VIDEO (60-65% width, 450-600px height).
 * - Vertically balanced, desktop horizontal, mobile stacked with large on top.
 * - Clicking the small video smoothly swaps sizes (0.7-1.0s transition).
 * - The large featured video is the primary playing video.
 * - Only ONE video plays at a time; when swapped, previous pauses, new starts.
 * - Autoplay with fallback circular play button if blocked.
 * - Exactly 2 video cards for the 2 actual video files.
 */
export default function Motion({ onSelectVideo }) {
  if (!videos || videos.length === 0) return null;

  // Default featured video: video02 is initial large video (or video01 if only 1 exists)
  const [featuredId, setFeaturedId] = useState(
    videos.length > 1 ? videos[1].id : videos[0].id
  );

  const [playingStates, setPlayingStates] = useState({});
  const [blockedStates, setBlockedStates] = useState({});
  const videoRefs = useRef(new Map());
  const sectionRef = useRef(null);
  const isSectionInView = useRef(false);

  // Attempt video playback
  const playVideo = (vidElement, vidId) => {
    if (!vidElement) return;

    // Pause all other videos
    videoRefs.current.forEach((el, id) => {
      if (id !== vidId && el) {
        try { el.pause(); } catch (_) {}
      }
    });

    const promise = vidElement.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setPlayingStates((prev) => ({ ...prev, [vidId]: true }));
          setBlockedStates((prev) => ({ ...prev, [vidId]: false }));
        })
        .catch(() => {
          setBlockedStates((prev) => ({ ...prev, [vidId]: true }));
          setPlayingStates((prev) => ({ ...prev, [vidId]: false }));
        });
    }
  };

  const pauseVideo = (vidElement, vidId) => {
    if (!vidElement) return;
    try { vidElement.pause(); } catch (_) {}
    setPlayingStates((prev) => ({ ...prev, [vidId]: false }));
  };

  // Section observer: start featured video when in view, pause when scrolled away
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSectionInView.current = entry.isIntersecting;
          const activeVid = videoRefs.current.get(featuredId);

          if (entry.isIntersecting) {
            if (activeVid) playVideo(activeVid, featuredId);
          } else {
            videoRefs.current.forEach((v, id) => pauseVideo(v, id));
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [featuredId]);

  // When featured video changes, swap playback to the new featured video
  useEffect(() => {
    videoRefs.current.forEach((el, id) => {
      if (id !== featuredId && el) {
        pauseVideo(el, id);
      }
    });

    const newActiveVid = videoRefs.current.get(featuredId);
    if (newActiveVid && isSectionInView.current) {
      playVideo(newActiveVid, featuredId);
    }
  }, [featuredId]);

  // Swap video handler (Requirement 18, 19, 20)
  const handleSelectFeatured = (id) => {
    if (id !== featuredId) {
      setFeaturedId(id);
    }
  };

  const handleTogglePlay = (e, video) => {
    e.stopPropagation();
    const vidEl = videoRefs.current.get(video.id);
    if (!vidEl) return;

    if (playingStates[video.id]) {
      pauseVideo(vidEl, video.id);
    } else {
      playVideo(vidEl, video.id);
    }
  };

  // Handler to open video in dedicated VideoLightbox (Requirements 1 & 6)
  const handleVideoOpen = (video) => {
    // Pause inline videos before opening fullscreen
    videoRefs.current.forEach((el) => {
      if (el) {
        try { el.pause(); } catch (_) {}
      }
    });
    setPlayingStates({});
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  return (
    <section
      id="motion"
      ref={sectionRef}
      className="relative w-full py-28 md:py-44 bg-[#09090d] text-[#f7f3eb] overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col items-center">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-20">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 mb-4">
            <Film className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
              Chapter III • Living Frames
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight uppercase">
            Moments in Motion
          </h2>

          <p className="font-serif italic text-white/70 max-w-xl text-base md:text-xl mt-3">
            "Some memories are better experienced in motion."
          </p>
        </div>

        {/* ─── ASYMMETRIC VIDEO LAYOUT (ONE SMALL + ONE LARGE) ───────────── */}
        <motion.div
          layout
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
        >
          {videos.map((vid, i) => {
            const isFeatured = vid.id === featuredId;
            const isPlaying = !!playingStates[vid.id];
            const isBlocked = !!blockedStates[vid.id];

            return (
              <motion.div
                key={vid.id}
                layout
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleVideoOpen(vid)}
                className={`relative rounded-xl overflow-hidden bg-[#121218] border transition-all duration-500 shadow-2xl cursor-pointer w-full ${
                  isFeatured
                    ? 'md:w-[64%] h-[260px] sm:h-[360px] md:h-[490px] border-gold/50 shadow-[0_20px_50px_rgba(212,175,55,0.18)] z-20 md:order-1'
                    : 'md:w-[34%] h-[220px] sm:h-[280px] md:h-[350px] border-white/15 hover:border-gold/40 opacity-90 md:opacity-85 hover:opacity-100 z-10 md:order-2'
                }`}
              >
                {/* Video element */}
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(vid.id, el);
                    else videoRefs.current.delete(vid.id);
                  }}
                  src={vid.src}
                  poster={vid.poster || undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onPlay={() => setPlayingStates((prev) => ({ ...prev, [vid.id]: true }))}
                  onPause={() => setPlayingStates((prev) => ({ ...prev, [vid.id]: false }))}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[9px] font-mono uppercase tracking-widest pointer-events-none z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFeatured ? 'bg-gold animate-pulse' : 'bg-white/40'}`} />
                  <span className={isFeatured ? 'text-gold' : 'text-white/70'}>
                    {isFeatured ? 'FEATURED FILM' : 'CLICK TO WATCH'}
                  </span>
                </div>

                {/* Fullscreen lightbox button for BOTH videos (min 44px target) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoOpen(vid);
                  }}
                  aria-label={`Open ${vid.title} in fullscreen`}
                  className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/80 hover:text-gold hover:border-gold/50 flex items-center justify-center transition-colors cursor-pointer z-20"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Play / Pause circular button (Requirement 22, min 44px) */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  {(!isPlaying || isBlocked || !isFeatured) && (
                    <button
                      onClick={(e) => {
                        if (!isFeatured) {
                          handleSelectFeatured(vid.id);
                        } else {
                          handleTogglePlay(e, vid);
                        }
                      }}
                      className="pointer-events-auto flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 min-h-[44px] min-w-[44px] rounded-full border-2 border-gold/80 bg-black/70 backdrop-blur-md text-gold hover:bg-gold hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.35)] cursor-pointer active:scale-95"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      )}
                    </button>
                  )}
                </div>

                {/* Bottom title & caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex flex-col pointer-events-none">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-display text-white font-medium ${isFeatured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                      {vid.title}
                    </h4>
                    <span className="font-mono text-[10px] text-gold/80 tracking-widest uppercase">
                      0{i + 1} / 0{videos.length}
                    </span>
                  </div>
                  {vid.caption && (
                    <p className="font-serif italic text-xs md:text-sm text-white/70 mt-1 line-clamp-1">
                      "{vid.caption}"
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Small hint below */}
        <p className="font-serif italic text-[11px] text-white/40 tracking-wider mt-8">
          Click the smaller frame to bring it into focus
        </p>
      </div>
    </section>
  );
}
