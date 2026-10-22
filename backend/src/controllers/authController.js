import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import env from '../config/env.js';
import passport from '../config/passport.js';
import asyncHandler from '../utils/asyncHandler.js';
import { acceptPendingInvites } from '../models/teamModel.js';
import { findRemindersForUser } from '../models/taskModel.js';

const UNIQUE_VIOLATION = '23505';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  let user;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
    user = result.rows[0];
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ message: 'User already exists' });
    }
    throw error;
  }

  try {
    await acceptPendingInvites(user.id, email);
  } catch (error) {
    console.warn('Could not accept pending invites:', error.message);
  }

  return res.status(201).json({ message: 'User registered successfully', user });
});

export const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    return req.logIn(user, async (loginErr) => {
      if (loginErr) return next(loginErr);

      try {
        const reminders = await findRemindersForUser(user.id);

        return res.json({
          message: 'Login successful',
          user: { id: user.id, name: user.name, email: user.email },
          reminders,
        });
      } catch (error) {
        return next(error);
      }
    });
  })(req, res, next);
};

export const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    return req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);

      res.clearCookie(env.sessionCookieName);
      return res.json({ message: 'Logged out successfully' });
    });
  });
};

export const getCurrentUser = (req, res) => {
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
  });
};
