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

// Static uploads
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api', authRouter);
app.use('/api', appsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`DaCapo Tools API listening on http://localhost:${PORT}`);
});
