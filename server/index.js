import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import appsRouter from './routes/apps.js';
import authRouter from './routes/auth.js';

// Load environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

console.log(`[Server] Starting in ${process.env.NODE_ENV} mode`);

// Ensure uploads directory exists
const uploadsDir = isProduction 
  ? path.join(__dirname, '..', 'uploads')
  : path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const origin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin, credentials: true }));

// Static uploads
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.url);
  if (fs.existsSync(filePath)) {
    res.header('Cache-Control', 'public, max-age=31536000');
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
    next();
  } else {
    console.log('File not found:', filePath);
    res.status(404).send('File not found');
  }
});

// API Routes
app.use('/api', authRouter);
app.use('/api', appsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Serve static frontend in production
if (isProduction) {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  
  if (fs.existsSync(clientDistPath)) {
    console.log('[Server] Serving static frontend from:', clientDistPath);
    
    // Serve static files
    app.use(express.static(clientDistPath));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    console.warn('[Server] Frontend dist folder not found:', clientDistPath);
  }
} else {
  // Development - just API routes
  app.get('/', (_req, res) => {
    res.json({ message: 'DaCapo Tools API is running in development mode' });
  });
}

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