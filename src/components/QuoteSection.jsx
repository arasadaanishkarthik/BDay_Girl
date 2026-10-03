import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function QuoteSection() {
  const containerRef = useRef(null);
  const qLine1Ref = useRef(null);
  const qLine2Ref = useRef(null);
  const qLine3Ref = useRef(null);
  const authorRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Requirement 16: Background color transition cream -> beige -> dark
    const bgTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1.5,
      },
    });

    bgTimeline
      .to(container, { backgroundColor: '#f5f0e8', color: '#1a1815', duration: 1 })
      .to(container, { backgroundColor: '#e8dfd0', color: '#151310', duration: 1 })
      .to(container, { backgroundColor: '#111116', color: '#f7f3eb', duration: 1.5 });

    // Requirement 15: Animate each line when it enters viewport
    const textTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 65%',
        end: 'center 45%',
        scrub: 1,
      },
    });

    textTimeline
      .fromTo(
        qLine1Ref.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
      )
      .fromTo(
        qLine2Ref.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(
        qLine3Ref.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(
        authorRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8 },
        '-=0.4'
      );

    return () => {
      bgTimeline.kill();
      textTimeline.kill();
    };
  }, []);

  return (
    <section
      id="quote-section"
      ref={containerRef}
      className="relative w-full min-h-[90vh] py-36 px-8 md:px-16 flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-700 select-none bg-[#09090b] text-[#f7f3eb]"
    >
      {/* Decorative luxury quotation marks */}
      <div className="font-serif text-8xl md:text-9xl text-gold/30 leading-none mb-4 select-none">
        “
      </div>

      <div className="max-w-4xl flex flex-col items-center">
        {/* Line 1 */}
        <div className="overflow-hidden py-1">
          <h2
            ref={qLine1Ref}
            className="font-display font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase"
          >
            Every picture holds
          </h2>
        </div>

        {/* Line 2 */}
        <div className="overflow-hidden py-2 my-2">
          <span
            ref={qLine2Ref}
            className="font-editorial-italic font-normal text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-gold tracking-wide inline-block"
          >
            a little piece
          </span>
        </div>

        {/* Line 3 */}
        <div className="overflow-hidden py-1">
          <h2
            ref={qLine3Ref}
            className="font-display font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase"
          >
            of a moment.
          </h2>
        </div>

        {/* Subtext divider */}
        <div
          ref={authorRef}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <div className="w-16 h-[1px] bg-gold/50" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase opacity-60">
            Fragments of time preserved forever
          </span>
        </div>
      </div>
    </section>
  );
}
