import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { TEAM_SELECT, getMemberRole } from '../models/teamModel.js';

const findTeamForUser = async (teamId, userId) => {
  const { rows } = await pool.query(`${TEAM_SELECT} WHERE t.id = $2`, [userId, teamId]);
  return rows[0] ?? null;
};

const requireOwner = async (req, res, teamId) => {
  const role = await getMemberRole(teamId, req.user.id);

  if (!role) {
    res.status(404).json({ message: 'Team not found' });
    return false;
  }
  if (role !== 'owner') {
    res.status(403).json({ message: 'Only the team owner can do this' });
    return false;
  }
  return true;
};

export const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, description || null, req.user.id]
    );

    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [rows[0].id, req.user.id]
    );

    await client.query('COMMIT');

    return res.status(201).json(await findTeamForUser(rows[0].id, req.user.id));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const getMyTeams = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`${TEAM_SELECT} ORDER BY t.created_at DESC`, [req.user.id]);
  res.json(rows);
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await findTeamForUser(req.params.id, req.user.id);

  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  return res.json(team);
});

export const updateTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  if (!(await requireOwner(req, res, teamId))) return undefined;

  const { name, description } = req.body;
  const hasDescription = Object.hasOwn(req.body, 'description');

  await pool.query(
    `UPDATE teams
     SET name = COALESCE($1, name),
         description = CASE WHEN $2::boolean THEN $3 ELSE description END
     WHERE id = $4`,
    [name ?? null, hasDescription, description || null, teamId]
  );

  return res.json(await findTeamForUser(teamId, req.user.id));
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  if (!(await requireOwner(req, res, teamId))) return undefined;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tasks WHERE team_id = $1', [teamId]);
    await client.query('DELETE FROM team_invites WHERE team_id = $1', [teamId]);
    await client.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);
    await client.query('DELETE FROM teams WHERE id = $1', [teamId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return res.json({ message: 'Team deleted successfully' });
});

export const addTeamMember = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  if (!(await requireOwner(req, res, teamId))) return undefined;

  const { email } = req.body;

  const userResult = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);

  if (userResult.rows.length === 0) {
    await pool.query(
      `INSERT INTO team_invites (team_id, email, invited_by)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM team_invites WHERE team_id = $1 AND email = $2)`,
      [teamId, email, req.user.id]
    );
    console.log(`[invite stub] Would email ${email} an invitation to join team ${teamId}`);

    return res.status(202).json({
      message: `${email} has no account yet. An invitation is pending and they will join when they register (email sending is stubbed).`,
      invitedEmail: email,
      pending: true,
    });
  }

  const member = userResult.rows[0];

  if (await getMemberRole(teamId, member.id)) {
    return res.status(409).json({ message: 'Member already added to this team' });
  }

  await pool.query(
    `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')`,
    [teamId, member.id]
  );

  return res.status(201).json({
    message: `${member.name} was added to the team.`,
    member: { ...member, role: 'member' },
  });
});
