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
const dynamicFiles = files.filter(f => f.includes('[') && (f.endsWith('page.tsx') || f.endsWith('page.jsx')));

let removed = 0;
for (const f of dynamicFiles) {
  let text = fs.readFileSync(f, 'utf8');
  const isClient = /^(?:\s*\/\/.*\n)*\s*("use client"|'use client')/m.test(text);
  if (!isClient) continue;
  // find generateStaticParams block
  const idx = text.indexOf('export function generateStaticParams');
  if (idx >= 0) {
    // remove from idx to first closing brace after idx
    let end = text.indexOf('\n', idx);
    // find matching brace
    let braceIdx = text.indexOf('{', idx);
    if (braceIdx >= 0) {
      let depth = 0;
      let pos = braceIdx;
      while (pos < text.length) {
        if (text[pos] === '{') depth++;
        else if (text[pos] === '}') { depth--; if (depth === 0) { pos++; break; } }
        pos++;
      }
      const removedText = text.slice(idx, pos);
      text = text.slice(0, idx) + text.slice(pos);
      fs.writeFileSync(f, text, 'utf8');
      console.log('Removed generateStaticParams from client page', f);
      removed++;
    }
  }
}
console.log('Total removed from client pages:', removed);
