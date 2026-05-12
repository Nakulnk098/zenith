const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'zenith.db');
let db = null;

async function getDB() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a statement that modifies data, returns lastInsertRowid
function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result.length > 0 ? result[0].values[0][0] : 0;
}

// Helper: get all rows as objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Helper: get one row as object
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

async function initDB() {
  await getDB();

  db.run(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '✨',
    color TEXT DEFAULT '#6366f1',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER DEFAULT 1,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  )`);

  // Seed habits if empty
  const hCount = get('SELECT COUNT(*) as c FROM habits');
  if (hCount.c === 0) {
    const habits = [
      ['Morning Meditation', '🧘', '#6366f1'],
      ['Read 30 Minutes', '📚', '#ec4899'],
      ['Exercise', '💪', '#14b8a6'],
      ['Drink 8 Glasses of Water', '💧', '#3b82f6'],
      ['Journal', '📝', '#f59e0b'],
    ];
    for (const [name, icon, color] of habits) {
      db.run('INSERT INTO habits (name, icon, color) VALUES (?, ?, ?)', [name, icon, color]);
      const idResult = db.exec('SELECT last_insert_rowid() as id');
      const id = idResult[0].values[0][0];
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (Math.random() < 0.7) {
          db.run('INSERT OR IGNORE INTO habit_logs (habit_id, date, completed) VALUES (?, ?, 1)', [id, dateStr]);
        }
      }
    }
  }

  // Seed tasks if empty
  const tCount = get('SELECT COUNT(*) as c FROM tasks');
  if (tCount.c === 0) {
    const tasks = [
      ['Design new landing page', 'Create wireframes and mockups for the product landing page', 'high', 'in_progress', daysFromNow(2)],
      ['Fix authentication bug', 'Users report intermittent login failures on mobile', 'critical', 'pending', daysFromNow(1)],
      ['Write API documentation', 'Document all REST endpoints with examples', 'medium', 'pending', daysFromNow(5)],
      ['Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing', 'high', 'pending', daysFromNow(3)],
      ['Code review: PR #142', 'Review the database migration pull request', 'medium', 'completed', daysFromNow(-1)],
      ['Update dependencies', 'Run npm audit and update vulnerable packages', 'low', 'pending', daysFromNow(7)],
      ['Team standup notes', 'Prepare notes for tomorrow\'s standup', 'low', 'completed', daysFromNow(0)],
      ['Optimize database queries', 'Profile slow queries and add proper indexes', 'high', 'in_progress', daysFromNow(4)],
    ];
    for (const [title, desc, priority, status, due] of tasks) {
      run('INSERT INTO tasks (title, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?)', [title, desc, priority, status, due]);
    }
  }

  saveDB();
  console.log('📦 Database initialized');
}

module.exports = { getDB, initDB, run, all, get, saveDB };
