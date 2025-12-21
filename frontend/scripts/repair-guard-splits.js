const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'app');
const guard = 'if (IS_STATIC_EXPORT) return NextResponse.json({ ok: false }, { status: 200 });';

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

function shouldMerge(prevLine, nextLine) {
  // If previous line ends with punctuation that likely terminates statement, don't merge.
  const terminators = /[;{}]$/;
  if (terminators.test(prevLine.trim())) return false;
  // If next line starts with comment or closing bracket, don't merge
  if (/^\s*[)\]}]/.test(nextLine)) return false;
  // If prev ends with an alphabetic/digit/quote and next starts with alphabetic/digit/quote, it's likely a split
  if (/[A-Za-z0-9"'`]$/.test(prevLine.trim()) && /^[A-Za-z0-9"'`]/.test(nextLine.trim())) return true;
  return false;
}

const files = findRouteFiles(root);
let changed = 0;
for (const file of files) {
  let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let made = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === guard) {
      const prevIdx = i - 1;
      const nextIdx = i + 1;
      if (prevIdx >= 0 && nextIdx < lines.length) {
        const prev = lines[prevIdx];
        const next = lines[nextIdx];
        if (shouldMerge(prev, next)) {
          // merge prev + next into one line
          const merged = prev.replace(/\s*$/, '') + ' ' + next.replace(/^\s*/, '');
          lines.splice(prevIdx, 3, merged);
          i = prevIdx; // continue after merged
          made = true;
        } else {
          // Guard appears between lines but not splitting tokens; just remove guard line
          lines.splice(i, 1);
          i--;
          made = true;
        }
      } else {
        // trailing or leading guard; remove it
        lines.splice(i, 1);
        i--;
        made = true;
      }
    }
  }
  if (made) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    changed++;
    console.log('Repaired splits in', file);
  }
}
console.log('Done, repaired splits in', changed, 'files');
