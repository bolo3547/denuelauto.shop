const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'app');

function findRouteFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const item of items) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) results = results.concat(findRouteFiles(p));
    else if (/route\.(ts|js|tsx|jsx)$/.test(item.name)) results.push(p);
  }
  return results;
}

const replacements = [
  { re: /export\s+async\s*\r?\n\s*function/g, rep: 'export async function' },
  { re: /for xref/g, rep: '' },
  { re: /Catalogobjs/g, rep: 'Catalog\nobjs' },
  { re: /Pagesobjs/g, rep: 'Pages\nobjs' },
  { re: /Fontobjs/g, rep: 'Font\nobjs' },
  { re: /([a-zA-Z0-9_])objs\.push/g, rep: '$1\nobjs.push' },
  { re: /\)\s*;\s*try\s*\{/g, rep: ');\n  try {' },
  { re: /\n\s*\n\s*\n/g, rep: '\n\n' } // normalize triple blank lines
];

const files = findRouteFiles(root);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const r of replacements) text = text.replace(r.re, r.rep);
  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Applied final fixes in', file);
    changed++;
  }
}
console.log('Done, applied final fixes in', changed, 'files');
