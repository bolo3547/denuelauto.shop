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
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  let orig = text;

  // Several common concatenation issues
  // 1) '});try {' -> '});\n  try {'
  text = text.replace(/\}\);\s*try\s*\{/g, '});\n  try {');

  // 2) '});try {' for regex with different spacing
  text = text.replace(/\)\s*;\s*try\s*\{/g, ');\n  try {');

  // 3) words concatenated with 'for (const' e.g. 'actionfor (const' -> 'action\n    for (const'
  text = text.replace(/([a-zA-Z0-9_\-])for \(/g, '$1\n    for (');

  // 4) 'typelet' -> 'type\n    let result: any = null;'
  text = text.replace(/typelet\s+result:/g, "type\n    let result: any = null;");

  // 5) 'handlersasync function' -> 'handlers\n\nasync function'
  text = text.replace(/handlersasync function/g, 'handlers\n\nasync function');

  // 6) insert newline before 'if (' when it's directly concatenated to previous token
  text = text.replace(/([\w\)\]\}])\s*if \(/g, '$1\n  if (');

  // 7) fix return/json+try cases where newline missing
  text = text.replace(/\}\)\s*;\s*try\s*\{/g, '});\n  try {');

  // 8) fix places where 'return NextResponse.json({ ok: false }, { status: 200 });try {'
  text = text.replace(/return\s+NextResponse\.json\([^;]+\);\s*try\s*\{/g, match => match.replace(/\);\s*try\s*\{/, ');\n  try {'));

  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    changed++;
    console.log('Fixed concats in', file);
  }
}
console.log('Done, fixed', changed, 'files');
