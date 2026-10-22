import { body, query } from 'express-validator';
import { stripTags } from '../utils/sanitize.js';
import { isValidDateString } from '../utils/dates.js';
import { idParam } from './commonValidator.js';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const isEmpty = (value) => value === '' || value === null || value === undefined;

const taskFieldRules = [
  body('title')
    .optional()
    .isString().withMessage('Title must be text').bail()
    .customSanitizer(stripTags)
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional({ values: 'null' })
    .isString().withMessage('Description must be text').bail()
    .customSanitizer(stripTags)
    .isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('priority')
    .optional({ values: 'falsy' })
    .isIn(TASK_PRIORITIES).withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('due_date')
    .optional({ values: 'null' })
    .custom((value) => isEmpty(value) || isValidDateString(value))
    .withMessage('Due date must be a valid date (YYYY-MM-DD)'),
  body('assignee_id')
    .optional({ values: 'null' })
    .custom((value) => isEmpty(value) || (Number.isInteger(Number(value)) && Number(value) > 0))
    .withMessage('Assignee must be a valid user id'),
];

export const createTaskRules = [
  body('team_id').isInt({ min: 1 }).withMessage('A valid team is required').toInt(),
  body('title').exists({ values: 'falsy' }).withMessage('Task title is required'),
  ...taskFieldRules,
];

export const updateTaskRules = [idParam('id'), ...taskFieldRules];

export const taskIdRule = [idParam('id')];

export const listTaskRules = [
  query('team_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid team').toInt(),
  query('assignee_id')
    .optional({ values: 'falsy' })
    .custom((value) => value === 'me' || value === 'unassigned' || /^\d+$/.test(value))
    .withMessage('assignee_id must be "me", "unassigned" or a user id'),
  query('status').optional({ values: 'falsy' }).isIn(TASK_STATUSES).withMessage('Invalid status'),
  query('priority').optional({ values: 'falsy' }).isIn(TASK_PRIORITIES).withMessage('Invalid priority'),
  query('search')
    .optional()
    .isString().bail()
    .customSanitizer(stripTags)
    .isLength({ max: 100 }).withMessage('Search text is too long'),
];
