const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const toCopy = [
  'index.html',
  'main.js',
  'style.css',
  'config.json',
  'logo.json',
  'vibe-coder-final.png',
  'targets',
  'img',
  'ar-engine',
  'external'
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

toCopy.forEach((item) => {
  const srcPath = path.join(__dirname, '..', item);
  const destPath = path.join(publicDir, item);
  
  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${item} to public/`);
    copyRecursiveSync(srcPath, destPath);
  } else {
    console.warn(`Warning: ${item} not found.`);
  }
});

console.log('Build completed successfully.');
