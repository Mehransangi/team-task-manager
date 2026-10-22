import pool from '../config/db.js';

export const TASK_SELECT = `
  SELECT t.id, t.team_id, t.title, t.description, t.status, t.priority,
         to_char(t.due_date, 'YYYY-MM-DD') AS due_date,
         t.assignee_id, t.created_by, t.created_at, t.updated_at,
         team.name AS team_name,
         assignee.name AS assignee_name,
         assignee.email AS assignee_email,
         creator.name AS created_by_name,
         COALESCE(me.role = 'owner' OR t.created_by = $1 OR t.assignee_id = $1, false) AS can_edit,
         COALESCE(me.role = 'owner' OR t.created_by = $1, false) AS can_delete
  FROM tasks t
  JOIN teams team ON team.id = t.team_id
  JOIN team_members me ON me.team_id = t.team_id AND me.user_id = $1
  LEFT JOIN users assignee ON assignee.id = t.assignee_id
  LEFT JOIN users creator ON creator.id = t.created_by`;

export const findTaskForUser = async (taskId, userId) => {
  const { rows } = await pool.query(`${TASK_SELECT} WHERE t.id = $2`, [userId, taskId]);
  return rows[0] ?? null;
};

export const findRemindersForUser = async (userId) => {
  const { rows } = await pool.query(
    `${TASK_SELECT}
     WHERE t.assignee_id = $1
       AND t.status <> 'done'
       AND t.due_date IS NOT NULL
       AND t.due_date <= CURRENT_DATE + 3
     ORDER BY t.due_date ASC`,
    [userId]
  );
  return rows;
};
