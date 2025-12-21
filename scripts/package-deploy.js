#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function exists(p) {
  try { return fs.existsSync(p); } catch (e) { return false; }
}

async function main() {
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  const outArgIndex = args.findIndex(a => a === '--out' || a === '-o');
  const outFile = outArgIndex >= 0 && args[outArgIndex + 1] ? args[outArgIndex + 1] : 'deploy.zip';
  const outputPath = path.resolve(cwd, outFile);

  const frontendOnly = args.includes('--frontend-only') || args.includes('--frontend') || args.some(a => a.startsWith('--only') && a.includes('frontend'));

  const include = [];

  if (frontendOnly) {
    // Only package frontend export artifacts for static hosts like Imbra
    if (exists(path.join(cwd, 'frontend', 'out'))) {
      // Place frontend/out contents at ZIP root for static hosts like Imbra
      include.push({ src: path.join('frontend', 'out'), dest: '' });
    } else if (exists(path.join(cwd, 'frontend', '.next'))) {
      include.push({ src: path.join('frontend', '.next'), dest: path.join('frontend_.next') });
      // also include static/public assets
      if (exists(path.join(cwd, 'frontend', 'public'))) include.push({ src: path.join('frontend', 'public'), dest: path.join('frontend_public') });
    }

    if (include.length === 0) {
      console.error('No frontend build artifacts found (expected `frontend/out` from `next export` or `frontend/.next`).');
      process.exit(2);
    }

  } else {
    // Default: package backend + frontend artifacts if present
    // Backend dist
    if (exists(path.join(cwd, 'dist'))) include.push({ src: 'dist', dest: 'dist' });
    // Prisma schema + migrations
    if (exists(path.join(cwd, 'prisma'))) include.push({ src: 'prisma', dest: 'prisma' });
    // Node production (optional - recommended to install production deps on target)
    if (exists(path.join(cwd, 'node_modules'))) include.push({ src: 'node_modules', dest: 'node_modules' });
    // package.json + lock
    if (exists(path.join(cwd, 'package.json'))) include.push({ src: 'package.json', dest: 'package.json' });
    if (exists(path.join(cwd, 'package-lock.json'))) include.push({ src: 'package-lock.json', dest: 'package-lock.json' });

    // Frontend static export (if present)
    if (exists(path.join(cwd, 'frontend', 'out'))) include.push({ src: path.join('frontend', 'out'), dest: path.join('frontend_out') });
    // If next build artifacts exist, optionally include .next (if server-side deploys require it)
    if (exists(path.join(cwd, 'frontend', '.next'))) include.push({ src: path.join('frontend', '.next'), dest: path.join('frontend_.next') });
  }

  const outStream = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  outStream.on('close', () => {
    console.log(`Created ${outputPath} (${archive.pointer()} total bytes)`);
  });
  archive.on('warning', err => {
    if (err.code === 'ENOENT') console.warn('Archiver warning:', err.message);
    else throw err;
  });
  archive.on('error', err => { throw err; });

  archive.pipe(outStream);

  // Add each path
  for (const item of include) {
    const srcPath = path.resolve(cwd, item.src);
    const destPath = item.dest;
    const stats = fs.statSync(srcPath);
    if (stats.isDirectory()) {
      if (destPath === '' || destPath === false || destPath === null) {
        // Put directory contents at the root of the zip
        archive.directory(srcPath, false);
        console.log(`Adding directory (rooted): ${srcPath} -> /`);
      } else {
        archive.directory(srcPath, destPath);
        console.log(`Adding directory: ${srcPath} -> ${destPath}`);
      }
    } else if (stats.isFile()) {
      const name = destPath === '' ? path.basename(srcPath) : destPath;
      archive.file(srcPath, { name });
      console.log(`Adding file: ${srcPath} -> ${name}`);
    }
  }

  await archive.finalize();
}

main().catch(err => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
