import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');

try {
  await pool.query(schema);
  console.log('Database schema applied.');
} catch (error) {
  console.error('Failed to apply schema:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
