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

function joinSplitStrings(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    // handle single-quoted strings split across lines
    const singleOpen = (line.match(/'/g) || []).length % 2 === 1;
    const doubleOpen = (line.match(/"/g) || []).length % 2 === 1;
    // handle template literals (`)
    const backtickOpen = (line.match(/`/g) || []).length % 2 === 1;
    if (singleOpen || doubleOpen) {
      const quote = singleOpen ? "'" : '"';
      let j = i + 1;
      let combined = line;
      let closed = false;
      while (j < lines.length) {
        combined += ' ' + lines[j].trim();
        if (lines[j].includes(quote)) { closed = true; break; }
        j++;
      }
      if (closed) {
        out.push(combined);
        i = j + 1;
        continue;
      }
    }
    if (backtickOpen) {
      let j = i + 1;
      let combined = line;
      let closed = false;
      while (j < lines.length) {
        combined += ' ' + lines[j].trim();
        if (lines[j].includes('`')) { closed = true; break; }
        j++;
      }
      if (closed) {
        out.push(combined);
        i = j + 1;
        continue;
      }
    }
    out.push(line);
    i++;
  }
  return out;
}

function commentStraySentences(lines) {
  return lines.map(line => {
    const trimmed = line.trim();
    // already a comment or empty
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return line;
    // lines that look like plain English sentence fragments (no code tokens)
    const hasCodeToken = /[=;{}()<>:\-\\\[\]\/\*]|\b(return|const|let|var|function|class|async|await|if|for|while|switch|case|try|catch|throw|import|export)\b/.test(trimmed);
    const isSentenceish = /^[A-Za-z][A-Za-z0-9 ,()'".:-]*$/i.test(trimmed) && trimmed.split(' ').length >= 2;
    if (isSentenceish && !hasCodeToken) {
      return line.replace(/^(\s*)/, '$1// ');
    }
    // lines that are just 'try' or 'try.' etc.
    if (/^\s*try[\s.:,!?-]*$/i.test(line)) return line.replace(/^(\s*)/, '$1// ');
    return line;
  });
}

function commentTopLevelGenerateReturn(lines) {
  // If file has commented generateStaticParams header but an uncommented return line, comment that return
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const l = lines[i];
    if (/generateStaticParams/.test(l) && l.includes('function') && l.trim().startsWith('//')) {
      // scan next few lines for uncommented return [...]};
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (/^\s*return\s*\[\s*\{/.test(lines[j])) {
          lines[j] = lines[j].replace(/^\s*/, '$&// ');
        }
      }
      break;
    }
  }
  return lines;
}

function joinBrokenWordPairs(lines) {
  // join common broken words like teleme\ntry, coun\ntry, paid\nAt, Bea\nrer
  const text = lines.join('\n');
  const replacements = [
    [/teleme\s*\n\s*try/gi, 'telemetry'],
    [/coun\s*\n\s*try/gi, 'country'],
    [/paid\s*\n\s*At/gi, 'paidAt'],
    [/Bea\s*\n\s*rer/gi, 'Bearer'],
    [/docume\s*\n\s*ntNo/gi, 'documentNo'],
    [/teleme\s*\n\s*try/gi, 'telemetry']
  ];
  let out = text;
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  return out.split('\n');
}

function repairFile(file) {
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return false;
  let src = fs.readFileSync(file, 'utf8');
  const orig = src;
  let lines = src.split(/\r?\n/);
  lines = joinBrokenWordPairs(lines);
  lines = joinSplitStrings(lines);
  lines = commentStraySentences(lines);
  src = lines.join('\n');
  if (src !== orig) {
    fs.writeFileSync(file, src, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const root = process.argv[2];
  if (!root) {
    console.error('Usage: node repair_split_strings_and_comments.js <dir>');
    process.exit(2);
  }
  const files = walk(root);
  let patched = 0;
  for (const f of files) {
    if (repairFile(f)) {
      console.log('Patched', f);
      patched++;
    }
  }
  console.log('Done, patched', patched, 'files');
}

if (require.main === module) main();
