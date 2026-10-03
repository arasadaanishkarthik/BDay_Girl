import React from 'react';
import { Film } from 'lucide-react';
import { videos } from '../data/mediaLoader';
import VideoCard from '../components/VideoCard';

export default function Motion({ onSelectVideo }) {
  if (videos.length === 0) return null;

  const featureVideo = videos[0];
  const secondaryVideos = videos.slice(1, 3);
  const remainingVideos = videos.slice(3);

  return (
    <section
      id="motion"
      className="relative w-full py-28 md:py-44 bg-[#09090d] text-[#f7f3eb] overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 mb-4">
            <Film className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
              Chapter III • Living Frames
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight uppercase">
            Moments in Motion
          </h2>

          <p className="font-serif italic text-white/70 max-w-xl text-base md:text-xl mt-3">
            "Some memories are better experienced in motion."
          </p>
        </div>

        {/* Feature Large Video */}
        {featureVideo && (
          <div className="mb-10 md:mb-16">
            <VideoCard
              video={featureVideo}
              onClick={onSelectVideo}
              displayIndex={1}
              aspectRatio="aspect-video max-h-[70vh]"
              className="w-full"
            />
          </div>
        )}

        {/* Secondary Dual Videos */}
        {secondaryVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10 md:mb-16">
            {secondaryVideos.map((vid, i) => (
              <VideoCard
                key={`motion-sec-${vid.id}`}
                video={vid}
                onClick={onSelectVideo}
                displayIndex={i + 2}
                aspectRatio="aspect-[4/3] md:aspect-[16/10]"
              />
            ))}
          </div>
        )}

        {/* Remaining Videos if any */}
        {remainingVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {remainingVideos.map((vid, i) => (
              <VideoCard
                key={`motion-rem-${vid.id}`}
                video={vid}
                onClick={onSelectVideo}
                displayIndex={i + 4}
                aspectRatio="aspect-[3/4]"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
