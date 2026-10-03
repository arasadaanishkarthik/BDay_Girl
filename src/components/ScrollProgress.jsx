import React, { useEffect, useState } from 'react';
import { totalPhotos } from '../data/mediaLoader';

/**
 * Dynamic Memory Counter & Progress Pill (Sections 13 & 30):
 * - Throttled scroll observer
 * - Dynamically computes active photo out of totalPhotos (no hardcoded 30)
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [photoCount, setPhotoCount] = useState(1);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const ratio = Math.min(Math.max(currentScroll / (totalHeight || 1), 0), 1);
          setProgress(Math.round(ratio * 100));

          const currentPhoto = Math.min(Math.floor(ratio * totalPhotos) + 1, totalPhotos);
          setPhotoCount(currentPhoto);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-[#121218]/85 backdrop-blur-md border border-white/15 text-white/80 shadow-2xl pointer-events-none select-none">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-gold">
        <span>MEM</span>
        <span className="font-bold">{String(photoCount).padStart(2, '0')}</span>
        <span className="text-white/40">/ {String(totalPhotos).padStart(2, '0')}</span>
      </div>

      <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="font-mono text-[10px] text-white/50">{progress}%</span>
    </div>
  );
}
