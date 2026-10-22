import rateLimit from 'express-rate-limit';

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
};

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 300,
  message: { message: 'Too many requests. Please slow down.' },
});
