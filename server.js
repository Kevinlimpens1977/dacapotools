import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 5000;

// Database configuration
const pool = mysql.createPool({
  host: '72.60.34.162',
  port: 3306,
  user: 'root',
  password: '2025Dacapo2025#',
  database: 'dacapo_apps',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test database connection and setup
pool.getConnection()
  .then(async connection => {
    console.log('Successfully connected to MySQL database');
    
    // Create table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(512),
        link_url VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert a test record
    await connection.query(`
      INSERT INTO apps (title, description, image_url, link_url) 
      VALUES (?, ?, ?, ?)
    `, [
      'Test App',
      'Dit is een test applicatie',
      'https://via.placeholder.com/150',
      'https://example.com'
    ]);
    
    console.log('Database setup completed');
    connection.release();
  })
  .catch(err => {
    console.error('Error setting up the database:', err);
  });

// Get all apps
app.get('/api/apps', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM apps ORDER BY title ASC');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

app.listen(port, () => {
  console.log(`API Server running on http://localhost:${port}`);
});