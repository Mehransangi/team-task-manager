import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pool from './db.js';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];

      const match = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
      if (!user || !match) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    done(null, rows[0] || false);
  } catch (error) {
    done(error);
  }
});

export default passport;
