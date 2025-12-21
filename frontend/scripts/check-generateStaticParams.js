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
console.log('Dynamic files found:', dynamicFiles.length);

for (const f of dynamicFiles) {
  const text = fs.readFileSync(f, 'utf8');
  const has = /export\s+function\s+generateStaticParams\s*\(/.test(text);
  if (!has) console.log('Missing=', f);
}
