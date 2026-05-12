const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./db/database');
const habitsRouter = require('./routes/habits');
const tasksRouter = require('./routes/tasks');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Prevent caching on API routes so dashboard always gets fresh data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

app.use('/api/habits', habitsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`✨ Zenith is running at http://localhost:${PORT}`);
  });
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
