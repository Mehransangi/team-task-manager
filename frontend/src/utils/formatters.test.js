import test from 'node:test';
import assert from 'node:assert/strict';
import { daysUntil, describeDue, isOverdue, parseDateOnly } from './formatters.js';
import { validateTaskForm, validateTeamForm, getErrorMessage } from './validators.js';

const now = new Date(2026, 9, 22, 15, 30);

test('parseDateOnly keeps the calendar day regardless of timezone', () => {
  const date = parseDateOnly('2026-10-22');
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getDate(), 22);
  assert.equal(parseDateOnly(''), null);
  assert.equal(parseDateOnly(null), null);
});

test('daysUntil counts whole calendar days', () => {
  assert.equal(daysUntil('2026-10-22', now), 0);
  assert.equal(daysUntil('2026-10-25', now), 3);
  assert.equal(daysUntil('2026-10-20', now), -2);
  assert.equal(daysUntil(null, now), null);
});

test('isOverdue ignores finished tasks and tasks without a date', () => {
  assert.equal(isOverdue({ due_date: '2026-10-20', status: 'todo' }, now), true);
  assert.equal(isOverdue({ due_date: '2026-10-20', status: 'done' }, now), false);
  assert.equal(isOverdue({ due_date: '2026-10-22', status: 'todo' }, now), false);
  assert.equal(isOverdue({ due_date: null, status: 'todo' }, now), false);
});

test('describeDue gives readable text', () => {
  assert.equal(describeDue('2026-10-22', now), 'due today');
  assert.equal(describeDue('2026-10-23', now), 'due tomorrow');
  assert.equal(describeDue('2026-10-27', now), 'due in 5 days');
  assert.equal(describeDue('2026-10-21', now), '1 day overdue');
  assert.equal(describeDue('2026-10-19', now), '3 days overdue');
});

test('validateTaskForm and validateTeamForm', () => {
  assert.match(validateTaskForm({ team_id: '', title: 'x' }), /team/i);
  assert.match(validateTaskForm({ team_id: '1', title: '   ' }), /title/i);
  assert.equal(validateTaskForm({ team_id: '1', title: 'Ship it' }), '');
  assert.match(validateTeamForm({ name: 'a' }), /at least 2/);
  assert.equal(validateTeamForm({ name: 'Design team', description: '' }), '');
});

test('getErrorMessage prefers validation messages from the API', () => {
  const error = { response: { data: { message: 'Validation failed', errors: [{ message: 'Title is required' }] } } };
  assert.equal(getErrorMessage(error), 'Title is required');
  assert.equal(getErrorMessage({ response: { data: { message: 'Nope' } } }), 'Nope');
  assert.equal(getErrorMessage(new Error('x'), 'fallback'), 'fallback');
});
