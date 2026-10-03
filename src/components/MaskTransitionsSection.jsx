import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos } from '../data/mediaLoader';

gsap.registerPlugin(ScrollTrigger);

export default function MaskTransitionsSection({ onSelectPhoto }) {
  const containerRef = useRef(null);
  const circleMaskRef = useRef(null);
  const slitMaskRef = useRef(null);

  const photoA = photos[3] || photos[0];
  const photoB = photos[4] || photos[0];

  useEffect(() => {
    const circleEl = circleMaskRef.current;
    const slitEl = slitMaskRef.current;

    if (circleEl) {
      gsap.fromTo(
        circleEl,
        { clipPath: 'circle(12% at 50% 50%)', scale: 0.95 },
        {
          clipPath: 'circle(85% at 50% 50%)',
          scale: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: circleEl,
            start: 'top 80%',
            end: 'center 45%',
            scrub: 1.2,
          },
        }
      );
    }

    if (slitEl) {
      gsap.fromTo(
        slitEl,
        { clipPath: 'inset(48% 0% 48% 0%)', scale: 1.1 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1.0,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: slitEl,
            start: 'top 80%',
            end: 'center 45%',
            scrub: 1.2,
          },
        }
      );
    }
  }, []);

  return (
    <section
      id="mask-transitions"
      ref={containerRef}
      className="relative w-full py-28 md:py-44 bg-[#09090b] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center text-center mb-24">
          <span className="text-[10px] md:text-xs font-mono tracking-[0.35em] uppercase text-gold mb-3">
            Chapter VII • Geometric Reveals
          </span>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white font-light">
            Image Mask Transitions
          </h2>
          <p className="font-serif italic text-white/50 text-sm md:text-base mt-2">
            Shapes expanding into memories
          </p>
        </div>

        {photoA && (
          <div className="mb-32">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-gold">01 • EXPANDING CIRCLE REVEAL</span>
            </div>

            <div
              ref={circleMaskRef}
              onClick={() => onSelectPhoto && onSelectPhoto(photoA)}
              className="relative w-full h-[60vh] md:h-[78vh] overflow-hidden bg-[#16161f] shadow-2xl cursor-pointer will-change-transform rounded-xl border border-white/10"
            >
              <picture>
                <source media="(min-width: 1024px)" srcSet={photoA.large || photoA.src} type="image/webp" />
                <img
                  src={photoA.medium || photoA.src}
                  alt={photoA.title}
                  className="w-full h-full object-cover object-center"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 p-8 md:p-12 flex flex-col justify-end">
                <h3 className="font-display text-2xl md:text-4xl text-white font-light mt-1">
                  {photoA.title}
                </h3>
                <p className="font-serif italic text-white/70 text-sm md:text-base">
                  "{photoA.caption}"
                </p>
              </div>
            </div>
          </div>
        )}

        {photoB && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-gold">02 • HORIZONTAL APERTURE SLIT</span>
            </div>

            <div
              ref={slitMaskRef}
              onClick={() => onSelectPhoto && onSelectPhoto(photoB)}
              className="relative w-full h-[60vh] md:h-[78vh] overflow-hidden bg-[#16161f] shadow-2xl cursor-pointer will-change-transform rounded-xl border border-white/10"
            >
              <picture>
                <source media="(min-width: 1024px)" srcSet={photoB.large || photoB.src} type="image/webp" />
                <img
                  src={photoB.medium || photoB.src}
                  alt={photoB.title}
                  className="w-full h-full object-cover object-center"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 p-8 md:p-12 flex flex-col justify-end">
                <h3 className="font-display text-2xl md:text-4xl text-white font-light mt-1">
                  {photoB.title}
                </h3>
                <p className="font-serif italic text-white/70 text-sm md:text-base">
                  "{photoB.caption}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
