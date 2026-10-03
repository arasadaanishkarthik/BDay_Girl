import React, { useState, useEffect, useRef } from 'react';

/**
 * High-performance PhotoCard with:
 * - Standard system cursor (no custom cursor)
 * - IntersectionObserver lazy loading
 * - Progressive Blur-Up loading
 * - Responsive <picture> (mobile thumbnail / desktop medium)
 * - GPU-only transforms
 */
export default function PhotoCard({
  photo,
  onClick,
  className = '',
  aspectRatio = 'aspect-[3/4]',
  priority = false,
  showMeta = true,
  displayIndex
}) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (priority) return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '250px 0px', threshold: 0.01 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [priority]);

  const indexLabel = displayIndex !== undefined ? String(displayIndex).padStart(2, '0') : photo.index ? String(photo.index).padStart(2, '0') : '01';

  return (
    <div
      ref={cardRef}
      onClick={() => onClick && onClick(photo)}
      className={`group relative overflow-hidden rounded-md bg-[#121218] border border-white/10 hover:border-gold/60 shadow-xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform ${className}`}
    >
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-[#161622]`}>
        {/* Tiny Blur-up background placeholder */}
        {photo.blur && (
          <img
            src={photo.blur}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover filter blur-lg scale-110 transition-opacity duration-500 pointer-events-none ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Responsive Picture when in view */}
        {isInView && (
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={photo.medium || photo.large}
              type="image/webp"
            />
            <source
              media="(max-width: 1023px)"
              srcSet={photo.thumbnail || photo.medium}
              type="image/webp"
            />
            <img
              src={photo.medium || photo.thumbnail}
              alt={photo.title || 'Photograph'}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </picture>
        )}

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />

        {/* Dynamic Frame Counter Badge (Section 13) */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-[9px] font-mono text-gold uppercase tracking-widest">
          FRAME {indexLabel}
        </div>
      </div>

      {/* Meta Footer */}
      {showMeta && (
        <div className="p-4 flex flex-col justify-between">
          <h4 className="font-display text-base text-white/95 font-medium group-hover:text-gold transition-colors truncate">
            {photo.title}
          </h4>
          {photo.caption && (
            <p className="font-serif italic text-xs text-white/60 truncate mt-0.5">
              "{photo.caption}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
