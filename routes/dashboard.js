const express = require('express');
const router = express.Router();
const { all, get } = require('../db/database');

router.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const totalHabits = get('SELECT COUNT(*) as c FROM habits').c;
  const habitsCompletedToday = get('SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND completed = 1', [today]).c;
  const totalTasks = get('SELECT COUNT(*) as c FROM tasks').c;
  const completedTasks = get("SELECT COUNT(*) as c FROM tasks WHERE status = 'completed'").c;
  const pendingTasks = get("SELECT COUNT(*) as c FROM tasks WHERE status = 'pending'").c;
  const inProgressTasks = get("SELECT COUNT(*) as c FROM tasks WHERE status = 'in_progress'").c;

  const priorityBreakdown = {
    critical: get("SELECT COUNT(*) as c FROM tasks WHERE priority = 'critical' AND status != 'completed'").c,
    high: get("SELECT COUNT(*) as c FROM tasks WHERE priority = 'high' AND status != 'completed'").c,
    medium: get("SELECT COUNT(*) as c FROM tasks WHERE priority = 'medium' AND status != 'completed'").c,
    low: get("SELECT COUNT(*) as c FROM tasks WHERE priority = 'low' AND status != 'completed'").c,
  };

  const weeklyHabitData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const completed = get('SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND completed = 1', [dateStr]).c;
    weeklyHabitData.push({ date: dateStr, day: dayName, completed, total: totalHabits });
  }

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyStr = thirtyDaysAgo.toISOString().split('T')[0];
  const totalPossible30 = totalHabits * 30;
  const totalCompleted30 = get('SELECT COUNT(*) as c FROM habit_logs WHERE date >= ? AND completed = 1', [thirtyStr]).c;
  const habitCompletionRate = totalPossible30 > 0 ? Math.round((totalCompleted30 / totalPossible30) * 100) : 0;

  let bestStreak = 0;
  const habits = all('SELECT id FROM habits');
  for (const habit of habits) {
    const streak = calcStreak(habit.id);
    if (streak > bestStreak) bestStreak = streak;
  }

  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const productivityScore = Math.round((habitCompletionRate * 0.6 + taskCompletionRate * 0.4));

  res.json({
    habits: { total: totalHabits, completedToday: habitsCompletedToday, completionRate: habitCompletionRate, bestStreak, weeklyData: weeklyHabitData },
    tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, inProgress: inProgressTasks, priorityBreakdown, completionRate: Math.round(taskCompletionRate) },
    productivityScore,
  });
});

function calcStreak(habitId) {
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
