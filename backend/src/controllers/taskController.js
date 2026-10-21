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
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
            RETURNING *`,
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

export const getTasks = async (req, res) => {
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
            [req.user.id]
        )

        return res.json(result.rows)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getTaskById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
            FROM tasks
            WHERE id = $1 AND team_id IN (
            SELECT team_id
            FROM team_members
            WHERE user_id = $2)`, [req.params.id, req.user.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateTask = async (req, res) => {
    const { title, description, status, priority, due_date, assignee_id } = req.body
    try {
        const result = await pool.query(
            `UPDATE tasks
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                priority = COALESCE($4, priority),
                due_date = COALESCE($5, due_date),
                assignee_id = COALESCE($6, assignee_id),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *`,[title, description, status, priority, due_date, assignee_id, req.params.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' })
        }
        return res.json(result.rows[0])
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteTask = async (req,res) => {
    try {
        const result = await pool.query(
            `DELETE FROM tasks
            WHERE id = $1
            RETURNING *`,[req.params.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.json({ message: 'Task deleted successfully'})
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}