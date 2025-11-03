import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function updateImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    await connection.query('UPDATE apps SET image_url = NULL WHERE image_url LIKE ?', ['/uploads/%']);
    console.log('Successfully updated image URLs to NULL');
  } catch (err) {
    console.error('Error updating image URLs:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateImages();