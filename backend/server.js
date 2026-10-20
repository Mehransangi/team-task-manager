import express from 'express';
import 'dotenv/config';
import pool from './src/config/db.js';
import session from './src/config/session.js';
import passport from './src/config/passport.js'
import authRoutes from './src/routes/authRoutes.js'

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

app.use(session)
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send('Server On');
});

app.use('/api/auth', authRoutes)

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      success: true,
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database connection failed: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: error.message,
    });
  }
});

pool.connect().then(() => {
    console.log('Connected to Neon');
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}/`);
    });
  }).catch((error) => {
    console.error('Unable to connect to Neon database:', error.message);
    process.exit(1);
  });

