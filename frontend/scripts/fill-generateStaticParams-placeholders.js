const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'app');

function findFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const item of items) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) results = results.concat(findFiles(p));
    else results.push(p);
  }
  return results;
}

const files = findFiles(root).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));
let patched = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const target = /export\s+function\s+generateStaticParams\s*\(\)\s*\{\s*return\s*\[\s*\]\s*;\s*\}/m;
  if (target.test(text)) {
    // build params from path segments
    const rel = path.relative(root, file);
    const segs = rel.split(path.sep);
    const params = {};
    segs.forEach(s => {
      const m = s.match(/\[([^\]]+)\]/);
      if (m) params[m[1]] = 'placeholder';
    });
    const entries = Object.keys(params).map(k => `${k}: '${params[k]}'`).join(', ');
    const replacement = `export function generateStaticParams() { return [{ ${entries} }]; }`;
    text = text.replace(target, replacement);
    fs.writeFileSync(file, text, 'utf8');
    patched++;
    console.log('Patched', file);
  }
}

console.log('Done, patched', patched, 'files');
