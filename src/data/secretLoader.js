/**
 * Private / Secret Media Discovery System
 * Exclusively loads media from src/assets/p/
 *
 * Rules:
 * - Public website NEVER includes anything from p/
 * - Secret Room includes ONLY media from p/
 * - Exactly 3 private photos + 1 private video
 */

const normalizePath = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/').toLowerCase();
};

const getBaseName = (filePath) => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

// ─── DISCOVER ALL PRIVATE MEDIA FROM src/assets/p/ ──────────────────────────
const rawPrivateMedia = import.meta.glob(
  [
    '/src/assets/p/*.{jpg,jpeg,png,webp,avif,mp4,webm,mov}',
    '/src/assets/p/**/*.{jpg,jpeg,png,webp,avif,mp4,webm,mov}',
  ],
  { eager: true, query: '?url', import: 'default' }
);

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const videoExtensions = ['.mp4', '.webm', '.mov'];

const isImage = (path) => imageExtensions.some((ext) => path.toLowerCase().endsWith(ext));
const isVideo = (path) => videoExtensions.some((ext) => path.toLowerCase().endsWith(ext));

const uniquePrivatePhotosMap = new Map();
const uniquePrivateVideosMap = new Map();

Object.entries(rawPrivateMedia).forEach(([path, url]) => {
  const norm = normalizePath(path);
  if (isImage(norm)) {
    if (!uniquePrivatePhotosMap.has(norm)) {
      uniquePrivatePhotosMap.set(norm, { path, url });
    }
  } else if (isVideo(norm)) {
    if (!uniquePrivateVideosMap.has(norm)) {
      uniquePrivateVideosMap.set(norm, { path, url });
    }
  }
});

// Editorial captions for the 3 private photos
const privatePhotoCaptions = {
  'bright cafe selfie with green chairs': {
    title: 'Café Reverie',
    caption: 'Warm coffee, gentle smiles, and quiet corners.',
  },
  'close-up selfie by a luminous shop': {
    title: 'Luminous Evening',
    caption: 'City lights and a soft, quiet smile.',
  },
  'selfie duo in traditional attire': {
    title: 'Traditional Elegance',
    caption: 'Woven in celebration and cherished joy.',
  },
};

export const privatePhotos = Array.from(uniquePrivatePhotosMap.values())
  .sort((a, b) => a.path.localeCompare(b.path))
  .map(({ path, url }, index) => {
    const base = getBaseName(path);
    const key = base.toLowerCase();
    const meta = privatePhotoCaptions[key] || {
      title: base,
      caption: 'Moments kept a little closer to the heart.',
    };
    const num = index + 1;

    return {
      id: `secret-photo-${num}`,
      index: num,
      type: 'image',
      src: url,
      title: meta.title,
      caption: meta.caption,
      aspect: 'portrait',
    };
  });

export const totalPrivatePhotos = privatePhotos.length;

// Editorial caption for the 1 private video
export const privateVideos = Array.from(uniquePrivateVideosMap.values())
  .sort((a, b) => a.path.localeCompare(b.path))
  .map(({ path, url }, index) => {
    const num = index + 1;
    return {
      id: `secret-vid-${num}`,
      index: num,
      type: 'video',
      src: url,
      title: 'Cherished Motion',
      caption: 'Unscripted seconds caught in time, preserved forever.',
      aspect: 'portrait',
    };
  });

export const totalPrivateVideos = privateVideos.length;

// Counters
export const formatPrivatePhotoCounter = (currentIdx, total = totalPrivatePhotos) => {
  const currentStr = String(currentIdx + 1).padStart(2, '0');
  const totalStr   = String(total).padStart(2, '0');
  return `${currentStr} / ${totalStr}`;
};

export const formatPrivateVideoCounter = (currentIdx, total = totalPrivateVideos) => {
  const currentStr = String(currentIdx + 1).padStart(2, '0');
  const totalStr   = String(total).padStart(2, '0');
  return `${currentStr} / ${totalStr}`;
};
