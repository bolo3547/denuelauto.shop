module.exports = {
  apps: [
    {
      name: 'denuel-api',
      script: 'dist/server.js',
      cwd: '/var/www/denuel',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
