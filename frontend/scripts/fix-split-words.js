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

const patterns = [
  { re: /'Bea\s*\r?\n\s*rer\s*'/g, rep: "'Bearer '" },
  { re: /docume\s*\r?\n\s*ntNo/g, rep: 'documentNo' },
  { re: /payme\s*\r?\n\s*ntProof/g, rep: 'paymentProof' },
  { re: /reque\s*\r?\n\s*st\.json/g, rep: 'request.json' },
  { re: /reque\s*\r?\n\s*st/g, rep: 'request' },
  { re: /transacti\s*\r?\n\s*onId/g, rep: 'transactionId' },
  { re: /searchPara\s*\r?\n\s*ms/g, rep: 'searchParams' },
  { re: /authenti\s*\r?\n\s*cation/g, rep: 'authentication' },
  { re: /payme\s*\r?\n\s*nt/g, rep: 'payment' },
  { re: /paymen\s*\r?\n\s*t/g, rep: 'payment' },
  { re: /user\s*\r?\n\s*Agent/g, rep: 'userAgent' },
  { re: /nt\s*\r?\n\s*No/g, rep: 'ntNo' }
];

const files = findRouteFiles(root);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const p of patterns) {
    text = text.replace(p.re, p.rep);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Fixed split words in', file);
    changed++;
  }
}
console.log('Done, fixed split words in', changed, 'files');
