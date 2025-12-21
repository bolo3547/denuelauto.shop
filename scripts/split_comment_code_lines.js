const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function splitLines(src) {
  const lines = src.split(/\r?\n/);
  const out = [];
  const re = /^(\s*)([a-z].*?)\s+(\b(return|const|let|if|for|while|switch|throw|try|catch)\b)(.*)$/i;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      const indent = m[1] || '';
      const sentence = m[2].trim();
      const code = (m[3] + m[5]).trim();
      out.push(`${indent}// ${sentence}`);
      out.push(`${indent}${code}`);
    } else out.push(line);
  }
  return out.join('\n');
}

function repairFile(file) {
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return false;
  const src = fs.readFileSync(file, 'utf8');
  const out = splitLines(src);
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const root = process.argv[2];
  if (!root) { console.error('Usage: node split_comment_code_lines.js <dir>'); process.exit(2); }
  const files = walk(root);
  let patched = 0;
  for (const f of files) {
    if (repairFile(f)) { console.log('Patched', f); patched++; }
  }
  console.log('Done, patched', patched, 'files');
}

if (require.main === module) main();
