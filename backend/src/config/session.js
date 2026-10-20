import session from "express-session";
import pgSession from 'connect-pg-simple'
import pool from './db.js'


const PostgresStore = pgSession(session)

const isProduction = process.env.NODE_ENV === 'production'

export default session({
    store: new PostgresStore({
        pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'sadklfwioerhf23kefjsdklfj234wdsflajhdsf4',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 7,
    }
})