const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir).flatMap(name => {
    const p = path.join(dir, name);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function commentTopReturn(file) {
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return false;
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    if (/^\s*return\s*\[\s*\{/.test(lines[i])) {
      lines[i] = lines[i].replace(/^\s*/, '$&// ');
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      return true;
    }
  }
  return false;
}

function main() {
  const root = process.argv[2];
  if (!root) {
    console.error('Usage: node comment_top_level_returns.js <dir>');
    process.exit(2);
  }
  const files = walk(root);
  let patched = 0;
  for (const f of files) {
    if (commentTopReturn(f)) {
      console.log('Patched', f);
      patched++;
    }
  }
  console.log('Done, patched', patched, 'files');
}

if (require.main === module) main();
