import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp } from 'lucide-react';
import { SITE_CONFIG } from '../data/config';
import { photos, totalPhotos } from '../data/mediaLoader';
import MagneticButton from '../components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

export default function FinalSection({ onSelectPhoto }) {
  const containerRef = useRef(null);
  const zoomImageRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const finalScreenRef = useRef(null);

  const finalPhoto = photos[photos.length - 1] || photos[0];

  useEffect(() => {
    const container = containerRef.current;
    const img = zoomImageRef.current;
    const t1 = text1Ref.current;
    const t2 = text2Ref.current;
    const finalScreen = finalScreenRef.current;

    if (!container || !img) return;

    const zoomTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 1.2,
      },
    });

    zoomTl
      .fromTo(img, { scale: 1.0 }, { scale: 1.08, ease: 'none', duration: 2 })
      .fromTo(t1, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=1.2')
      .fromTo(t2, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, '-=0.5')
      .to([t1, t2, img], { opacity: 0.15, filter: 'blur(8px)', duration: 1.5 });

    if (finalScreen) {
      gsap.fromTo(
        finalScreen,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: finalScreen,
            start: 'top 80%',
            end: 'center 40%',
            scrub: 1,
          },
        }
      );
    }

    return () => {
      zoomTl.kill();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="final-section" className="relative w-full bg-[#050507] text-[#f7f3eb] select-none">
      {/* Fullscreen Concluding Zoom */}
      <section
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {finalPhoto && (
            <picture>
              <source media="(min-width: 1024px)" srcSet={finalPhoto.large || finalPhoto.src} type="image/webp" />
              <img
                ref={zoomImageRef}
                src={finalPhoto.medium || finalPhoto.src}
                alt={finalPhoto.title}
                onClick={() => onSelectPhoto && onSelectPhoto(finalPhoto)}
                className="w-full h-full object-cover object-center cursor-pointer will-change-transform transform-gpu"
              />
            </picture>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-black/40 to-black/60" />
        </div>

        {/* Concluding Typography: SANJANA */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
          <h2
            ref={text1Ref}
            className="font-display font-light text-5xl sm:text-7xl md:text-9xl uppercase tracking-[0.25em] text-white drop-shadow-2xl"
          >
            {SITE_CONFIG.HER_NAME}
          </h2>

          <p
            ref={text2Ref}
            className="font-serif italic text-xl sm:text-2xl md:text-3xl text-gold mt-4 tracking-widest drop-shadow"
          >
            Until the next memory.
          </p>
        </div>
      </section>

      {/* Dark Epilogue Memorial Screen */}
      <section
        ref={finalScreenRef}
        className="relative w-full min-h-screen py-32 px-6 flex flex-col justify-between items-center bg-[#050507] text-center"
      >
        <div className="h-10" />

        <div className="flex flex-col items-center max-w-xl my-auto">
          <span className="font-display text-4xl text-gold mb-6">✧</span>

          {/* Dynamic Media Count (Section 7 & 13) */}
          <h3 className="font-display text-3xl sm:text-5xl md:text-6xl text-white/90 uppercase tracking-[0.2em] font-light">
            {totalPhotos} photographs.
          </h3>

          <h3 className="font-display text-3xl sm:text-5xl md:text-6xl text-gold/90 uppercase tracking-[0.2em] font-light mt-3">
            Countless memories.
          </h3>

          <div className="w-12 h-[1px] bg-white/20 my-8" />

          <span className="font-display text-2xl sm:text-4xl uppercase tracking-[0.3em] text-white font-light">
            {SITE_CONFIG.HER_NAME}
          </span>

          {SITE_CONFIG.BIRTHDAY_TOUCH.enabled && (
            <span className="font-serif italic text-sm text-gold/70 mt-3 tracking-widest">
              Happy Birthday • Cherished Always
            </span>
          )}
        </div>

        {/* Back to Top */}
        <div className="pb-12">
          <MagneticButton
            onClick={scrollToTop}
            ariaLabel="Back to top"
            className="px-8 py-3.5 rounded-full border border-white/20 hover:border-gold bg-white/5 hover:bg-gold/10 text-white/80 hover:text-gold text-xs font-mono uppercase tracking-[0.3em] transition-all duration-300 flex items-center gap-3 group cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-gold group-hover:-translate-y-1 transition-transform" />
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}
