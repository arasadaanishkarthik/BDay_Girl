import React from 'react';
import VideoCard from './VideoCard';
import { videos } from '../data/mediaLoader';

export default function VideoGallery({ onSelectVideo }) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {videos.map((video, i) => (
        <VideoCard
          key={`vid-gallery-${video.id}`}
          video={video}
          onClick={onSelectVideo}
          displayIndex={i + 1}
          aspectRatio="aspect-[4/3] md:aspect-[3/4]"
        />
      ))}
    </div>
  );
}
