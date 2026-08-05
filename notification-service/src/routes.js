const express = require('express');
const pool = require('./db');
const { verifyToken } = require('./middleware');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Notification Service is running' });
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { user_id, message, type } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ error: 'user_id and message are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [user_id, message, type || 'task_assigned']
    );
    res.status(201).json({ message: 'Notification created', notificationId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }

});

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'notification not found' });
    }

    await pool.query('UPDATE notification SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/read/all', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.userId]
    );
    res.json({ message: 'All notifications makred as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'notification not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

