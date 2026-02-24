module.exports = {
  apps: [
    {
      name: "lebanese-lessons",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/var/www/lebanese-lessons",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};
