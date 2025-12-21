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
  const guard = "if (IS_STATIC_EXPORT) return NextResponse.json({ ok: false }, { status: 200 });";
  let changed = false;

  // Find all occurrences of export async function
  const funcRegex = /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(/g;
  let m;
  while ((m = funcRegex.exec(text)) !== null) {
    const start = m.index;
    // Find position of closing paren for this function's params
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
    // find next '{' after this position
    const bodyOpen = text.indexOf('{', i);
    if (bodyOpen === -1) continue;

    // Now check if guard exists between start and bodyOpen (misplaced) or after bodyOpen (correct)
    const before = text.slice(start, bodyOpen);
    const afterBody = text.slice(bodyOpen, bodyOpen + 200);
    if (before.includes(guard)) {
      // remove misplaced guard from before
      text = text.replace(guard, '');
      // insert guard after bodyOpen (i.e., after '{') if not present
      if (!afterBody.includes(guard)) {
        const insertPos = bodyOpen + 1;
        text = text.slice(0, insertPos) + '\n  ' + guard + text.slice(insertPos);
      }
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, text, 'utf8');
    fixed++;
    console.log('Fixed guards in', file);
  }
}

console.log('Done, fixed', fixed, 'files');
