const fs = require('fs');
const path = require('path');

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

let moved = 0;
for (const f of dynamicFiles) {
  let text = fs.readFileSync(f, 'utf8');
  if (!text.includes('export function generateStaticParams')) continue;
  const lines = text.split(/\r?\n/);
  // find index of use client and generateStaticParams
  const useClientIdx = lines.findIndex(l => /^("use client"|'use client')\s*;?\s*$/.test(l.trim()));
  const genIdx = lines.findIndex(l => /export\s+function\s+generateStaticParams\s*\(/.test(l));
  if (useClientIdx >= 0 && genIdx >= 0 && genIdx < useClientIdx) {
    // extract the function block lines from genIdx to the end of the function
    let endIdx = genIdx;
    for (let i = genIdx; i < lines.length; i++) {
      if (lines[i].includes('}')) {
        // could be nested; for simplicity find first line with a closing brace followed by nothing
        endIdx = i;
        break;
      }
    }
    const funcLines = lines.splice(genIdx, endIdx - genIdx + 1);
    // insert after useClientIdx
    lines.splice(useClientIdx + 1, 0, ...funcLines, '');
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('Moved generateStaticParams in', f);
    moved++;
  }
}
console.log('Total moved:', moved);
