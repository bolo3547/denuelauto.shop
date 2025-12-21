const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'app');
const guard = "if (IS_STATIC_EXPORT) return NextResponse.json({ ok: false }, { status: 200 });";

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

function ensureGuardInFunction(text, bodyOpen, guard) {
  const after = text.slice(bodyOpen + 1, bodyOpen + 1 + 200);
  if (!after.includes(guard)) {
    const insertPos = bodyOpen + 1;
    text = text.slice(0, insertPos) + '\n  ' + guard + text.slice(insertPos);
  }
  return text;
}

const files = findRouteFiles(root);
let changedFiles = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  let orig = text;

  // Merge fragments split by guard, e.g., 'req' + '\n' + guard + '\n' + 'uest' -> 'request'
  const splitPattern = /([A-Za-z0-9_$]+)\s*\r?\n\s*if \(IS_STATIC_EXPORT\) return NextResponse\.json\(\{ ok: false \}, \{ status: 200 \}\);\s*([A-Za-z0-9_$.]+)/g;
  text = text.replace(splitPattern, (m, a, b) => a + b);

  // Remove any guard occurrences that are inline (not on their own line)
  // Replace occurrences where guard is inside a line with just nothing (we'll insert proper guards below)
  const inlinePattern = /([^\n])\s*if \(IS_STATIC_EXPORT\) return NextResponse\.json\(\{ ok: false \}, \{ status: 200 \}\);\s*([^\n])/g;
  if (inlinePattern.test(text)) {
    text = text.replace(inlinePattern, (m, a, b) => a + b);
  }

  // Now find exported async functions and ensure guard is inside body
  const funcRegex = /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(/g;
  let m;
  while ((m = funcRegex.exec(text)) !== null) {
    const start = m.index;
    // find position of closing paren
    let depth = 0;
    let i = text.indexOf('(', start);
    if (i === -1) continue;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    if (i >= text.length) continue;
    const bodyOpen = text.indexOf('{', i);
    if (bodyOpen === -1) continue;
    // Ensure guard exists in body
    text = ensureGuardInFunction(text, bodyOpen, guard);
  }

  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    changedFiles++;
    console.log('Normalized guards in', file);
  }
}
console.log('Done, normalized in', changedFiles, 'files');
