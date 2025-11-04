import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../lib/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    // Lees het SQL bestand
    const sqlPath = path.join(__dirname, 'init_database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split op statements (simpele manier, werkt voor basis SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    // Voer elk statement uit
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('SHOW') || 
          statement.toUpperCase().startsWith('DESCRIBE') ||
          statement.toUpperCase().startsWith('SELECT')) {
        const [rows] = await pool.query(statement);
        console.log('Query result:', rows);
      } else {
        await pool.query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✅ Database initialized successfully!');
    
    // Toon huidige apps
    const [apps] = await pool.query('SELECT * FROM apps ORDER BY created_at DESC');
    console.log(`\n📱 Total apps in database: ${apps.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
