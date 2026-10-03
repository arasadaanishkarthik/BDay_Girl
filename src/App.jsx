import React, { useState, useEffect, Suspense, lazy } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { allMedia, photos, videos } from './data/mediaLoader';

import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';

import Hero from './sections/Hero';
import Introduction from './sections/Introduction';
import Memories from './sections/Memories';
import Motion from './sections/Motion';
import Timeline from './sections/Timeline';
import HorizontalGallery from './components/HorizontalGallery';
import ScrollVelocityRotation from './components/ScrollVelocityRotation';
import QuoteSection from './components/QuoteSection';
import MaskTransitionsSection from './components/MaskTransitionsSection';
import StoryBirthdaySection from './components/StoryBirthdaySection';
import FinalSection from './sections/FinalSection';

// Code-split unified fullscreen media lightbox (Section 20 & 34)
const MediaLightbox = lazy(() => import('./components/MediaLightbox'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);

  // Single unified smooth scroll instance (Section 18)
  useEffect(() => {
    if (loading) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(refreshTimer);
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, [loading]);

  const handleBirthdayScroll = () => {
    const el = document.querySelector('#birthday-story');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#f7f3eb] font-sans antialiased selection:bg-gold selection:text-black overflow-x-hidden">
      {/* High-Performance Film Grain (Section 31) */}
      <div className="film-grain" />

      {/* Memory Counter & Dynamic Scroll Progress (Section 13, 30) */}
      {!loading && <ScrollProgress />}

      {/* Cinematic Loading Screen for Sanjana (Section 1) */}
      {loading ? (
        <LoadingScreen onComplete={() => setLoading(false)} />
      ) : (
        <>
          {/* Floating Navigation Header (Section 35) */}
          <Navbar onBirthdayClick={handleBirthdayScroll} />

          {/* Main Experience */}
          <main className="relative z-10 w-full overflow-hidden">
            {/* 1. Optimized Hero (Section 14 & 23) */}
            <Hero onSelectPhoto={setActiveMedia} />

            {/* 2. Introduction & Morph (Section 6, 7) */}
            <Introduction onSelectPhoto={setActiveMedia} />

            {/* 3. Redesigned Ultra-Smooth Virtualized Memories Stack (Section 3, 4, 5, 6, 24, 30) */}
            <Memories onSelectPhoto={setActiveMedia} />

            {/* 4. Living Motion Video Archive (Section 9, 16, 17, 28) */}
            <Motion onSelectVideo={setActiveMedia} />

            {/* 5. Interwoven Living Timeline: Photo + Video Story (Section 12, 14, 29) */}
            <Timeline onSelectMedia={setActiveMedia} />

            {/* 6. Horizontal Editorial Runway Strip (Section 10, 21) */}
            <HorizontalGallery onSelectPhoto={setActiveMedia} />

            {/* 7. Velocity-Driven Angular Physics */}
            <ScrollVelocityRotation onSelectPhoto={setActiveMedia} />

            {/* 8. Minimal Quote & Color Transitions (Section 15, 16) */}
            <QuoteSection />

            {/* 9. Image Mask Transitions (Section 17) */}
            <MaskTransitionsSection onSelectPhoto={setActiveMedia} />

            {/* 10. Scrapbook & Birthday Dedication for Sanjana */}
            <StoryBirthdaySection onSelectPhoto={setActiveMedia} />

            {/* 11. Concluding Fullscreen Zoom & Epilogue for Sanjana (Section 21, 22) */}
            <FinalSection onSelectPhoto={setActiveMedia} />
          </main>

          {/* Unified Fullscreen Media Lightbox (Photos + Videos) (Section 20 & 21) */}
          <Suspense fallback={null}>
            {activeMedia && (
              <MediaLightbox
                item={activeMedia}
                items={allMedia}
                onClose={() => setActiveMedia(null)}
                onSelectItem={setActiveMedia}
              />
            )}
          </Suspense>
        </>
      )}
    </div>
  );
}
