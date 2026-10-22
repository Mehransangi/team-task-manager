import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set when NODE_ENV=production');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set (see backend/.env.example)');
}

const list = (value, fallback) =>
  (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const env = {
  isProduction,
  port: Number(process.env.PORT) || 8080,
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL !== 'false',
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
  sessionStore: process.env.SESSION_STORE === 'memory' ? 'memory' : 'postgres',
  sessionCookieName: 'ttm.sid',
  sessionMaxAgeMs: 1000 * 60 * 60 * 24,
  clientUrls: list(process.env.CLIENT_URL, 'http://localhost:5173'),
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  staticDir: process.env.STATIC_DIR || 'public',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
};

export default env;
