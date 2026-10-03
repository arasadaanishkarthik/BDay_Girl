/**
 * Unified Dynamic Media Discovery System (Sections 7, 8, 9, 10, 11, 12, 13)
 * - Automatically discovers ANY number of photos and videos using Vite import.meta.glob
 * - STRICT EXCLUSION: Completely excludes anything inside /p/ or p/**
 * - Dynamically computes total media count (no hard-coded 30 limit)
 * - Interleaves photos and videos into a seamless cinematic story
 */

// 1. Discover all images
const rawImages = import.meta.glob(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, query: '?url', import: 'default' }
);

// 2. Discover all videos
const rawVideos = import.meta.glob(
  '/src/assets/**/*.{mp4,webm,mov}',
  { eager: true, query: '?url', import: 'default' }
);

// Strict exclusion rule for the 'p' folder (Section 8 & 9)
const isExcludedPath = (path) => {
  const normalized = path.replace(/\\/g, '/');
  return (
    normalized.includes('/p/') ||
    normalized.startsWith('/src/assets/p/') ||
    normalized.startsWith('p/') ||
    normalized.includes('/p.')
  );
};

// Editorial caption generator based on index
const editorialCaptions = [
  { title: "The Archway", caption: "The doorway into sunlit reverie" },
  { title: "Monochrome Grace", caption: "Timeless silhouettes against the hills" },
  { title: "Heritage Reverie", caption: "In tune with ancient stone and quiet melodies" },
  { title: "Candid Breeze", caption: "Just being herself in the open air" },
  { title: "Quiet Contemplation", caption: "A soft pause between the hours" },
  { title: "Violet Hues", caption: "Shades of elegance carved in time" },
  { title: "Sunlit Pathways", caption: "Golden light touching peaceful trails" },
  { title: "Green Hillside", caption: "Where nature mirrors pure grace" },
  { title: "Stone Whispers", caption: "Stories etched in quiet pillars" },
  { title: "A Gentle Glance", caption: "Unplanned, pure, and effortless" },
  { title: "Ancient Echoes", caption: "Modern dreams amidst historic arches" },
  { title: "Golden Hour", caption: "When the sky paints everything in amber" },
  { title: "Soft Focus", caption: "Little moments that hold big emotions" },
  { title: "Laughter Caught", caption: "A flash of pure, infectious joy" },
  { title: "Wanderer’s Solace", caption: "Finding stillness in sprawling heights" },
  { title: "Candid Stillness", caption: "The quiet art of being present" },
  { title: "Festive Evening", caption: "Glittering lights and shimmering threads" },
  { title: "Whisper of Wind", caption: "Loose hair dancing with the hill breeze" },
  { title: "Cave Alcove", caption: "Stepping lightly through sheltered history" },
  { title: "Radiant Mood", caption: "Another memory to keep forever" },
  { title: "Steps of Time", caption: "Every climb has its own rhythm" },
  { title: "Midsummer Afternoon", caption: "Sun warmth lingering on leaves" },
  { title: "Shadow & Light", caption: "Intimate contrasts of shade and sun" },
  { title: "Casual Grace", caption: "Effortless poise, natural beauty" },
  { title: "Serenity", caption: "Calm eyes seeing through the horizon" },
  { title: "Temple Ridge", caption: "High stone overlooking the valley" },
  { title: "Spontaneous Smile", caption: "The charm that brightens the room" },
  { title: "Verdant Breeze", caption: "Lush green contrasts and deep purples" },
  { title: "A Glimpse Beyond", caption: "Looking forward with hope and light" },
  { title: "Living Memory", caption: "Moments held forever in stillness" },
];

// Helper to extract base filename (e.g. photo01)
const getBaseName = (filePath) => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

// 3. Process filtered images (never include p/)
export const photos = Object.entries(rawImages)
  .filter(([path]) => !isExcludedPath(path))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url], index) => {
    const base = getBaseName(path);
    const meta = editorialCaptions[index % editorialCaptions.length];
    const num = index + 1;

    // Use optimized WebP if it exists in public/images/thumbnails/
    const hasOptimized = /photo\d+/i.test(base);
    const thumbnail = hasOptimized ? `/images/thumbnails/${base}.webp` : url;
    const medium = hasOptimized ? `/images/medium/${base}.webp` : url;
    const large = hasOptimized ? `/images/large/${base}.webp` : url;
    const blur = hasOptimized ? `/images/blur/${base}.webp` : url;

    return {
      id: `img-${num}`,
      index: num,
      type: 'image',
      src: url,
      thumbnail,
      medium,
      large,
      blur,
      title: meta.title,
      caption: meta.caption,
      aspect: 'portrait'
    };
  });

// 4. Process filtered videos (never include p/)
export const videos = Object.entries(rawVideos)
  .filter(([path]) => !isExcludedPath(path))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url], index) => {
    const base = getBaseName(path);
    const num = index + 1;
    const poster = `/videos/posters/video${String(num).padStart(2, '0')}.webp`;

    return {
      id: `vid-${num}`,
      index: num,
      type: 'video',
      src: url,
      poster,
      title: num === 1 ? "Heritage Whisper" : num === 2 ? "Sunlit Hillside" : `Living Moment ${num}`,
      caption: num === 1 ? "Ancient stone walls and gentle laughter in motion" : "Wind dancing through the green cliffs",
      aspect: 'portrait'
    };
  });

// Fallback videos from public/videos if rawVideos is empty
if (videos.length === 0) {
  videos.push(
    {
      id: 'vid-1',
      index: 1,
      type: 'video',
      src: '/videos/video01.mp4',
      poster: '/videos/posters/video01.webp',
      title: 'Heritage Whisper',
      caption: 'Ancient stone walls and gentle laughter in motion',
      aspect: 'portrait'
    },
    {
      id: 'vid-2',
      index: 2,
      type: 'video',
      src: '/videos/video02.mp4',
      poster: '/videos/posters/video02.webp',
      title: 'Sunlit Hillside',
      caption: 'Wind dancing through the green cliffs',
      aspect: 'portrait'
    }
  );
}

// 5. Interleave Photos & Videos into a single unified media story (Section 12, 14)
// Structure: 2-3 photos, then 1 video, then photos, then video...
export const allMedia = [];
let vIdx = 0;
photos.forEach((photo, idx) => {
  allMedia.push(photo);
  // Interleave a video every 4 photos if videos are available
  if ((idx + 1) % 4 === 0 && vIdx < videos.length) {
    allMedia.push(videos[vIdx]);
    vIdx++;
  }
});

// If any remaining videos, append them naturally
while (vIdx < videos.length) {
  allMedia.push(videos[vIdx]);
  vIdx++;
}

// Export dynamic totals
export const totalPhotos = photos.length;
export const totalVideos = videos.length;
export const totalMedia = allMedia.length;

// Formatter for dynamic counters (Section 13)
export const formatMediaCounter = (currentIdx, total = totalMedia) => {
  const currentStr = String(currentIdx + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');
  return `${currentStr} / ${totalStr}`;
};

export default allMedia;
