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
let patched = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (!/IS_STATIC_EXPORT/.test(text)) {
    // insert const at top after any existing generateStaticParams line if present
    const insertConst = "const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;\n\n";
    if (/export\s+function\s+generateStaticParams/.test(text)) {
      text = text.replace(/(export\s+function\s+generateStaticParams[\s\S]*?\}\s*\n)/, `$1${insertConst}`);
    } else {
      text = insertConst + text;
    }
  }

  // Add guard at start of each exported handler if missing
  const handlerRegex = /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\([^)]*\)\s*\{/gm;
  let m;
  let newText = text;
  while ((m = handlerRegex.exec(text)) !== null) {
    const matchIndex = m.index;
    const matchStr = m[0];
    const bracePos = matchIndex + matchStr.length; // position right after the opening '{' of the function body
    const before = text.slice(0, bracePos);
    const after = text.slice(bracePos);
    const guard = "\n  if (IS_STATIC_EXPORT) return NextResponse.json({ ok: false }, { status: 200 });\n";
    if (!/IS_STATIC_EXPORT/.test(text.slice(bracePos, bracePos + 200))) {
      newText = before + guard + after;
      text = newText; // update for subsequent matches
    }
  }

  if (newText !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, newText, 'utf8');
    patched++;
    console.log('Patched guards in', file);
  }
}

console.log('Done, patched', patched, 'route files');
