// ===== Main App Controller =====
document.addEventListener('DOMContentLoaded', () => {
  setRandomQuote();
  navigateTo('dashboard');

  // Nav click handlers
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.view);
    });
  });

  // Modal close handlers
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Heatmap close
  document.getElementById('btn-close-heatmap').addEventListener('click', () => {
    document.getElementById('heatmap-section').style.display = 'none';
  });

  // Add buttons
  document.getElementById('btn-add-habit').addEventListener('click', showAddHabitModal);
  document.getElementById('btn-add-task').addEventListener('click', showAddTaskModal);

  // Task filter handlers
  ['filter-status', 'filter-priority', 'filter-sort'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadTasks);
  });
});

function navigateTo(view) {
  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');

  // Show/hide views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');

  // Load data
  if (view === 'dashboard') loadDashboard();
  else if (view === 'habits') loadHabits();
  else if (view === 'tasks') loadTasks();
}
