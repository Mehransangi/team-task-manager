import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import pool from './db'

passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const result = await pool.query(
                    'SELECT * FROM users WHERE email = $1', [email]
                )

                const user = result.rows[0]
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' })
                }

                const match = await bcrypt.compare(password, user.password_hash)
                if (!match) {
                    return done(null, false, { message: 'Invalid email or password' })
                }

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id])
        done(null, result.rows[0] || null)
    } catch (error) {
        return done(error)
    }
})

export default passport