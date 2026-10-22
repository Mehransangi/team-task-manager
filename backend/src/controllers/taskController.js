import { matchedData } from 'express-validator';
import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildTaskFilter } from '../utils/taskFilter.js';
import { getMemberRole } from '../models/teamModel.js';
import { TASK_SELECT, findTaskForUser } from '../models/taskModel.js';

const toIdOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value));
const toTextOrNull = (value) => (value === '' || value === null || value === undefined ? null : value);

export const createTask = asyncHandler(async (req, res) => {
  const { team_id: teamId, title, description, status, priority, due_date: dueDate } = req.body;
  const assigneeId = toIdOrNull(req.body.assignee_id);

  if (!(await getMemberRole(teamId, req.user.id))) {
    return res.status(403).json({ message: 'You can only create tasks for teams you belong to.' });
  }

  if (assigneeId && !(await getMemberRole(teamId, assigneeId))) {
    return res.status(400).json({ message: 'The assignee must be a member of the team.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO tasks (team_id, title, description, status, priority, due_date, assignee_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      teamId,
      title,
      toTextOrNull(description),
      status || 'todo',
      priority || 'medium',
      toTextOrNull(dueDate),
      assigneeId,
      req.user.id,
    ]
  );

  return res.status(201).json(await findTaskForUser(rows[0].id, req.user.id));
});

export const getTasks = asyncHandler(async (req, res) => {
  const filters = matchedData(req, { locations: ['query'] });
  const { where, params } = buildTaskFilter(filters);

  const { rows } = await pool.query(
    `${TASK_SELECT}
     ${where}
     ORDER BY t.created_at DESC, t.id DESC`,
    [req.user.id, ...params]
  );

  return res.json(rows);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await findTaskForUser(req.params.id, req.user.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  return res.json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);
  const task = await findTaskForUser(taskId, req.user.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  if (!task.can_edit) {
    return res
      .status(403)
      .json({ message: 'Only the team owner, the task creator or the assignee can edit this task.' });
  }

  const body = req.body;
  const has = (key) => Object.hasOwn(body, key);
  const updates = {};

  if (has('title')) updates.title = body.title;
  if (has('description')) updates.description = toTextOrNull(body.description);
  if (has('status') && body.status) updates.status = body.status;
  if (has('priority') && body.priority) updates.priority = body.priority;
  if (has('due_date')) updates.due_date = toTextOrNull(body.due_date);

  if (has('assignee_id')) {
    const assigneeId = toIdOrNull(body.assignee_id);
    if (assigneeId && !(await getMemberRole(task.team_id, assigneeId))) {
      return res.status(400).json({ message: 'The assignee must be a member of the team.' });
    }
    updates.assignee_id = assigneeId;
  }

  const columns = Object.keys(updates);
  if (columns.length === 0) {
    return res.json(task);
  }

  const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');

  await pool.query(
    `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $${columns.length + 1}`,
    [...columns.map((column) => updates[column]), taskId]
  );

  return res.json(await findTaskForUser(taskId, req.user.id));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);
  const task = await findTaskForUser(taskId, req.user.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  if (!task.can_delete) {
    return res.status(403).json({ message: 'Only the team owner or the task creator can delete this task.' });
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  return res.json({ message: 'Task deleted successfully' });
});
