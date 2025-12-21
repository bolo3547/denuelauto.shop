// ./scripts/verify-static.js
// Fail the build early if server-only tokens (Prisma, app/api routes) are present in frontend code
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.resolve(__dirname, '..');
const forbidden = [
  "@prisma/client",
  "from '@/lib/prisma'",
  "from \"@/lib/prisma\"",
  "from '../lib/prisma'",
  "from \"../lib/prisma\"",
  '/app/api/',
  '/pages/api/',
];

let found = [];
const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.tsbuildinfo', 'package-lock.json'];
patterns.forEach(pattern => {
  glob.sync(pattern, { cwd: root, ignore: ['node_modules/**', '.next/**', 'out/**', 'scripts/**', '**/*.tsbuildinfo', 'package-lock.json', 'lib/hqProvision.ts', 'lib/hqprovision.ts'] }).forEach(file => {
    const full = path.join(root, file);
    const content = fs.readFileSync(full, 'utf8');
    forbidden.forEach(token => {
      if (content.includes(token)) found.push({ file, token });
    });
  });
});

if (found.length > 0) {
  console.error('\nSTATIC VALIDATION FAILED - forbidden server-side tokens found in frontend:');
  found.forEach(f => console.error(`  - ${f.file}: ${f.token}`));
  console.error('\nFix: move server code to the backend project and remove Prisma imports from frontend.');
  process.exit(2);
}
console.log('Static validation passed — no server tokens found.');
