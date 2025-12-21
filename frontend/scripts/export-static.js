const fs = require('node:fs');
const path = require('node:path');

const staticDir = path.join(process.cwd(), '.next', 'output', 'static');
const outDir = path.join(process.cwd(), 'out');

if (!fs.existsSync(staticDir)) {
  throw new Error(`Static export output not found at ${staticDir}. Did you run "next build" with output: 'export'?`);
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(staticDir, outDir, { recursive: true });
console.log(`Export ready at ${outDir}`);
