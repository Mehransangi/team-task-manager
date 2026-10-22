import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './db.js';
import env from './env.js';


const buildStore = () => {
  if (env.sessionStore === 'memory') {
    if (env.isProduction) {
      console.warn('WARNING: using the in-memory session store in production.');
    }
    return undefined;
  }

  const PostgresStore = connectPgSimple(session);
  return new PostgresStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  });
};

export default session({
  name: env.sessionCookieName,
  store: buildStore(),
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.cookieSameSite,
    maxAge: env.sessionMaxAgeMs,
  },
});
