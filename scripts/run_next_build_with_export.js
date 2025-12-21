const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..', 'frontend');
process.env.STATIC_EXPORT = 'true';
console.log('Running next build with STATIC_EXPORT=true in', root);
const r = spawnSync('npx', ['next', 'build'], { stdio: 'inherit', shell: true, cwd: root });
process.exit(r.status || 0);
