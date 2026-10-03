import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock } from 'lucide-react';
import { allMedia } from '../data/mediaLoader';
import PhotoCard from '../components/PhotoCard';
import VideoCard from '../components/VideoCard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Living Timeline (Sections 12, 14, 29):
 * - Interweaves discovered photos & living videos into a unified story
 * - Dynamic progressing vertical line
 * - Standard browser cursor
 */
export default function Timeline({ onSelectMedia }) {
  const containerRef = useRef(null);
  const lineProgressRef = useRef(null);
  const itemsRef = useRef([]);

  // Use the first 8 items from the unified photo + video mix
  const timelineItems = allMedia.slice(0, 8);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineProgressRef.current;
    if (!container || !line) return;

    const lineTween = gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 70%',
          end: 'bottom 85%',
          scrub: 1,
        },
      }
    );

    itemsRef.current.forEach((item) => {
      if (!item) return;
      gsap.fromTo(
        item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    return () => {
      lineTween.kill();
    };
  }, []);

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="relative w-full py-28 md:py-44 bg-[#0a0a0f] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 mb-4">
            <Clock className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
              Chapter IV • Living Chronology
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight uppercase">
            The Living Story
          </h2>

          <p className="font-serif italic text-white/70 max-w-lg text-base md:text-xl mt-3">
            Photographs and living motions woven together into an unbroken tapestry.
          </p>
        </div>

        {/* Vertical Progress Line */}
        <div className="relative">
          {/* Base Track */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-white/10" />

          {/* Active Glowing Progress Line */}
          <div
            ref={lineProgressRef}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-gold via-amber-300 to-gold origin-top"
          />

          {/* Timeline Items */}
          <div className="space-y-16 md:space-y-24">
            {timelineItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isVideo = item.type === 'video';
              const label = `${String(idx + 1).padStart(2, '0')} — ${isVideo ? 'MOTION' : 'PHOTO'}`;

              return (
                <div
                  key={`timeline-${item.id}`}
                  ref={(el) => (itemsRef.current[idx] = el)}
                  className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Central Node Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-gold shadow-[0_0_10px_rgba(212,175,55,0.7)] z-20" />

                  {/* Media Container */}
                  <div className="w-full md:w-[45%] pl-12 md:pl-0">
                    {isVideo ? (
                      <VideoCard
                        video={item}
                        onClick={onSelectMedia}
                        displayIndex={idx + 1}
                        aspectRatio="aspect-[4/3] md:aspect-[3/4]"
                      />
                    ) : (
                      <PhotoCard
                        photo={item}
                        onClick={onSelectMedia}
                        displayIndex={idx + 1}
                        aspectRatio="aspect-[4/3] md:aspect-[3/4]"
                      />
                    )}
                  </div>

                  {/* Metadata / Story Marker */}
                  <div
                    className={`w-full md:w-[45%] pl-12 md:pl-0 flex flex-col ${
                      isEven ? 'md:items-end md:text-right' : 'md:items-start md:text-left'
                    }`}
                  >
                    <span className="text-xs font-mono text-gold tracking-[0.25em] uppercase font-semibold mb-1">
                      {label}
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-white font-light">
                      {item.title}
                    </h3>
                    <p className="font-serif italic text-sm text-white/60 mt-1 max-w-sm">
                      "{item.caption}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
