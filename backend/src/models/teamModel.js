import pool from '../config/db.js';

export const getMemberRole = async (teamId, userId, db = pool) => {
  const { rows } = await db.query(
    'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1',
    [teamId, userId]
  );
  return rows[0]?.role ?? null;
};

export const acceptPendingInvites = async (userId, email, db = pool) => {
  await db.query(
    `INSERT INTO team_members (team_id, user_id, role)
     SELECT i.team_id, $1, 'member'
     FROM team_invites i
     WHERE i.email = $2
       AND NOT EXISTS (
         SELECT 1 FROM team_members m WHERE m.team_id = i.team_id AND m.user_id = $1
       )`,
    [userId, email]
  );
  await db.query('DELETE FROM team_invites WHERE email = $1', [email]);
};

export const TEAM_SELECT = `
  SELECT t.id, t.name, t.description, t.created_by, t.created_at,
         me.role AS role,
         me.role AS user_role,
         COALESCE(
           (SELECT json_agg(
                     json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'role', m.role)
                     ORDER BY u.name
                   )
            FROM team_members m
            JOIN users u ON u.id = m.user_id
            WHERE m.team_id = t.id),
           '[]'::json
         ) AS members
  FROM teams t
  JOIN team_members me ON me.team_id = t.id AND me.user_id = $1`;
