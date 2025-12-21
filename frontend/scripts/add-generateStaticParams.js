const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'app');

function findDynamicDirs(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const item of items) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (/\[.*\]/.test(item.name)) results.push(p);
      results.push(...findDynamicDirs(p));
    }
  }
  return results;
}

const dynamicDirs = findDynamicDirs(root);
console.log('Found dynamic dirs:', dynamicDirs.length);

dynamicDirs.forEach(dir => {
  ['route.ts', 'page.tsx', 'page.jsx', 'route.js'].forEach(file => {
    const full = path.join(dir, file);
    if (fs.existsSync(full)) {
      let text = fs.readFileSync(full, 'utf8');
      if (!/export\s+function\s+generateStaticParams\s*\(/.test(text)) {
        const insert = "export function generateStaticParams() { return []; }\n\n";
        text = insert + text; // prepend for simplicity
        fs.writeFileSync(full, text, 'utf8');
        console.log('Patched', full);
      }
    }
  });
});

console.log('Done');
