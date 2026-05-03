module.exports = {
  apps: [
    {
      name: 'cv-sentinel',
      script: 'src/server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'cv-dashboard',
      script: 'npm',
      args: 'run dev',
      cwd: './curzy-vitality',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
