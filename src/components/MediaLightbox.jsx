import React from 'react';
import PhotoLightbox from './PhotoLightbox';
import VideoLightbox from './VideoLightbox';

/**
 * Backward compatibility wrapper for MediaLightbox.
 * Delegates to PhotoLightbox or VideoLightbox based on item type.
 */
export default function MediaLightbox({ item, items, onClose, onSelectItem }) {
  if (!item) return null;
  if (item.type === 'video') {
    return (
      <VideoLightbox
        video={item}
        videos={items}
        onClose={onClose}
        onSelectVideo={onSelectItem}
      />
    );
  }
  return (
    <PhotoLightbox
      photo={item}
      photos={items}
      onClose={onClose}
      onSelectPhoto={onSelectItem}
    />
  );
}
