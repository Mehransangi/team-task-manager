import { body } from 'express-validator';
import { stripTags } from '../utils/sanitize.js';
import { idParam } from './commonValidator.js';

const nameRule = (chain) =>
  chain
    .isString().withMessage('Team name must be text').bail()
    .customSanitizer(stripTags)
    .isLength({ min: 2, max: 100 }).withMessage('Team name must be between 2 and 100 characters');

const descriptionRule = body('description')
  .optional({ values: 'null' })
  .isString().withMessage('Description must be text').bail()
  .customSanitizer(stripTags)
  .isLength({ max: 500 }).withMessage('Description must be at most 500 characters');

export const teamIdRule = [idParam('id')];

export const createTeamRules = [
  nameRule(body('name').exists({ values: 'falsy' }).withMessage('Team name is required').bail()),
  descriptionRule,
];

export const updateTeamRules = [
  idParam('id'),
  nameRule(body('name').optional()),
  descriptionRule,
];

export const addMemberRules = [
  idParam('id'),
  body('email')
    .isString().withMessage('Email is required').bail()
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
];
