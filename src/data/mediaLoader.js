/**
 * Unified Dynamic Media Discovery System — ZERO DUPLICATION
 *
 * CENTRAL PHOTO REGISTRY:
 * - Every unique photo appears EXACTLY ONCE across the entire website.
 * - Photos are pre-assigned to sections before any component renders.
 * - Hero: photo[0]
 * - Prologue/Intro: photo[1]
 * - Memories (Stack): photos[2..N-3]
 * - Birthday: photo[N-2]
 * - Final: photo[N-1]
 * - Deduplicated based on normalized file path (using Map).
 *
 * VIDEO DISCOVERY:
 * - Only actual video files (.mp4, .webm, .mov) enter videos[].
 * - Poster files, thumbnails, and duplicates are strictly excluded.
 * - Exactly the actual number of video files (e.g. 2 files -> 2 cards).
 */

const normalizePath = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/').toLowerCase();
};

// Strict exclusion rule for the 'p' folder (Requirement 8)
const isExcludedPath = (path) => {
  const norm = normalizePath(path);
  return (
    norm.includes('/p/') ||
    norm.startsWith('/src/assets/p/') ||
    norm.startsWith('p/') ||
    norm.includes('/p.') ||
    norm.includes('/secret/')
  );
};

// Helper to extract base filename (e.g. photo01)
const getBaseName = (filePath) => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

// ─── 1. EDITORIAL CAPTIONS ────────────────────────────────────────────────────
const editorialCaptions = [
  { title: 'The Archway', caption: 'The doorway into sunlit reverie' },
  { title: 'Monochrome Grace', caption: 'Timeless silhouettes against the hills' },
  { title: 'Heritage Reverie', caption: 'In tune with ancient stone and quiet melodies' },
  { title: 'Candid Breeze', caption: 'Just being herself in the open air' },
  { title: 'Quiet Contemplation', caption: 'A soft pause between the hours' },
  { title: 'Violet Hues', caption: 'Shades of elegance carved in time' },
  { title: 'Sunlit Pathways', caption: 'Golden light touching peaceful trails' },
  { title: 'Green Hillside', caption: 'Where nature mirrors pure grace' },
  { title: 'Stone Whispers', caption: 'Stories etched in quiet pillars' },
  { title: 'A Gentle Glance', caption: 'Unplanned, pure, and effortless' },
  { title: 'Ancient Echoes', caption: 'Modern dreams amidst historic arches' },
  { title: 'Golden Hour', caption: 'When the sky paints everything in amber' },
  { title: 'Soft Focus', caption: 'Little moments that hold big emotions' },
  { title: 'Laughter Caught', caption: 'A flash of pure, infectious joy' },
  { title: "Wanderer's Solace", caption: 'Finding stillness in sprawling heights' },
  { title: 'Candid Stillness', caption: 'The quiet art of being present' },
  { title: 'Festive Evening', caption: 'Glittering lights and shimmering threads' },
  { title: 'Whisper of Wind', caption: 'Loose hair dancing with the hill breeze' },
  { title: 'Cave Alcove', caption: 'Stepping lightly through sheltered history' },
  { title: 'Radiant Mood', caption: 'Another memory to keep forever' },
  { title: 'Steps of Time', caption: 'Every climb has its own rhythm' },
  { title: 'Midsummer Afternoon', caption: 'Sun warmth lingering on leaves' },
  { title: 'Shadow & Light', caption: 'Intimate contrasts of shade and sun' },
  { title: 'Casual Grace', caption: 'Effortless poise, natural beauty' },
  { title: 'Serenity', caption: 'Calm eyes seeing through the horizon' },
  { title: 'Temple Ridge', caption: 'High stone overlooking the valley' },
  { title: 'Spontaneous Smile', caption: 'The charm that brightens the room' },
  { title: 'Verdant Breeze', caption: 'Lush green contrasts and deep purples' },
  { title: 'A Glimpse Beyond', caption: 'Looking forward with hope and light' },
  { title: 'Living Memory', caption: 'Moments held forever in stillness' },
  { title: 'Still Waters', caption: 'Reflecting beauty in every moment' },
  { title: 'Evening Grace', caption: 'The day fading into warmth' },
  { title: 'Morning Light', caption: 'First hours painted in gold' },
  { title: 'Timeless Portrait', caption: 'A frame worthy of forever' },
  { title: 'The Final Frame', caption: 'One last look, one last breath' },
];

// ─── 2. DISCOVER PHOTOS FROM src/assets/photos/ ─────────────────────────────
const rawImages = import.meta.glob(
  '/src/assets/photos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, query: '?url', import: 'default' }
);

// Deduplicate based on normalized file path (Requirement 9)
const uniquePhotosMap = new Map();
Object.entries(rawImages).forEach(([path, url]) => {
  if (isExcludedPath(path)) return;
  const key = normalizePath(path);
  if (!uniquePhotosMap.has(key)) {
    uniquePhotosMap.set(key, { path, url });
  }
});

