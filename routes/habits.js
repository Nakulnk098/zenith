const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');

// GET /api/habits
router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const userId = req.userId;
  const habits = all(`
    SELECT h.*,
      CASE WHEN hl.completed = 1 THEN 1 ELSE 0 END as completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ?
    WHERE h.user_id = ?
    ORDER BY h.created_at ASC
  `, [today, userId]);

  for (const habit of habits) {
    habit.streak = calculateStreak(habit.id);
    const r = get('SELECT COUNT(*) as c FROM habit_logs WHERE habit_id = ? AND completed = 1', [habit.id]);
    habit.total_completions = r ? r.c : 0;
  }
  res.json(habits);
});

// POST /api/habits
router.post('/', (req, res) => {
  const { name, icon, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = run('INSERT INTO habits (user_id, name, icon, color) VALUES (?, ?, ?, ?)',
    [req.userId, name, icon || '✨', color || '#6366f1']);
  let habit = get('SELECT * FROM habits WHERE id = ?', [id]);
  if (!habit) habit = get('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  if (habit) { habit.completed_today = 0; habit.streak = 0; habit.total_completions = 0; }
  res.status(201).json(habit || { id, name, icon: icon || '✨', color: color || '#6366f1', completed_today: 0, streak: 0, total_completions: 0 });
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res) => {
  const habit = get('SELECT id FROM habits WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.userId]);
  if (!habit) return res.status(404).json({ error: 'Not found' });
  run('DELETE FROM habit_logs WHERE habit_id = ?', [parseInt(req.params.id)]);
  run('DELETE FROM habits WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// POST /api/habits/:id/toggle
router.post('/:id/toggle', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const habitId = parseInt(req.params.id);
  const habit = get('SELECT id FROM habits WHERE id = ? AND user_id = ?', [habitId, req.userId]);
  if (!habit) return res.status(404).json({ error: 'Not found' });

  const existing = get('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?', [habitId, today]);
  if (existing) {
    run('DELETE FROM habit_logs WHERE id = ?', [existing.id]);
  } else {
    try { run('INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, 1)', [habitId, today]); } catch (e) {}
  }
  res.json({ completed: !existing, streak: calculateStreak(habitId) });
});

// GET /api/habits/:id/history
router.get('/:id/history', (req, res) => {
  const habit = get('SELECT id FROM habits WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.userId]);
  if (!habit) return res.status(404).json({ error: 'Not found' });

  const days = parseInt(req.query.days) || 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];
  const logs = all('SELECT date FROM habit_logs WHERE habit_id = ? AND date >= ? AND completed = 1', [parseInt(req.params.id), startStr]);
  const completedDates = new Set(logs.map(l => l.date));
  const history = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    history.push({ date: dateStr, completed: completedDates.has(dateStr) });
  }
  res.json(history);
});

function calculateStreak(habitId) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = get('SELECT completed FROM habit_logs WHERE habit_id = ? AND date = ?', [habitId, dateStr]);
    if (log && log.completed) { streak++; } else { if (i === 0) continue; break; }
  }
  return streak;
}

module.exports = router;
