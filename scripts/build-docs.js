import fs from 'fs';
import path from 'path';

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

console.log('Copying production build from dist to docs for GitHub Pages...');
copyDirSync(distDir, docsDir);

// Ensure .nojekyll exists in docs
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

console.log('Successfully prepared docs/ directory for GitHub Pages deployment.');
