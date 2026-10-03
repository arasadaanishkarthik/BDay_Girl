import React, { useState, useEffect, Suspense, lazy } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { photos, videos } from './data/mediaLoader';

import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';

import Hero from './sections/Hero';
import Introduction from './sections/Introduction';
import Memories from './sections/Memories';
import Motion from './sections/Motion';
import Birthday from './sections/Birthday';
import FinalSection from './sections/FinalSection';

// Code-split dedicated fullscreen lightboxes (Requirements 2, 3, 15)
const PhotoLightbox = lazy(() => import('./components/PhotoLightbox'));
const VideoLightbox = lazy(() => import('./components/VideoLightbox'));

// Code-split Secret Memory Room components (Requirements 1, 2, 6)
const SecretLockModal = lazy(() => import('./components/SecretRoom/SecretLockModal'));
const SecretRoom = lazy(() => import('./components/SecretRoom/SecretRoom'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);

  // Dedicated, strictly separated media states (Zero crossover)
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Secret Memory Room state
  const [isSecretLockOpen, setIsSecretLockOpen] = useState(false);
  const [isSecretRoomOpen, setIsSecretRoomOpen] = useState(false);

  // Single unified smooth scroll instance with global reference
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
      syncTouch: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    });

    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    // Initial and hash change navigation
    const handleHashNavigation = () => {
      const rawHash = window.location.hash;
      if (!rawHash) return;
      const targetSelector = rawHash === '#moments' ? '#memories' : rawHash;
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        setTimeout(() => {
          if (window.lenis) {
            window.lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    };

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('hashchange', handleHashNavigation);
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      window.lenis = null;
    };
  }, [loading]);

  // Master Modal Scroll Lock: locks body scroll & pauses Lenis when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      Boolean(selectedPhoto) ||
      Boolean(selectedVideo) ||
      isSecretLockOpen ||
      isSecretRoomOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [selectedPhoto, selectedVideo, isSecretLockOpen, isSecretRoomOpen]);

  const handleBirthdayScroll = () => {
    const el = document.querySelector('#birthday');
    if (el) {
      if (window.lenis) {
        window.lenis.scrollTo(el, { offset: 0, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Secret Room Handlers
  const handleOpenSecretLock = () => {
    setIsSecretLockOpen(true);
  };

  const handleSecretUnlocked = () => {
    setIsSecretLockOpen(false);
    setIsSecretRoomOpen(true);
  };

  const handleCloseSecretLock = () => {
    setIsSecretLockOpen(false);
  };

  const handleLockSecretRoom = () => {
    setIsSecretRoomOpen(false);
    setIsSecretLockOpen(false);
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#09090b] text-[#f7f3eb] font-sans antialiased selection:bg-gold selection:text-black overflow-x-hidden">
      {/* High-Performance Film Grain */}
      <div className="film-grain" />

      {/* Dynamic Scroll Progress */}
      {!loading && !isSecretRoomOpen && <ScrollProgress />}

      {/* Cinematic Loading Screen */}
      {loading ? (
        <LoadingScreen onComplete={() => setLoading(false)} />
      ) : (
        <>
          {/* Floating Navigation Header (with 5-click easter egg) */}
          <Navbar
            onBirthdayClick={handleBirthdayScroll}
            onOpenSecretLock={handleOpenSecretLock}
          />

          {/* Main Experience — FINAL FLOW */}
          <main className="relative z-10 w-full overflow-hidden">
            {/* 1. HERO — unique photo: heroPhoto (index 0) */}
            <Hero onSelectPhoto={setSelectedPhoto} />

            {/* 2. INTRODUCTION — unique photo: introPhoto (index 1) */}
            <Introduction onSelectPhoto={setSelectedPhoto} />

            {/* 3. MOMENTS — unique gallery photos only (indices 2..N-3) */}
            <Memories onSelectPhoto={setSelectedPhoto} />

            {/* 4. MOTION — all videos only, strictly separated */}
            <Motion onSelectVideo={setSelectedVideo} />

            {/* 5. BIRTHDAY — unique photo: birthdayPhoto (index N-2) */}
            <Birthday onSelectPhoto={setSelectedPhoto} />

            {/* 6. FINAL MESSAGE — unique photo: finalPhoto (index N-1) */}
            <FinalSection onSelectPhoto={setSelectedPhoto} />
          </main>

          {/* Dedicated Fullscreen Photo Lightbox (strictly photos) */}
          <Suspense fallback={null}>
            {selectedPhoto && (
              <PhotoLightbox
                photo={selectedPhoto}
                photos={photos}
                onClose={() => setSelectedPhoto(null)}
                onSelectPhoto={setSelectedPhoto}
              />
            )}
          </Suspense>

          {/* Dedicated Fullscreen Video Lightbox (strictly videos) */}
          <Suspense fallback={null}>
            {selectedVideo && (
              <VideoLightbox
                video={selectedVideo}
                videos={videos}
                onClose={() => setSelectedVideo(null)}
                onSelectVideo={setSelectedVideo}
              />
            )}
          </Suspense>

          {/* Secret Memory Room Components (Lazy Loaded) */}
          <Suspense fallback={null}>
            {isSecretLockOpen && (
              <SecretLockModal
                isOpen={isSecretLockOpen}
                onClose={handleCloseSecretLock}
                onUnlocked={handleSecretUnlocked}
              />
            )}
            {isSecretRoomOpen && (
              <SecretRoom
                isOpen={isSecretRoomOpen}
                onLock={handleLockSecretRoom}
              />
            )}
          </Suspense>
        </>
      )}
    </div>
  );
}
