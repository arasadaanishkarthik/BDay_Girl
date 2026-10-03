import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos } from '../data/mediaLoader';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVelocityRotation({ onSelectPhoto }) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // Use up to 6 featured portraits
  const velocityPhotos = photos.slice(0, Math.min(6, photos.length));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = Math.max(Math.min(self.getVelocity() / 400, 12), -12);

        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          const direction = idx % 2 === 0 ? 1 : -1;
          const targetRot = velocity * direction * 0.7;

          gsap.to(card, {
            rotation: targetRot,
            duration: 0.25,
            ease: 'power1.out',
            overwrite: 'auto',
            onComplete: () => {
              gsap.to(card, {
                rotation: 0,
                duration: 0.6,
                ease: 'power2.out',
              });
            },
          });
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      id="velocity-gallery"
      ref={containerRef}
      className="relative w-full py-28 md:py-40 bg-[#0a0a0e] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="flex flex-col items-center text-center px-6 mb-16 max-w-3xl mx-auto">
        <span className="text-[10px] md:text-xs font-mono tracking-[0.35em] uppercase text-gold mb-3">
          Chapter VI • Kinetic Physics
        </span>
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white font-light">
          Velocity In Rhythm
        </h2>
        <p className="font-serif italic text-white/50 text-sm md:text-base mt-3">
          Scroll fast or slow — frames tilt dynamically with your speed and settle back to stillness.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {velocityPhotos.map((photo, idx) => (
          <div
            key={`velocity-${photo.id}`}
            ref={(el) => (cardsRef.current[idx] = el)}
            onClick={() => onSelectPhoto && onSelectPhoto(photo)}
            className="group cursor-pointer will-change-transform transform-gpu"
          >
            <div className="relative overflow-hidden rounded-md bg-[#14141c] border border-white/10 group-hover:border-gold/60 shadow-xl transition-all duration-300">
              <div className="relative aspect-[3/4] overflow-hidden">
                <picture>
                  <source media="(min-width: 1024px)" srcSet={photo.medium || photo.src} type="image/webp" />
                  <img
                    src={photo.thumbnail || photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-104"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono text-gold border border-white/10">
                  FRAME {String(idx + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="p-5 flex flex-col">
                <h3 className="font-display text-lg text-white font-normal group-hover:text-gold transition-colors">
                  {photo.title}
                </h3>
                <p className="font-serif italic text-xs text-white/60 mt-1 line-clamp-1">
                  "{photo.caption}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
