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
const rootAssetsDir = path.resolve('assets');

console.log('Copying production build from dist to docs and root assets for GitHub Pages...');
copyDirSync(distDir, docsDir);

// Also copy dist/assets to root assets/ so root index.html can serve statically on GitHub Pages
if (fs.existsSync(path.join(distDir, 'assets'))) {
  copyDirSync(path.join(distDir, 'assets'), rootAssetsDir);
}

// Create predictable index.js and index.css aliases in both docs/assets and assets/
const distAssets = fs.existsSync(path.join(distDir, 'assets')) ? fs.readdirSync(path.join(distDir, 'assets')) : [];
const mainJs = distAssets.find(f => f.startsWith('index-') && f.endsWith('.js'));
const mainCss = distAssets.find(f => f.startsWith('index-') && f.endsWith('.css'));

if (mainJs) {
  if (fs.existsSync(rootAssetsDir)) fs.copyFileSync(path.join(distDir, 'assets', mainJs), path.join(rootAssetsDir, 'index.js'));
  if (fs.existsSync(path.join(docsDir, 'assets'))) fs.copyFileSync(path.join(distDir, 'assets', mainJs), path.join(docsDir, 'assets', 'index.js'));
}

if (mainCss) {
  if (fs.existsSync(rootAssetsDir)) fs.copyFileSync(path.join(distDir, 'assets', mainCss), path.join(rootAssetsDir, 'index.css'));
  if (fs.existsSync(path.join(docsDir, 'assets'))) fs.copyFileSync(path.join(distDir, 'assets', mainCss), path.join(docsDir, 'assets', 'index.css'));
}

// Ensure .nojekyll exists in docs and root
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
fs.writeFileSync(path.resolve('.nojekyll'), '');

console.log('Successfully prepared docs/ and root assets for GitHub Pages deployment.');
