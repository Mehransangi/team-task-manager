import pool from '../config/db.js'

const isTeamOwner = async (userId, teamId) => {
    const result = await pool.query(
        `SELECT 1
        FROM team_members
        WHERE team_id = $1 AND user_id = $2 AND role = 'owner'`,
        [teamId, userId]
    )

    return result.rows.length > 0
}

export const createTeam = async (req, res) => {
    const { name, description } = req.body
    try {
        const result = await pool.query(
            `INSERT INTO teams (name, description, created_by)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, description, req.user.id]
        )

        const team = result.rows[0]

        await pool.query(
            `INSERT INTO team_members (team_id, user_id, role)
            VALUES ($1, $2, 'owner')`,
            [team.id, req.user.id]
        )
        res.status(201).json(team)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMyTeams = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, tm.role AS user_role
            FROM teams t
            JOIN team_members tm ON tm.team_id = t.id
            WHERE tm.user_id = $1
            ORDER BY t.created_at DESC`,
            [req.user.id]
        )
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getTeamById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, tm.role,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', u.id,
                            'name', u.name,
                            'email', u.email,
                            'role', tmb.role
                        )
                    ) FILTER (WHERE u.id IS NOT NULL),
                    '[]'::json
                ) AS members
            FROM teams t
            JOIN team_members tm ON tm.team_id = t.id
            LEFT JOIN team_members tmb ON tmb.team_id = t.id
            LEFT JOIN users u ON u.id = tmb.user_id
            WHERE t.id = $1 AND tm.user_id = $2
            GROUP BY t.id, tm.role`,
            [req.params.id, req.user.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' })
        }

        const team = result.rows[0]
        team.members = team.members || []
        return res.json(team)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateTeam = async (req, res) => {
    const { name, description } = req.body

    try {
        const allowed = await isTeamOwner(req.user.id, req.params.id)
        if (!allowed) {
            return res.status(403).json({ message: 'Only the team owner can update this team' })
        }

        const result = await pool.query(
            `UPDATE teams
            SET name = COALESCE($1, name),
                description = COALESCE($2, description)
            WHERE id = $3
            RETURNING *`,
            [name, description, req.params.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' })
        }

        return res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteTeam = async (req, res) => {
    try {
        const allowed = await isTeamOwner(req.user.id, req.params.id)
        if (!allowed) {
            return res.status(403).json({ message: 'Only the team owner can delete this team' })
        }

        const result = await pool.query(
            `DELETE FROM teams
            WHERE id = $1
            RETURNING *`,
            [req.params.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' })
        }

        return res.json({ message: 'Team deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const addTeamMember = async (req, res) => {
    const { email, role } = req.body

    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    }

    try {
        const allowed = await isTeamOwner(req.user.id, req.params.id)
        if (!allowed) {
            return res.status(403).json({ message: 'Only the team owner can add members' })
        }

        const userResult = await pool.query(
            `SELECT id, name, email FROM users WHERE email = $1`,
            [email]
        )

        if (userResult.rows.length === 0) {
            return res.status(202).json({
                message: `Invitation queued for ${email} (stubbed email invite; SMTP not configured).`,
                invitedEmail: email,
                pending: true,
            })
        }

        const memberUser = userResult.rows[0]

        const existing = await pool.query(
            `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1`,
            [req.params.id, memberUser.id]
        )

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Member already added to this team' })
        }

        const result = await pool.query(
            `INSERT INTO team_members (team_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING team_id, user_id, role`,
            [req.params.id, memberUser.id, role || 'member']
        )

        return res.status(201).json(result.rows[0])
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}