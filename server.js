import { createApp } from './src/app.js';
import { ensureAuth } from './src/auth.js';
import { HOST, IS_PROD, PORT, SITE_URL } from './src/config.js';
import { initStores } from './src/store.js';

async function main() {
  await initStores();
  await ensureAuth();

  const app = createApp();
  const server = app.listen(PORT, HOST, () => {
    console.log('');
    console.log(`  Yugan Photography`);
    console.log(`  ${IS_PROD ? 'production' : 'development'} · ${SITE_URL}`);
    console.log(`  listening on http://${HOST}:${PORT}`);
    console.log(`  studio:    http://${HOST}:${PORT}/admin/login`);
    console.log('');
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, closing.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] Could not start:', err);
  process.exit(1);
});
