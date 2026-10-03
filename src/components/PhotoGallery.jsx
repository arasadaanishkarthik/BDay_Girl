import React from 'react';
import PhotoCard from './PhotoCard';
import { photos } from '../data/mediaLoader';

export default function PhotoGallery({ onSelectPhoto, limit = 12 }) {
  const displayPhotos = photos.slice(0, limit);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {displayPhotos.map((photo, i) => (
        <PhotoCard
          key={`gallery-${photo.id}`}
          photo={photo}
          onClick={onSelectPhoto}
          displayIndex={i + 1}
          aspectRatio="aspect-[3/4]"
        />
      ))}
    </div>
  );
}
