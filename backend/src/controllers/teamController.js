import pool from '../config/db.js'

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
            `SELECT t.*
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
            `SELECT t.*, tm.role
        FROM teams t
        JOIN team_members tm ON tm.team_id = t.id
        WHERE t.id = $1 AND tm.user_id = $2`,
            [req.params.id, req.user.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' })
        }
        return res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateTeam = async (req, res) => {
    const { name, description } = req.body
    try {
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
    const { user_id, role } = req.body
    try {
        const result = await pool.query(
            `INSERT INTO team_members (team_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [req.params.id, user_id, role || 'member']
        )

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Member already added to this team' });
        }

        return res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}