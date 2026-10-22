import { body } from 'express-validator';
import { stripTags } from '../utils/sanitize.js';

export const registerRules = [
  body('name')
    .isString().withMessage('Name is required').bail()
    .customSanitizer(stripTags)
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password is required').bail()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters'),
];

export const loginRules = [
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password is required').bail()
    .notEmpty().withMessage('Password is required'),
];
