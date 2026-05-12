// ===== Auth Module =====
const Auth = {
  isLoggedIn() {
    return !!localStorage.getItem('zenith_token');
  },

  getUser() {
    const u = localStorage.getItem('zenith_user');
    return u ? JSON.parse(u) : null;
  },

  saveSession(token, user) {
    localStorage.setItem('zenith_token', token);
    localStorage.setItem('zenith_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('zenith_token');
    localStorage.removeItem('zenith_user');
    showAuthPage();
  },

  async handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';

    if (!username || !email || !password) {
      errorEl.textContent = 'All fields are required';
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (data.error) {
      errorEl.textContent = data.error;
      return;
    }

    Auth.saveSession(data.token, data.user);
    showToast(`Welcome to Zenith, ${data.user.username}! 🚀`, 'success');
    showAppPage();
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';

    if (!email || !password) {
      errorEl.textContent = 'Email and password are required';
      return;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.error) {
      errorEl.textContent = data.error;
      return;
    }

    Auth.saveSession(data.token, data.user);
    showToast(`Welcome back, ${data.user.username}! 👋`, 'success');
    showAppPage();
  }
};

function showAuthPage() {
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  renderAuthForm('login');
}

function showAppPage() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('sidebar').style.display = 'flex';
  document.getElementById('main-content').style.display = 'block';

  // Show username in sidebar
  const user = Auth.getUser();
  if (user) {
    document.getElementById('user-display-name').textContent = user.username;
    document.getElementById('user-display-email').textContent = user.email;
  }

  navigateTo('dashboard');
}

function renderAuthForm(mode) {
  const container = document.getElementById('auth-form-container');
  const isLogin = mode === 'login';

  container.innerHTML = `
    <form id="auth-form">
      ${!isLogin ? `<div class="form-group">
        <label class="form-label">Username</label>
        <input class="form-input auth-input" id="auth-username" type="text" placeholder="Choose a username" required>
      </div>` : ''}
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input auth-input" id="auth-email" type="email" placeholder="you@example.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input auth-input" id="auth-password" type="password" placeholder="${isLogin ? 'Enter your password' : 'Create a password (min 4 chars)'}" required>
      </div>
      <div id="auth-error" class="auth-error"></div>
      <button type="submit" class="btn btn-primary auth-btn">${isLogin ? 'Sign In' : 'Create Account'}</button>
    </form>
    <p class="auth-switch">
      ${isLogin ? "Don't have an account?" : 'Already have an account?'}
      <a href="#" id="auth-toggle">${isLogin ? 'Sign up' : 'Sign in'}</a>
    </p>
  `;

  document.getElementById('auth-form').addEventListener('submit', isLogin ? Auth.handleLogin : Auth.handleSignup);
  document.getElementById('auth-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    renderAuthForm(isLogin ? 'signup' : 'login');
  });

  // Update title
  document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Create Account';
  document.getElementById('auth-subtitle').textContent = isLogin
    ? 'Sign in to your productivity dashboard'
    : 'Start your productivity journey today';
}
