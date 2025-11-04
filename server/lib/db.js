import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load correct .env file based on NODE_ENV
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
const envPath = path.join(__dirname, '..', '..', envFile);

console.log(`[DB] Loading environment from: ${envFile}`);
dotenv.config({ path: envPath });

// Log database configuration (without password)
console.log('Database configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  environment: process.env.NODE_ENV
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 seconds
  ssl: {
    rejectUnauthorized: false // Voor het geval er SSL nodig is
  }
});

export default pool;
