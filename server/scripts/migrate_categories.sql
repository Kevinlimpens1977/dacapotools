CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wijzig apps tabel om foreign key naar categories toe te voegen
ALTER TABLE apps
ADD COLUMN category_id INT,
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id) REFERENCES categories(id);