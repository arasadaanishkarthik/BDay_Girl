import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { introPhoto } from '../data/mediaLoader';

gsap.registerPlugin(ScrollTrigger);

export default function Introduction({ onSelectPhoto }) {
  const containerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const photoExpandRef = useRef(null);
  const photoWrapRef = useRef(null);

  const revealPhoto = introPhoto;

  useEffect(() => {
    const container = containerRef.current;
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const l3 = line3Ref.current;
    const photo = photoExpandRef.current;
    const photoWrap = photoWrapRef.current;

    if (!container || !l1 || !l2 || !l3) return;

    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 75%',
        end: 'center center',
        scrub: 1,
      },
    });

    textTl
      .fromTo(
        l1,
        { y: 60, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
        { y: 0, opacity: 1, clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)', duration: 1 }
      )
      .fromTo(
        l2,
        { y: 60, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
        { y: 0, opacity: 1, clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)', duration: 1 },
        '-=0.6'
      )
      .fromTo(
        l3,
        { y: 60, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
        { y: 0, opacity: 1, clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)', duration: 1 },
        '-=0.6'
      );

    // Expanding First Photo Morph
    if (photo && photoWrap) {
      const isMobile = window.innerWidth < 640;
      gsap.fromTo(
        photoWrap,
        { width: isMobile ? '88%' : '34%', borderRadius: isMobile ? '20px' : '36px' },
        {
          width: '100%',
          borderRadius: '0px',
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: photoWrap,
            start: 'top 85%',
            end: 'center 45%',
            scrub: 1.2,
          },
        }
      );

      gsap.fromTo(
        photo,
        { scale: 1.2 },
        {
          scale: 1.0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: photoWrap,
            start: 'top 85%',
            end: 'center 45%',
            scrub: 1.2,
          },
        }
      );
    }

    return () => {
      textTl.kill();
    };
  }, []);

  return (
    <section
      id="introduction"
      ref={containerRef}
      className="relative w-full py-20 sm:py-28 md:py-44 flex flex-col items-center justify-center bg-[#09090b] text-[#f7f3eb] overflow-hidden select-none"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Typography Sequence */}
      <div className="flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl z-10 mb-14 sm:mb-20 md:mb-32">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] uppercase text-gold/70 mb-4 sm:mb-6">
          Chapter I • The Beginning
        </span>

        <div className="overflow-hidden">
          <h2
            ref={line1Ref}
            className="font-display font-light text-3xl sm:text-6xl md:text-8xl tracking-[0.08em] sm:tracking-[0.1em] text-white/90 uppercase"
          >
            Some moments
          </h2>
        </div>

        <div className="overflow-hidden my-1 sm:my-3">
          <span
            ref={line2Ref}
            className="font-editorial-italic font-normal text-4xl sm:text-7xl md:text-9xl text-gold tracking-wider inline-block"
          >
            deserve
          </span>
        </div>

        <div className="overflow-hidden">
          <h2
            ref={line3Ref}
            className="font-display font-light text-3xl sm:text-6xl md:text-8xl tracking-[0.08em] sm:tracking-[0.1em] text-white/90 uppercase"
          >
            to be remembered.
          </h2>
        </div>
      </div>

      {/* Expanding First Photo Morph */}
      {revealPhoto && (
        <div className="w-full flex justify-center px-0 overflow-hidden relative">
          <div
            ref={photoWrapRef}
            onClick={() => onSelectPhoto && onSelectPhoto(revealPhoto)}
            className="relative h-[55vh] sm:h-[65vh] md:h-[85vh] overflow-hidden shadow-2xl cursor-pointer mx-auto transform-gpu will-change-transform"
            style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '88%' : '34%', borderRadius: '24px' }}
          >
            <picture>
              <source media="(min-width: 1024px)" srcSet={revealPhoto.large || revealPhoto.src} type="image/webp" />
              <source media="(max-width: 1023px)" srcSet={revealPhoto.medium || revealPhoto.src} type="image/webp" />
              <img
                ref={photoExpandRef}
                src={revealPhoto.medium || revealPhoto.src}
                alt={revealPhoto.title}
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 flex flex-col justify-end p-8 md:p-14">
              <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
                EXHIBITION 02
              </span>
              <h3 className="font-display text-2xl md:text-4xl text-white font-light mt-1">
                {revealPhoto.title}
              </h3>
              <p className="font-serif italic text-white/70 text-sm md:text-base mt-1">
                "{revealPhoto.caption}"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
