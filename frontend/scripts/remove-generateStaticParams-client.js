const fs = require('fs');
const path = require('path');
function findFiles(dir){const out=[];for(const p of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,p.name);if(p.isDirectory())out.push(...findFiles(full));else out.push(full);}return out}
const root = path.join(process.cwd(),'app');
const files=findFiles(root).filter(f=>f.endsWith('page.tsx')||f.endsWith('page.jsx'));
let removed=0;
for(const f of files){let text=fs.readFileSync(f,'utf8'); if(/export\s+function\s+generateStaticParams/.test(text) && /("use client"|'use client')/.test(text)){const idx=text.indexOf('export function generateStaticParams');let braceIdx=text.indexOf('{', idx);let pos=braceIdx;let depth=0;while(pos<text.length){if(text[pos]==='{')depth++;else if(text[pos]==='}') {depth--; if(depth===0){pos++; break}} pos++} const removedText=text.slice(idx,pos); text=text.replace(removedText,''); fs.writeFileSync(f,text,'utf8'); console.log('Removed generateStaticParams in',f); removed++;}} console.log('Done, removed',removed);