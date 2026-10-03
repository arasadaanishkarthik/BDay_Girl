# Aditi — A Collection of Little Moments
### Ultra-Premium, High-Performance Animated Photography & Motion Exhibition

An animation-first, production-optimized digital exhibition featuring **35 personal photographs** and **living video moments**, built with the strict priority:
**PERFORMANCE → SMOOTHNESS → VISUAL QUALITY → ANIMATIONS**

---

## ✦ Live Server

The site is running live:
* **Local Development URL**: [http://localhost:3000/](http://localhost:3000/)
* **Production Build**: Verified with `npm run build` (built in 14s, split chunks, 0 errors)

---

## ✦ Key Performance Optimizations Implemented

### 1. Progressive Image Loading & Responsive WebP Architecture (Sections 2, 3, 4, 5)
- All 35 photos processed into 4 targeted WebP tiers:
  - **Thumbnails**: `public/images/thumbnails/photoXX.webp` (400–600px, ~40–90KB)
  - **Medium**: `public/images/medium/photoXX.webp` (1000–1200px, ~120–250KB)
  - **Large**: `public/images/large/photoXX.webp` (1800px, for high-res fullscreen lightbox)
  - **Blur**: `public/images/blur/photoXX.webp` (24px, ~1KB for progressive blur-up reveals)
- Responsive `<picture>` tags with media queries:
  - Mobile devices only load small thumbnails.
  - Tablets/laptops load medium images.
  - Large desktops load high-res images on demand in the lightbox.
- `PhotoCard.jsx` progressive blur-up: tiny blurred placeholder displays instantly, high-res WebP fades in cleanly (`blur → sharp`).

### 2. Intelligent Video Architecture (Sections 6, 7, 8, 9, 10, 11, 13)
- **Zero Heavy Video Autoplay**: videos are never loaded or played offscreen.
- **WebP Posters First**: Every video uses a corresponding WebP poster (`public/videos/posters/videoXX.webp`).
- **IntersectionObserver Autoplay**:
  - When a video scrolls into view: starts muted, looping playback (`playsInline`).
  - When it leaves the viewport: automatically paused and memory is reclaimed.
- **Hover Experience**:
  - Slight scale transition, glowing play icon appears, custom cursor shifts to **`PLAY ▶`**.
- **Dedicated Video Fullscreen Lightbox (`VideoLightbox.jsx`)**:
  - Opens fullscreen player with play/pause, volume/mute, fullscreen toggle, counter (`03 / 06`), previous/next navigation, and `Esc` key support.
  - Complete memory release and stream cleanup on close.

### 3. Interwoven Photo + Video Story & Timeline (Sections 12, 28, 29)
- **"Moments in Motion" (`Motion.jsx`)**:
  - Large cinematic featured widescreen video on top.
  - Complementary editorial video pair.
  - Video grid with lazy intersection autoplay.
- **"The Living Timeline" (`Timeline.jsx`)**:
  - Alternating chronology interleaving photos and living video clips (`01 — ARCHIVE`, `02 — PORTRAIT`, `03 — MOTION`, etc.).
  - Central glowing progress line advancing dynamically as the user scrolls.

### 4. GPU-Accelerated Animations & Scroll Performance (Sections 14, 15, 16, 17, 21)
- **Transforms & Opacity Only**: All animations exclusively use hardware-accelerated `translate3d()`, `scale()`, and `opacity`.
- **Dynamic `will-change` Management**: `will-change: transform` is applied only during active scroll interactions and removed immediately afterward.
- **Throttled Memory Counter (`ScrollProgress.jsx`)**:
  - Shows real-time memory progress (`MEM 07 / 30`) and scroll percentage without frame thrashing.
- **Single Lenis Smooth Scroll System**:
  - Bound directly to `gsap.ticker` with zero duplicate scroll listeners.
- **Mobile & Reduced Motion Mode**:
  - Automatically respects `prefers-reduced-motion: reduce`.
  - Disables custom cursor on touchscreen devices (`pointer: coarse`).

### 5. Code Splitting (Section 34)
- Heavy components (`PhotoLightbox`, `VideoLightbox`, `DraggablePhotoWall`) are split into independent chunks via `React.lazy()` and `Suspense`, ensuring the initial page bundle is minimal and loads instantly.

---

## ✦ Project Architecture

```
g:/Gallery/Birthday/
├── public/
│   ├── images/
│   │   ├── thumbnails/  # 400-600px WebP images
│   │   ├── medium/      # 1000-1200px WebP images
│   │   ├── large/       # 1800px high-res WebP images
│   │   └── blur/        # 24px tiny blur placeholders
│   └── videos/
│       ├── video01.mp4 ... video06.mp4
│       └── posters/     # WebP poster frames for every video
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Floating navigation & fullscreen clip-path menu
│   │   ├── CustomCursor.jsx        # translate3d interpolated cursor (VIEW, PLAY, DRAG)
│   │   ├── LoadingScreen.jsx       # 30 -> 01 countdown reveal
│   │   ├── PhotoCard.jsx           # Progressive blur-up & responsive <picture>
│   │   ├── PhotoGallery.jsx        # Modular photo grid
│   │   ├── PhotoLightbox.jsx       # High-res viewer with prev/next preloading
│   │   ├── VideoCard.jsx           # IntersectionObserver autoplay & poster fallback
│   │   ├── VideoGallery.jsx        # Modular video grid
│   │   ├── VideoLightbox.jsx       # Dedicated video player modal
│   │   ├── HorizontalGallery.jsx   # Editorial runway strip with will-change cleanup
│   │   └── ScrollProgress.jsx      # Throttled memory counter & progress pill
│   │
│   ├── sections/
│   │   ├── Hero.jsx                # Lightweight WebP blur-up hero
│   │   ├── Introduction.jsx        # Title sequence & expanding photo morph
│   │   ├── Memories.jsx            # 3D floating cards gated by IntersectionObserver
│   │   ├── Motion.jsx              # "Moments in Motion" cinematic video gallery
│   │   ├── Timeline.jsx            # Interleaved photo + video story with progress line
│   │   └── FinalSection.jsx        # Fullscreen zoom & dark epilogue
│   │
│   ├── data/
│   │   ├── config.js               # Name, subtitle, and dedication settings
│   │   ├── photos.js               # 35 structured photo items with WebP paths
│   │   └── videos.js               # Structured video catalog with posters
│   │
│   └── scripts/
│       └── optimize-media.js       # Sharp automation script for WebP and posters
```

---

## ✦ Adding & Replacing Media

### Adding / Replacing Photos:
1. Place raw photos into `src/assets/photos/` (or update [`src/data/photos.js`](file:///g:/Gallery/Birthday/src/data/photos.js)).
2. Run `node scripts/optimize-media.js` to automatically generate thumbnails, medium, large, and blur WebP files.

### Adding / Replacing Videos:
1. Place your MP4 videos into `public/videos/video01.mp4`, `video02.mp4`, etc.
2. Add an entry to [`src/data/videos.js`](file:///g:/Gallery/Birthday/src/data/videos.js):
```javascript
{
  id: 7,
  src: "/videos/video07.mp4",
  poster: "/videos/posters/video07.webp",
  title: "Your Title",
  caption: "Your Caption",
  year: "2024",
  aspect: "portrait"
}
```
