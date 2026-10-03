import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Ensure index.html, 404.html, .nojekyll in dist
const devHtml = path.join(distDir, 'index.dev.html');
const distHtml = path.join(distDir, 'index.html');
const dist404 = path.join(distDir, '404.html');
const distNoJekyll = path.join(distDir, '.nojekyll');

if (fs.existsSync(devHtml)) {
  fs.copyFileSync(devHtml, distHtml);
  fs.copyFileSync(devHtml, dist404);
}
fs.writeFileSync(distNoJekyll, '');

// 2. Sync to docs directory
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
copyRecursiveSync(distDir, docsDir);
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

// 3. Sync critical files to root
if (fs.existsSync(distHtml)) {
  fs.copyFileSync(distHtml, path.join(rootDir, 'index.html'));
  fs.copyFileSync(distHtml, path.join(rootDir, '404.html'));
}
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');

const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
if (fs.existsSync(distAssets)) {
  copyRecursiveSync(distAssets, rootAssets);
}

const distImages = path.join(distDir, 'images');
const rootImages = path.join(rootDir, 'images');
if (fs.existsSync(distImages)) {
  copyRecursiveSync(distImages, rootImages);
}

const distVideos = path.join(distDir, 'videos');
const rootVideos = path.join(rootDir, 'videos');
if (fs.existsSync(distVideos)) {
  copyRecursiveSync(distVideos, rootVideos);
}

console.log('✓ Postbuild sync complete: dist, docs, and root are ready for GitHub Pages.');
