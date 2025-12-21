const fs = require('fs');
const path = require('path');
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
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;

  // Specific fixes
  text = text.replace(/headersconst/g, 'headers\nconst');
  text = text.replace(/configfunction/g, 'config\nfunction');
  text = text.replace(/servicesconst/g, 'services\nconst');
  text = text.replace(/datereservations/g, 'date\nreservations');
  text = text.replace(/\bwi\s*\r?\n\s*th\b/g, 'with');
  text = text.replace(/\bdate\s*\r?\n\s*reservations\b/g, 'date\nreservations');

  // Generic: insert newline before keywords if concatenated
  text = text.replace(/([a-z0-9_\)\}])\s*(?=(const|function|if|return|try|for|switch|let|var|else)\b)/g, '$1\n');

  // Ensure ');try {' becomes ');\n  try {'
  text = text.replace(/\)\s*;\s*try\s*\{/g, ');\n  try {');

  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Fixed merged keywords in', file);
    changed++;
  }
}
console.log('Done, fixed merged keywords in', changed, 'files');
