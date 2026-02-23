module.exports = {
  apps: [
    {
      name: "3d-printing-api",
      script: "bun",
      args: "run src/index.ts",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
