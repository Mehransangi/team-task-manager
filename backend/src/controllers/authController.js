import bcrypt from 'bcrypt'
import pool from '../config/db.js'
import passport from '../config/passport.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body
    try {

        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email]
        )
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, passwordHash]
        )

        const user = result.rows[0]

        return res.status(201).json({
            message: 'User Registered successfully',
            user,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Registration failed',
            error: error.message,
        })
    }
}

export const loginUser = (req, res, next) => {
    
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(401).json({
                    message: info?.message || 'Invalid credentials'
                })
            }

            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    return next(loginErr)
                }

                return res.json({
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                })
            })
        })(req, res, next)
    
}

export const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' })
        }

        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            return res.json({ message: 'Logged out successfully' })
        })
    })
}

export const getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' })
    }

    return res.json({
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        }
    })
}