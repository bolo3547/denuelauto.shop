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

const files = findRouteFiles(root);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  // Replace 'export async' + any whitespace/newlines + 'function' with 'export async function'
  text = text.replace(/export\s+async\s*\r?\n\s*function/g, 'export async function');
  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Normalized export async in', file);
    changed++;
  }
}
console.log('Done, normalized export async in', changed, 'files');
