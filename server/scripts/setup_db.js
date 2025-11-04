import pool from '../lib/db.js';

async function setupDatabase() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Setting up database tables...\n');
    
    // Create categories table
    console.log('Creating categories table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created\n');
    
    // Create apps table
    console.log('Creating apps table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Apps table created\n');
    
    // Insert default categories
    console.log('Adding default categories...');
    await connection.query(`
      INSERT INTO categories (name, description) VALUES 
        ('Personeel', 'Applicaties voor personeelsbeheer'),
        ('Administratie', 'Administratieve tools en systemen'),
        ('MT', 'Management Team applicaties'),
        ('Overzicht', 'Algemene overzichten en dashboards')
      ON DUPLICATE KEY UPDATE description=VALUES(description)
    `);
    console.log('✅ Categories added\n');
    
    // Insert test data
    console.log('Adding test apps...');
    await connection.query(`
      INSERT INTO apps (title, description, url, category, image_url) VALUES
        ('Nu.nl', 'Nederlandse nieuwssite die 24 uur per dag nieuws brengt', 'https://nu.nl', 'Personeel', NULL),
        ('Voorbeeld App', 'Dit is een voorbeeldapplicatie', 'https://example.com', 'Personeel', NULL),
        ('24/7 Service', 'Systeem voor het aanvragen en beheer', 'https://example.com', 'Personeel', NULL),
        ('Admin Tool', 'Administratie tool voor beheer', 'https://example.com', 'Administratie', NULL),
        ('MT Dashboard', 'Management team dashboard', 'https://example.com', 'MT', NULL),
        ('Algemeen Overzicht', 'Overzicht van alle systemen', 'https://example.com', 'Overzicht', NULL)
    `);
    console.log('✅ Test apps added\n');
    
    // Show results
    const [apps] = await connection.query('SELECT * FROM apps ORDER BY category, created_at DESC');
    console.log(`📱 Total apps in database: ${apps.length}\n`);
    
    // Show apps per category
    const [categoryCount] = await connection.query(
      'SELECT category, COUNT(*) as count FROM apps GROUP BY category ORDER BY category'
    );
    console.log('Apps per category:');
    categoryCount.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} apps`);
    });
    
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
