// ===== Dashboard Module =====
let _animIntervals = {};

async function loadDashboard() {
  const stats = await API.get('/api/dashboard/stats');
  
  // Update greeting
  document.getElementById('greeting').textContent = getGreeting();
  document.getElementById('date-display').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Update stat values — clear any running animations first
  animateValue('stat-score', stats.productivityScore, '%');
  document.getElementById('stat-habits-val').textContent = `${stats.habits.completedToday}/${stats.habits.total}`;
  document.getElementById('stat-streak-val').textContent = `${stats.habits.bestStreak}d`;
  document.getElementById('stat-tasks-val').textContent = `${stats.tasks.completed}/${stats.tasks.total}`;

  drawWeeklyChart(stats.habits.weeklyData, stats.habits.total);
  drawDonutChart(stats.tasks);
  drawPriorityBars(stats.tasks.priorityBreakdown);
}

function animateValue(id, target, suffix = '') {
  // Clear any existing animation for this element
  if (_animIntervals[id]) clearInterval(_animIntervals[id]);

  const el = document.getElementById(id);
  if (target === 0) { el.textContent = '0' + suffix; return; }

  let current = 0;
  const step = Math.max(1, Math.floor(target / 25));
  _animIntervals[id] = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(_animIntervals[id]);
      delete _animIntervals[id];
    }
    el.textContent = current + suffix;
  }, 30);
}

function drawWeeklyChart(data, totalHabits) {
  const canvas = document.getElementById('weekly-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth;
  const H = 220;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  const pad = { top: 10, right: 20, bottom: 35, left: 35 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(totalHabits, ...data.map(d => d.completed), 1);

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
  }

  // Bars
  const barW = Math.min(40, chartW / data.length - 12);
  const gap = (chartW - barW * data.length) / (data.length + 1);
  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  gradient.addColorStop(0, '#818cf8');
  gradient.addColorStop(1, '#6366f1');

  data.forEach((d, i) => {
    const x = pad.left + gap + i * (barW + gap);
    const barH = maxVal > 0 ? (d.completed / maxVal) * chartH : 0;
    const y = pad.top + chartH - barH;

    // Bar with rounded top
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const r = Math.min(6, barW / 2);
    ctx.moveTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.arcTo(x + barW, y, x + barW, y + r, r);
    ctx.lineTo(x + barW, pad.top + chartH);
    ctx.lineTo(x, pad.top + chartH);
    ctx.closePath();
    ctx.fill();

    // Glow
    ctx.shadowColor = 'rgba(99,102,241,0.3)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Day label
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.day, x + barW / 2, H - 8);

    // Value on top
    if (d.completed > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter';
      ctx.fillText(d.completed, x + barW / 2, y - 6);
    }
  });

  // Y-axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Inter';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * (4 - i));
    const y = pad.top + (chartH / 4) * i;
    ctx.fillText(val, pad.left - 8, y + 4);
  }
}

let _donutAnimId = null;

function drawDonutChart(tasks) {
  // Cancel any previous donut animation
  if (_donutAnimId) cancelAnimationFrame(_donutAnimId);

  const canvas = document.getElementById('donut-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = 220;
  const H = 220;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  const cx = W / 2, cy = H / 2, radius = Math.min(W, H) / 2 - 10, thickness = 24;

  const segments = [
    { label: 'Completed', value: tasks.completed, color: '#22c55e' },
    { label: 'In Progress', value: tasks.inProgress, color: '#3b82f6' },
    { label: 'Pending', value: tasks.pending, color: '#f59e0b' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  // Animate drawing
  let progress = 0;
  function draw() {
    progress = Math.min(progress + 0.04, 1);
    ctx.clearRect(0, 0, W * dpr, H * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = thickness;
    ctx.stroke();

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      if (seg.value === 0) return;
      const angle = (seg.value / total) * Math.PI * 2 * progress;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += angle;
    });

    ctx.restore();
    if (progress < 1) {
      _donutAnimId = requestAnimationFrame(draw);
    } else {
      _donutAnimId = null;
    }
  }
  draw();

  // Center text
  const pct = Math.round((tasks.completed / total) * 100);
  document.querySelector('.donut-value').textContent = pct + '%';

  // Legend
  const legend = document.getElementById('donut-legend');
  legend.innerHTML = segments.map(s =>
    `<div class="legend-item"><div class="legend-dot" style="background:${s.color}"></div>${s.label}: ${s.value}</div>`
  ).join('');
}

function drawPriorityBars(breakdown) {
  const container = document.getElementById('priority-bars');
  const maxVal = Math.max(breakdown.critical, breakdown.high, breakdown.medium, breakdown.low, 1);
  const items = [
    { label: 'Critical', count: breakdown.critical, color: '#ef4444' },
    { label: 'High', count: breakdown.high, color: '#f59e0b' },
    { label: 'Medium', count: breakdown.medium, color: '#3b82f6' },
    { label: 'Low', count: breakdown.low, color: '#14b8a6' },
  ];

  container.innerHTML = items.map(item => {
    const pct = (item.count / maxVal) * 100;
    return `<div class="priority-bar-row">
      <span class="priority-bar-label" style="color:${item.color}">${item.label}</span>
      <div class="priority-bar-track">
        <div class="priority-bar-fill" style="width:${pct}%;background:${item.color}20;color:${item.color}">
          ${item.count > 0 ? item.count : ''}
        </div>
      </div>
      <span class="priority-bar-count">${item.count}</span>
    </div>`;
  }).join('');

  // Animate bars in
  setTimeout(() => {
    container.querySelectorAll('.priority-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = w; });
    });
  }, 50);
}
