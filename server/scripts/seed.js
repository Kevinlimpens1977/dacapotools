import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });

  try {
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create apps table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category ENUM('Personeel', 'Administratie', 'MT', 'Overzicht') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        link_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert some sample data
    await connection.query(`
      INSERT INTO apps (category, title, description, link_url) VALUES 
      ('Personeel', 'Voorbeeld App', 'Dit is een voorbeeldapplicatie', 'https://example.com'),
      ('Administratie', 'Admin Tool', 'Administratieve tool', 'https://admin.example.com'),
      ('MT', 'Dashboard', 'Management dashboard', 'https://dashboard.example.com'),
      ('Overzicht', 'Status', 'Systeemstatus', 'https://status.example.com')
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();