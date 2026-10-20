import express from 'express';
import 'dotenv/config';
import pool from './src/config/db.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Server On');
});

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

pool
  .connect()
  .then(() => {
    console.log('Connected to Neon');
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to Neon database:', error.message);
    process.exit(1);
  });

