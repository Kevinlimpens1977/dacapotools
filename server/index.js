import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import appsRouter from './routes/apps.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const origin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin, credentials: true }));

// Static uploads - met logging
app.use('/uploads', (req, res, next) => {
  console.log('Requesting upload:', req.url);
  express.static(uploadsDir)(req, res, next);
});

// Routes
app.use('/api', authRouter);
app.use('/api', appsRouter);

// Root route for testing
app.get('/', (_req, res) => {
  res.json({ message: 'DaCapo Tools API is running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Test database connection
import pool from './lib/db.js';

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Test query successful:', rows);
    
    connection.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}

const server = app.listen(PORT, async () => {
  console.log(`DaCapo Tools API listening on http://localhost:${PORT}`);
  await testDbConnection();
});