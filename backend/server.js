import express from 'express';
import 'dotenv/config';
import pool from './src/config/db.js';
import session from './src/config/session.js';
import passport from './src/config/passport.js'
import authRoutes from './src/routes/authRoutes.js'
import teamRoutes from './src/routes/teamRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

app.use(session)
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send('Server is alive');
});

app.use('/api/auth', authRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/tasks', taskRoutes);

app.listen(PORT, async () => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log(`DB time: ${result.rows[0].current_time}`);
    console.log(`http://localhost:${PORT}/`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
});

