const fs = require('node:fs');
const path = require('node:path');

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
let fixed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  // pattern: const authResult\n  if (IS_STATIC_EXPORT)...\n = await verify...;
  const pattern = /(\n\s*(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*)(\s*\n\s*if \(IS_STATIC_EXPORT\) return [^;]*;\s*)(\n\s*=\s*await[^;]+;)/g;
  if (pattern.test(text)) {
    text = text.replace(pattern, (m, decl, guard, assign) => {
      // Move guard after declaration and merge declaration + assignment
      const combined = decl + ' ' + assign.trim() + '\n' + guard.trim() + '\n';
      return combined;
    });
    fs.writeFileSync(file, text, 'utf8');
    fixed++;
    console.log('Repaired', file);
  }
}

console.log('Done, repaired', fixed, 'files');
