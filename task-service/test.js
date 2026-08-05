require('dotenv').config();
const pool = require('./src/db');

pool.query('SELECT * FROM tasks ORDER BY created_at DESC')
  .then(([rows]) => {
    console.log('OK rows:', rows.length);
    process.exit(0);
  })
  .catch(err => {
    console.log('ERROR:', err.message);
    process.exit(1);
  });


