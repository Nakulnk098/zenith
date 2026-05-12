const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');

// GET /api/tasks
router.get('/', (req, res) => {
  const { status, priority, sort } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.userId];

  if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
  if (priority && priority !== 'all') { query += ' AND priority = ?'; params.push(priority); }

  const sortMap = {
    'newest': 'created_at DESC',
    'oldest': 'created_at ASC',
    'due_date': "CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC",
    'priority': "CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END",
  };
  query += ` ORDER BY ${sortMap[sort] || sortMap['priority']}`;
  res.json(all(query, params));
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, description, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const id = run('INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
    [req.userId, title, description || '', priority || 'medium', due_date || null]);
  let task = get('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!task) task = get('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const existing = get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.userId]);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  const { title, description, priority, status, due_date } = req.body;
  const newStatus = status || existing.status;
  const completedAt = newStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString() : (newStatus !== 'completed' ? null : existing.completed_at);

  run(`UPDATE tasks SET title=?, description=?, priority=?, status=?, due_date=?, completed_at=? WHERE id=?`, [
    title || existing.title,
    description !== undefined ? description : existing.description,
    priority || existing.priority,
    newStatus,
    due_date !== undefined ? due_date : existing.due_date,
    completedAt,
    parseInt(req.params.id)
  ]);
  res.json(get('SELECT * FROM tasks WHERE id = ?', [parseInt(req.params.id)]));
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const existing = get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.userId]);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  run('DELETE FROM tasks WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
