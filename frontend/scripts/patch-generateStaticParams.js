const fs = require('node:fs');
const path = require('node:path');

function findFiles(dir) {
  const files = [];
  for (const p of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, p.name);
    if (p.isDirectory()) files.push(...findFiles(full));
    else files.push(full);
  }
  return files;
}

const root = path.join(process.cwd(), 'app');
const files = findFiles(root);
const dynamicFiles = files.filter(f => f.includes('[') && (f.endsWith('route.ts') || f.endsWith('page.tsx') || f.endsWith('page.jsx') || f.endsWith('route.js')));

console.log('Patching', dynamicFiles.length, 'files');

for (const f of dynamicFiles) {
  const text = fs.readFileSync(f, 'utf8');
  if (!/export\s+function\s+generateStaticParams\s*\(/.test(text)) {
    const insert = "export function generateStaticParams() { return []; }\n\n";
    // Preserve 'use client' directive at top if present
    const lines = text.split(/\r?\n/);
    const firstNonEmpty = lines.findIndex(l => l.trim() !== '');
    if (firstNonEmpty >= 0 && /^("use client"|'use client')/.test(lines[firstNonEmpty].trim())) {
      lines.splice(firstNonEmpty + 1, 0, insert.trim());
      fs.writeFileSync(f, lines.join('\n'), 'utf8');
    } else {
      fs.writeFileSync(f, insert + text, 'utf8');
    }
    console.log('Patched', f);
  }
}

console.log('Done');
