const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', 'frontend');
const apiDir = path.join(root, 'app', 'api');
const disabledDir = path.join(root, 'app', `_api_disabled_${Date.now()}`);

function moveOut() {
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, disabledDir);
    console.log('Moved app/api ->', path.relative(process.cwd(), disabledDir));
    return true;
  }
  return false;
}

function moveBack() {
  if (fs.existsSync(disabledDir)) {
    fs.renameSync(disabledDir, apiDir);
    console.log('Restored app/api from', path.relative(process.cwd(), disabledDir));
    return true;
  }
  return false;
}

function run(cmd, args, opts = {}) {
  console.log('>', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: root, ...opts });
  return r.status;
}

async function main() {
  const moved = moveOut();
  try {
    // ensure static export env var is set for build
    process.env.STATIC_EXPORT = 'true';

    const buildStatus = run('npx', ['next', 'build']);
    if (buildStatus !== 0) throw new Error('next build failed');

    const exportStatus = run('npx', ['next', 'export']);
    if (exportStatus !== 0) throw new Error('next export failed');

    console.log('Static export complete — check frontend/out');
  } catch (e) {
    console.error('Export failed:', e && e.message);
    throw e;
  } finally {
    if (moved) moveBack();
  }
}

if (require.main === module) {
  main().catch(() => process.exit(1));
}
