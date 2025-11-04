-- Database schema voor DaCapo Toolbox
USE dacapo_apps;

-- Drop tables als ze bestaan (optioneel)
-- DROP TABLE IF EXISTS apps;
-- DROP TABLE IF EXISTS categories;

-- Categorieën tabel
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Apps tabel
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
);

-- Voeg standaard categorieën toe
INSERT INTO categories (name, description) VALUES 
  ('Personeel', 'Applicaties voor personeelsbeheer'),
  ('Administratie', 'Administratieve tools en systemen'),
  ('MT', 'Management Team applicaties'),
  ('Overzicht', 'Algemene overzichten en dashboards')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Test data
INSERT INTO apps (title, description, url, category, image_url) VALUES
  ('Nu.nl', 'Nederlandse nieuwssite die 24 uur per dag nieuws brengt', 'https://nu.nl', 'Personeel', NULL),
  ('Voorbeeld App', 'Dit is een voorbeeldapplicatie', 'https://example.com', 'Personeel', NULL),
  ('24/7 Service', 'Systeem voor het aanvragen en beheer', 'https://example.com', 'Personeel', NULL),
  ('Admin Tool', 'Administratie tool voor beheer', 'https://example.com', 'Administratie', NULL),
  ('MT Dashboard', 'Management team dashboard', 'https://example.com', 'MT', NULL),
  ('Algemeen Overzicht', 'Overzicht van alle systemen', 'https://example.com', 'Overzicht', NULL);
