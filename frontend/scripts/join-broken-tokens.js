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

function shouldJoin(prevLine, nextLine) {
  const prevTrim = prevLine.replace(/\s+$/, '');
  const nextTrim = nextLine.replace(/^\s*/, '');
  if (!/[A-Za-z0-9'"`]$/.test(prevTrim)) return false;
  if (!/^[A-Za-z0-9'"`]/.test(nextTrim)) return false;
  if (/[;{}()]$/.test(prevTrim)) return false;
  // avoid merging when prev is an import/export or starts with keyword
  if (/^\s*(import|export)\b/.test(prevLine)) return false;
  // only join when next line includes a closing quote, comma, semicolon or closing parenthesis in its first 40 chars (likely continuation)
  if (!/['"`\),;]{1,}/.test(nextTrim.slice(0, 40))) return false;
  return true;
}

const files = findRouteFiles(root);
let changed = 0;
for (const file of files) {
  let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let made = false;
  for (let i = 0; i < lines.length - 1; i++) {
    const prev = lines[i];
    const next = lines[i + 1];
    if (shouldJoin(prev, next)) {
      lines.splice(i, 2, prev.replace(/\s*$/, '') + next.replace(/^\s*/, ''));
      made = true;
    }
  }
  if (made) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    changed++;
    console.log('Joined broken tokens in', file);
  }
}
console.log('Done, joined tokens in', changed, 'files');
