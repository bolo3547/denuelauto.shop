const fs = require('fs');
const path = require('path');

function isLikelyStray(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Already a comment or code-like
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) return false;
  if (/^[A-Z]/.test(trimmed)) return false; // Likely sentence starting with capital (but many stray lines start lowercase)
  // Exclude lines that look like code
  if (/[=;{}()\[\]<>]/.test(trimmed)) return false;
  if (/^import |^export |^const |^let |^var |^function |^return |^class |^interface /.test(trimmed)) return false;
  // Exclude lines containing quotes or backticks (likely inside strings)
  if (/['"`]/.test(trimmed)) return false;
  // Only consider short lines (allow a bit longer for descriptive fragments)
  if (trimmed.length > 240) return false;
  // Accept a wider set of short descriptive stray lines
  // additional heuristic: accept lines starting with 'for ', 'if ', or 'try '
  if (!/^(for |if |try )/.test(trimmed) && trimmed.length > 0 && !/^[a-z0-9]/i.test(trimmed)) return false;
  return true;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let inBacktick = false;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // track backtick blocks
    const backticks = (line.match(/`/g) || []).length;
    if (backticks % 2 === 1) {
      inBacktick = !inBacktick;
    }
    if (inBacktick) continue;
    if (isLikelyStray(line)) {
      lines[i] = lines[i].replace(/^\s*/, '$&// ');
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Patched', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/route\.ts$/.test(p)) processFile(p);
  }
}

const target = process.argv[2] || 'frontend/app/api';
walk(target);
console.log('Done');
