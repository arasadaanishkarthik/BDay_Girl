import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.resolve('src/assets/photos');
const thumbDir = path.resolve('public/images/thumbnails');
const medDir = path.resolve('public/images/medium');
const largeDir = path.resolve('public/images/large');
const blurDir = path.resolve('public/images/blur');
const posterDir = path.resolve('public/videos/posters');

async function processImages() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} images to optimize...`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name; // e.g. photo01

    // 1. Thumbnail (500px width, max 650px height)
    await sharp(inputPath)
      .resize({ width: 500, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(path.join(thumbDir, `${baseName}.webp`));

    // 2. Medium (1100px width)
    await sharp(inputPath)
      .resize({ width: 1100, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(path.join(medDir, `${baseName}.webp`));

    // 3. Large (1800px width)
    await sharp(inputPath)
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(path.join(largeDir, `${baseName}.webp`));

    // 4. Tiny blur placeholder (24px width, for blur-up progressive loading)
    await sharp(inputPath)
      .resize({ width: 24 })
      .blur(2)
      .webp({ quality: 30 })
      .toFile(path.join(blurDir, `${baseName}.webp`));

    process.stdout.write(`✓ Optimized ${baseName}\n`);
  }

  // Generate Posters for Videos 1 to 6 using best corresponding portraits
  const videoPosterMapping = [
    { video: 'video01', photo: 'photo03' },
    { video: 'video02', photo: 'photo06' },
    { video: 'video03', photo: 'photo08' },
    { video: 'video04', photo: 'photo14' },
    { video: 'video05', photo: 'photo17' },
    { video: 'video06', photo: 'photo20' }
  ];

  for (const item of videoPosterMapping) {
    const photoPath = path.join(inputDir, `${item.photo}.jpg`);
    if (fs.existsSync(photoPath)) {
      await sharp(photoPath)
        .resize({ width: 900, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(posterDir, `${item.video}.webp`));
      console.log(`✓ Created poster for ${item.video}`);
    }
  }

  console.log('All image and video assets optimized successfully!');
}

processImages().catch(err => {
  console.error('Optimization error:', err);
  process.exit(1);
});
