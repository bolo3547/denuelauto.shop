const fs = require('fs');
const path = require('path');
const http = require('http');

const frontendRoot = path.resolve(__dirname, '..', 'frontend');
const pagesManifest = require(path.join(frontendRoot, '.next', 'server', 'pages-manifest.json'));

// Start with pages routes
const routes = Object.keys(pagesManifest)
  .filter(r => !r.startsWith('/api'))
  .map(r => r.replace(/\[.*?\]/g, 'placeholder'));

// Add some common app routes (best-effort)
routes.push('/admin', '/admin/inventory', '/dealer-template', '/dealer-template/stock', '/favorites', '/hq', '/login', '/register', '/sales', '/home');

const outBase = path.join(frontendRoot, 'out');
if (!fs.existsSync(outBase)) fs.mkdirSync(outBase, { recursive: true });

function saveRoute(route, html) {
  const p = path.join(outBase, route.replace(/^\//, ''));
  const dir = path.extname(p) ? path.dirname(p) : p;
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html, 'utf8');
  console.log('Saved', file);
}

async function fetchUrl(route) {
  const options = { hostname: 'localhost', port: 3000, path: route, method: 'GET' };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Crawling', routes.length, 'routes');
  for (const r of routes) {
    try {
      const res = await fetchUrl(r);
      if (res.status === 200) saveRoute(r, res.body);
      else console.log('Skipping', r, 'status', res.status);
    } catch (e) {
      console.log('Error fetching', r, e.message);
    }
  }
  console.log('Crawl complete');
}

if (require.main === module) main().catch(err => { console.error(err); process.exit(1); });
