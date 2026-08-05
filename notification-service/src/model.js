const pool = require('./db');

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      type ENUM('task_assigned', 'task_completed', 'task_updated') DEFAULT 'task_assigned',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Notifications table ready');
};

module.exports = { createTable };

