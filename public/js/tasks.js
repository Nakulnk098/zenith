// ===== Tasks Module =====
async function loadTasks() {
  const status = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;
  const sort = document.getElementById('filter-sort').value;
  const tasks = await API.get(`/api/tasks?status=${status}&priority=${priority}&sort=${sort}`);
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">No tasks match your filters. Create a new task to get started!</p></div>';
    return;
  }
  list.innerHTML = tasks.map(t => {
    const overdue = t.status !== 'completed' && isOverdue(t.due_date);
    const statusLabel = t.status === 'in_progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1);
    return `<div class="task-card ${t.status === 'completed' ? 'completed-task' : ''}">
      <div class="task-priority-indicator priority-${t.priority}"></div>
      <div class="task-content">
        <div class="task-title">${t.title}</div>
        ${t.description ? `<div class="task-desc">${t.description}</div>` : ''}
      </div>
      <div class="task-badges">
        <span class="badge badge-status-${t.status}">${statusLabel}</span>
        ${t.due_date ? `<span class="badge ${overdue ? 'badge-overdue' : 'badge-due'}">${overdue ? '⚠ ' : ''}${formatDate(t.due_date)}</span>` : ''}
      </div>
      <div class="task-actions">
        ${t.status !== 'completed' ? `<button class="task-btn task-btn-complete" title="Complete" onclick="completeTask(${t.id})">✓</button>` : ''}
        <button class="task-btn task-btn-edit" title="Edit" onclick="showEditTaskModal(${t.id})">✎</button>
        <button class="task-btn task-btn-delete" title="Delete" onclick="deleteTask(${t.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

async function completeTask(id) {
  await API.put(`/api/tasks/${id}`, { status: 'completed' });
  showToast('Task completed! 🎉', 'success');
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await API.del(`/api/tasks/${id}`);
  showToast('Task deleted', 'success');
  loadTasks();
}

function showAddTaskModal() {
  const today = new Date().toISOString().split('T')[0];
  const html = `<form id="task-form">
    <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="task-title" placeholder="What needs to be done?" required></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="task-desc" placeholder="Optional details..."></textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="task-priority">
        <option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option>
      </select></div>
      <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="task-due" min="${today}"></div>
    </div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Create Task</button></div>
  </form>`;

  openModal('New Task', html, async () => {
    const title = document.getElementById('task-title').value.trim();
    if (!title) return;
    await API.post('/api/tasks', {
      title,
      description: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      due_date: document.getElementById('task-due').value || null,
    });
    closeModal();
    showToast('Task created!', 'success');
    loadTasks();
  });
}

async function showEditTaskModal(id) {
  const tasks = await API.get('/api/tasks');
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const html = `<form id="task-form">
    <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="task-title" value="${t.title}" required></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="task-desc">${t.description || ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="task-priority">
        <option value="low" ${t.priority==='low'?'selected':''}>Low</option><option value="medium" ${t.priority==='medium'?'selected':''}>Medium</option>
        <option value="high" ${t.priority==='high'?'selected':''}>High</option><option value="critical" ${t.priority==='critical'?'selected':''}>Critical</option>
      </select></div>
      <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="task-status">
        <option value="pending" ${t.status==='pending'?'selected':''}>Pending</option><option value="in_progress" ${t.status==='in_progress'?'selected':''}>In Progress</option>
        <option value="completed" ${t.status==='completed'?'selected':''}>Completed</option>
      </select></div>
    </div>
    <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="task-due" value="${t.due_date || ''}"></div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save Changes</button></div>
  </form>`;

  openModal('Edit Task', html, async () => {
    await API.put(`/api/tasks/${id}`, {
      title: document.getElementById('task-title').value.trim(),
      description: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      status: document.getElementById('task-status').value,
      due_date: document.getElementById('task-due').value || null,
    });
    closeModal();
    showToast('Task updated!', 'success');
    loadTasks();
  });
}
