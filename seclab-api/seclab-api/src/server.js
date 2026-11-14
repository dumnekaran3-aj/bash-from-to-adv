const config = require('./config');
const db = require('./db');
const seed = require('./seed');
const buildApp = require('./app');

(async () => {
  try {
    await db.connect();
    if (config.db.seedOnBoot || config.db.mode === 'memory') await seed();
  } catch (e) {
    console.error(`DB init failed (${config.db.mode}): ${e.message}`);
    process.exit(1);
  }

  const PORT = config.port;
  const app = buildApp();
  const server = app.listen(PORT, config.host, () => {
    const modeLabel = config.db.mode === 'memory' ? 'Standalone In-Memory Mode' : 'MongoDB Mode';
    console.log(`Server is running on port ${PORT} (${modeLabel})`);
    console.log('--------------------------------------------------------------');
    console.log('---------------------endpoints--------------------------------');
    console.log(`Health check endpoint GET : http://localhost:${PORT}/api/health`);
    console.log(`Local security practice lab: http://127.0.0.1:${PORT}/api/lab`);
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/users [ADMIN]`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/auth/signin`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/signup`);
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/public/user`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/public/api/user/:id/profile [AUTH]`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/public/api/admin/dashboard [ADMIN]`);
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/Admin/dashboard [ADMIN]`);
    console.log(`Protected User GET : http://localhost:${PORT}/api/user [AUTH]`);
    console.log(`Products endpoint GET : http://localhost:${PORT}/api/products`);
    console.log('---------------------extra endpoints--------------------------');
    console.log(`Auth   POST : /api/auth/refresh | /logout | /logout-all [AUTH] | /change-password [AUTH]`);
    console.log(`Client GET/POST : /api/client/dashboard | /team | /orders | /orders/:id | /api-keys [AUTH]`);
    console.log(`Admin  : /api/admin/users/:id/role|status | /products | /orders | /tenants | /audit-logs [ADMIN]`);
    console.log(`PaaS   : /api/paas/v1/whoami | /records | /records/:id  (header x-api-key)`);
    if (config.labMode) {
      console.log('-------------------------------------special-endpoints------------------------------------------------------------');
      console.log(`user built in data endpoint GET : http://localhost:${PORT}/api/test/v1/user/:id`);
      console.log(`(vulnerable lab targets: see /api/lab, localhost only)`);
    }
  });

  const shutdown = () => server.close(async () => { await db.close(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
