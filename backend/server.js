import env from './src/config/env.js';
import app from './src/app.js';
import pool from './src/config/db.js';

const server = app.listen(env.port, async () => {
  console.log(`Server listening on port ${env.port} (${env.isProduction ? 'production' : 'development'})`);

  try {
    await pool.query('SELECT 1');
    console.log('Database connection OK');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
