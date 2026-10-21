import pool from '../config/db.js'

export const createTask = async (req, res) => {
    const {
        team_id,
        title,
        description,
        status,
        priority,
        due_date,
        assignee_id,
    } = req.body
    try {
        const result = await pool.query(
            `INSERT INTO tasks (team_id, title, description, status, priority, due_date, assignee_id, created_by)
            VALUE ( $1, $2, $3, $4, $5, $6, $7, $8 )
            RETRUNING *`,
            [
                team_id,
                title,
                description,
                status || 'todo',
                priority || 'medium',
                due_date,
                assignee_id,
                req.user.id
            ]
        )
        return res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getTasks = async (req,res) => {
    try {
        const result = await pool.query(
            `SELECT *
            FROM tasks
            WHERE team_id IN (
            SELECT team_id
            FROM team_members
            WHERE user_id = $1
            )
            ORDER BY created_at DESC`,
            [req,user.id]
        )

        return res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

