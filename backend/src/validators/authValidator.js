import { body } from 'express-validator'

export const registerRules = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 - 100 characters'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
]

export const loginRules = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
]