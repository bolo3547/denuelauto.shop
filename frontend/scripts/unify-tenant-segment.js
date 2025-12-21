const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fromSeg = '[tenantSlug]';
const toSeg = '[slug]';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.isFile()) {
      if (full.includes(fromSeg)) {
        migrateFile(full);
      }
    }
  }
}

function migrateFile(fullPath) {
  const rel = path.relative(root, fullPath);
  const newRel = rel.replaceAll(fromSeg, toSeg);
  const newFull = path.join(root, newRel);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace params.tenantSlug -> params.slug
  content = content.replaceAll('params.tenantSlug', 'params.slug');
  // Replace type annotations { params: { tenantSlug: string } } -> slug
  content = content.replaceAll('params: { tenantSlug: string }', 'params: { slug: string }');
  // Replace tenantSlug: params.tenantSlug -> slug: params.slug
  content = content.replaceAll('tenantSlug: params.tenantSlug', 'slug: params.slug');
  // Replace generateStaticParams placeholders
  content = content.replaceAll("{ tenantSlug: 'placeholder' }", "{ slug: 'placeholder' }");
  content = content.replaceAll('tenantSlug', 'slug'); // broad replacement to catch other cases (best-effort)

  // Ensure destination dir exists
  fs.mkdirSync(path.dirname(newFull), { recursive: true });
  fs.writeFileSync(newFull, content, 'utf8');
  fs.unlinkSync(fullPath);
  console.log('Moved', rel, '->', newRel);
}

walk(root);
console.log('Done');