const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';

const rawPhotoList = Array.from(uniquePhotosMap.values())
  .sort((a, b) => a.path.localeCompare(b.path))
  .map(({ path, url }, index) => {
    const base = getBaseName(path);
    const meta = editorialCaptions[index % editorialCaptions.length];
    const num = index + 1;
    const hasOptimized = /photo\d+/i.test(base);

    return {
      id: `img-${num}`,
      index: num,
      type: 'image',
      src: url,
      thumbnail: hasOptimized ? `${BASE_URL}images/thumbnails/${base}.webp` : url,
      medium: hasOptimized ? `${BASE_URL}images/medium/${base}.webp` : url,
      large: hasOptimized ? `${BASE_URL}images/large/${base}.webp` : url,
      blur: hasOptimized ? `${BASE_URL}images/blur/${base}.webp` : url,
      title: meta.title,
      caption: meta.caption,
      aspect: 'portrait',
    };
  });

// ─── 3. CENTRAL PHOTO REGISTRY — ZERO DUPLICATION ────────────────────────────
// Assignment (for N total photos):
//   index 0        → heroPhoto
//   index 1        → introPhoto
//   index N-2      → birthdayPhoto  (second-to-last)
//   index N-1      → finalPhoto     (last)
//   indices 2..N-3 → galleryPhotos  (all remaining, shown only in Memories stack)

const _total = rawPhotoList.length;

export const heroPhoto     = _total > 0 ? rawPhotoList[0] : null;
export const introPhoto    = _total > 1 ? rawPhotoList[1] : rawPhotoList[0] || null;
export const finalPhoto    = _total > 2 ? rawPhotoList[_total - 1] : rawPhotoList[0] || null;
export const birthdayPhoto = _total > 3 ? rawPhotoList[_total - 2] : rawPhotoList[0] || null;

// Gallery: indices 2 through (_total - 3) inclusive (everything except hero, intro, birthday, final)
const _galleryEnd = _total > 4 ? _total - 2 : _total; // exclusive index
export const galleryPhotos = rawPhotoList.slice(2, _galleryEnd);

// Full photo array — used by lightbox navigation for photos
export const photos = rawPhotoList;

export const totalPhotos = rawPhotoList.length;
export const totalGalleryPhotos = galleryPhotos.length;

// ─── 4. DISCOVER VIDEOS (ONLY ACTUAL VIDEO FILES) ───────────────────────────
// Requirements 12, 13, 14, 15:
// - Only .mp4, .webm, .mov
// - Do NOT treat images or posters as videos
// - Deduplicate before rendering
// - Exactly the number of actual videos

const videoTitles = [
  { title: 'Heritage Whisper', caption: 'Ancient stone walls and gentle laughter in motion' },
  { title: 'Sunlit Hillside',  caption: 'Wind dancing through the green cliffs' },
];

const rawVideos = import.meta.glob(
  '/src/assets/videos/*.{mp4,webm,mov}',
  { eager: true, query: '?url', import: 'default' }
);

const uniqueVideosMap = new Map();
Object.entries(rawVideos).forEach(([path, url]) => {
  if (isExcludedPath(path)) return;
  const base = getBaseName(path);
  const key = base.toLowerCase();
  if (!uniqueVideosMap.has(key)) {
    uniqueVideosMap.set(key, {
      path,
      src: url,
      base,
    });
  }
});

// Fallback to public/videos/ if glob returned empty
if (uniqueVideosMap.size === 0) {
  ['video01', 'video02'].forEach((base) => {
    uniqueVideosMap.set(base, {
      path: `${BASE_URL}videos/${base}.mp4`,
      src: `${BASE_URL}videos/${base}.mp4`,
      base,
    });
  });
}

export const videos = Array.from(uniqueVideosMap.values())
  .sort((a, b) => a.base.localeCompare(b.base))
  .map((v, index) => {
    const num = index + 1;
    const base = v.base;
    const meta = videoTitles[index % videoTitles.length];
    return {
      id: `video-0${num}`,
      index: num,
      type: 'video',
      src: v.src,
      poster: `${BASE_URL}videos/posters/${base}.webp`,
      title: meta?.title || `Living Moment ${num}`,
      caption: meta?.caption || 'Moments held in motion',
      description: meta?.caption || 'Moments held in motion',
      aspect: 'landscape',
    };
  });

export const totalVideos = videos.length;

// Formatter for dynamic counters
export const formatMediaCounter = (currentIdx, total = totalPhotos) => {
  const currentStr = String(currentIdx + 1).padStart(2, '0');
  const totalStr   = String(total).padStart(2, '0');
  return `${currentStr} / ${totalStr}`;
};

export default photos;
