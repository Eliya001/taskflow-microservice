const pool = require('./db');

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      assigned_to INT,
      assigned_name VARCHAR(100),
      created_by INT NOT NULL,
      created_by_name VARCHAR(100),
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Tasks table ready');
};

module.exports = { createTable };
