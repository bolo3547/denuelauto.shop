const fs = require('fs'); const path = require('path');
function findFiles(dir){const out=[]; for(const p of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,p.name); if(p.isDirectory()) out.push(...findFiles(full)); else out.push(full);} return out}
const root = path.join(process.cwd(),'app');
const files=findFiles(root).filter(f=>/(page\.(tsx|jsx)|route\.(ts|js))$/.test(f));
const conflicts = [];
for(const f of files){const t=fs.readFileSync(f,'utf8'); if(/export\s+function\s+generateStaticParams\s*\(/.test(t) && /("use client"|'use client')/.test(t)){conflicts.push(f)}}
console.log('Conflicts:', conflicts.length); conflicts.forEach(c=>console.log(c));
