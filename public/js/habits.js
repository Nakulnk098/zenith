// ===== Habits Module =====
const HABIT_EMOJIS = ['✨','🧘','📚','💪','💧','📝','🎯','🏃','🎨','💤','🥗','🧠'];
const HABIT_COLORS = ['#6366f1','#ec4899','#14b8a6','#3b82f6','#f59e0b','#ef4444','#22c55e','#8b5cf6'];

async function loadHabits() {
  const habits = await API.get('/api/habits');
  renderHabits(habits);
}

function renderHabits(habits) {
  const grid = document.getElementById('habits-grid');
  if (habits.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p class="empty-state-text">No habits yet. Create your first habit to start building streaks!</p></div>';
    return;
  }
  grid.innerHTML = habits.map(h => `
    <div class="habit-card ${h.completed_today ? 'completed' : ''}" data-id="${h.id}">
      <div class="habit-icon" style="background:${h.color}20">${h.icon}</div>
      <div class="habit-info">
        <div class="habit-name">${h.name}</div>
        <div class="habit-meta">
          <span class="habit-streak">🔥 ${h.streak}d streak</span>
          <span>${h.total_completions} total</span>
        </div>
      </div>
      <div class="habit-actions">
        <button class="habit-btn-heatmap" title="View history" onclick="event.stopPropagation();showHeatmap(${h.id},'${h.name}','${h.color}')">📊</button>
        <button class="habit-btn-delete" title="Delete" onclick="event.stopPropagation();deleteHabit(${h.id})">🗑</button>
      </div>
      <button class="habit-check ${h.completed_today ? 'checked' : ''}" onclick="event.stopPropagation();toggleHabit(${h.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  `).join('');
}

async function toggleHabit(id) {
  const result = await API.post(`/api/habits/${id}/toggle`);
  showToast(result.completed ? '✅ Habit completed!' : 'Habit unchecked', 'success');
  loadHabits();
}

async function deleteHabit(id) {
  if (!confirm('Delete this habit and all its history?')) return;
  await API.del(`/api/habits/${id}`);
  showToast('Habit deleted', 'success');
  document.getElementById('heatmap-section').style.display = 'none';
  loadHabits();
}

function showAddHabitModal() {
  let selectedEmoji = '✨';
  let selectedColor = '#6366f1';
  const html = `<form id="habit-form">
    <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="habit-name" placeholder="e.g. Morning Meditation" required></div>
    <div class="form-group"><label class="form-label">Icon</label><div class="emoji-picker" id="emoji-picker">
      ${HABIT_EMOJIS.map(e => `<button type="button" class="emoji-option ${e === selectedEmoji ? 'selected' : ''}" data-emoji="${e}">${e}</button>`).join('')}
    </div></div>
    <div class="form-group"><label class="form-label">Color</label><div class="color-picker" id="color-picker">
      ${HABIT_COLORS.map(c => `<div class="color-option ${c === selectedColor ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
    </div></div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Create Habit</button></div>
  </form>`;

  openModal('New Habit', html, async () => {
    const name = document.getElementById('habit-name').value.trim();
    if (!name) return;
    const ep = document.querySelector('.emoji-option.selected');
    const cp = document.querySelector('.color-option.selected');
    await API.post('/api/habits', { name, icon: ep?.dataset.emoji || '✨', color: cp?.dataset.color || '#6366f1' });
    closeModal();
    showToast('Habit created! 🎉', 'success');
    loadHabits();
  });

  document.getElementById('emoji-picker').addEventListener('click', e => {
    if (e.target.classList.contains('emoji-option')) {
      document.querySelectorAll('.emoji-option').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
  document.getElementById('color-picker').addEventListener('click', e => {
    if (e.target.classList.contains('color-option')) {
      document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
}

async function showHeatmap(habitId, name, color) {
  const section = document.getElementById('heatmap-section');
  section.style.display = 'block';
  document.getElementById('heatmap-title').textContent = `${name} — 90 Day History`;
  const history = await API.get(`/api/habits/${habitId}/history?days=90`);
  const container = document.getElementById('heatmap-container');
  container.innerHTML = history.map(d => {
    const opacity = d.completed ? 1 : 0.1;
    const bg = d.completed ? color : 'rgba(255,255,255,0.05)';
    return `<div class="heatmap-cell" style="background:${bg};opacity:${opacity}" title="${d.date}: ${d.completed ? 'Done ✓' : 'Missed'}"></div>`;
  }).join('');

  document.querySelectorAll('.heatmap-cell-legend').forEach(c => c.style.background = color);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
