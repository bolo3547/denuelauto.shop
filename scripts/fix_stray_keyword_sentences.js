const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir).flatMap(name => {
    const p = path.join(dir, name);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function fixFile(file) {
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return false;
  let src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    // comment plain-English sentences that start with JS keyword
    if (/^\s*(return|for|if|while|switch|try|catch|else)\s+[a-z][a-z0-9 ,'"-]*$/i.test(line)) {
      lines[i] = line.replace(/^(\s*)/, '$1// ');
      changed = true;
      continue;
    }
    // split 'developmentconsole.log' style merges into comment + console.log
    if (/[a-z]console\./i.test(line)) {
      lines[i] = line.replace(/([a-z]+)(console\.)/gi, (m,p1,p2) => `// ${p1}\n${p2}`);
      changed = true;
      continue;
    }
    // comment stray 'case' lines outside switches
    if (/^\s*case\s+['"].*/.test(line)) {
      lines[i] = line.replace(/^(\s*)/, '$1// ');
      changed = true;
      continue;
    }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

function main() {
  const root = process.argv[2];
  if (!root) { console.error('Usage: node fix_stray_keyword_sentences.js <dir>'); process.exit(2); }
  const files = walk(root);
  let patched = 0;
  for (const f of files) if (fixFile(f)) { console.log('Patched', f); patched++; }
  console.log('Done, patched', patched, 'files');
}

if (require.main === module) main();
