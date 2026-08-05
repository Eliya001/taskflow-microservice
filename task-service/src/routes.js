const express = require('express');
const pool = require('./db');
const { verifyToken } = require('./middleware');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Task Service is running' });
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, priority, assigned_to, assigned_name, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, priority, assigned_to, assigned_name, created_by, created_by_name, due_date)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, priority || 'medium', assigned_to || null, assigned_name || null, req.user.userId, req.user.name, due_date || null]
);



    res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('TASKS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }

});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status (500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, assigned_name, due_date } = req.body;
    const cleanDate = due_date ? due_date.substring(0, 10) : null;

    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query(
      `UPDATE tasks SET title=?, description=?, status=?, priority=?,
       assigned_to=?, assigned_name=?, due_date=? WHERE id=?`,
      [title, description, status, priority, assigned_to, assigned_name, cleanDate, req.params.id]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

