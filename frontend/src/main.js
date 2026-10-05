import './style.css';
import { login, register } from './api.js';

const app = document.querySelector('#app');
const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem('task-session') || 'null');
  } catch {
    sessionStorage.removeItem('task-session');
    return null;
  }
};

function renderWorkspace(session) {
  app.innerHTML = `
    <main class="auth-layout">
      <header class="masthead">
        <a class="wordmark" href="/" aria-label="Task Management System home">
          <span class="wordmark-mark" aria-hidden="true">T</span>
          <span>Task Management</span>
        </a>
        <button class="nav-action" id="sign-out" type="button">Sign out</button>
      </header>
      <section class="auth-card">
        <p class="eyebrow">YOU ARE SIGNED IN</p>
        <h1>Welcome, ${escapeHtml(session.user.username)}</h1>
        <p class="auth-copy">Your account is ready. Task management is coming next.</p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-04</span></footer>
    </main>
  `;
  document.querySelector('#sign-out').addEventListener('click', () => {
    sessionStorage.removeItem('task-session');
    renderAuth();
  });
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function renderAuth() {
  const session = readSession();
  if (session?.token && session.user?.id && session.user?.username) {
    renderWorkspace(session);
    return;
  }

  const isLogin = window.location.hash === '#login';
  const action = isLogin ? 'Sign in' : 'Create account';
  app.innerHTML = `
    <main class="auth-layout">
      <header class="masthead">
        <a class="wordmark" href="/" aria-label="Task Management System home">
          <span class="wordmark-mark" aria-hidden="true">T</span>
          <span>Task Management</span>
        </a>
        <a class="nav-action" href="#${isLogin ? 'register' : 'login'}">${isLogin ? 'Register' : 'Login'}</a>
      </header>
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="eyebrow">GET STARTED</p>
        <h1 id="auth-title">${isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p class="auth-copy">${isLogin ? 'Sign in to continue to your workspace.' : 'Register to organize your tasks in one place.'}</p>
        <form id="auth-form" class="auth-form">
          <label for="auth-username">Username</label>
          <input id="auth-username" name="username" autocomplete="username" minlength="1" maxlength="50" required />
          <label for="auth-password">Password</label>
          <input id="auth-password" name="password" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" minlength="6" required />
          <p class="form-message" id="form-message" role="alert" aria-live="polite"></p>
          <button class="primary-button" type="submit">${action}</button>
        </form>
        <p class="auth-switch">${isLogin ? 'New here?' : 'Already registered?'} <a href="#${isLogin ? 'register' : 'login'}">${isLogin ? 'Create account' : 'Sign in'}</a></p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-04</span></footer>
    </main>
  `;

  document.querySelector('#auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const message = document.querySelector('#form-message');
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    button.disabled = true;
    message.textContent = '';

    try {
      if (isLogin) {
        const result = await login(username, password);
        if (!result?.user?.id || !result?.token) throw new Error('Invalid login response.');
        const nextSession = { user: result.user, token: result.token };
        sessionStorage.setItem('task-session', JSON.stringify(nextSession));
        renderWorkspace(nextSession);
      } else {
        await register(username, password);
        window.location.hash = 'login';
        renderAuth();
        document.querySelector('#form-message').textContent = 'Registration successful. Please sign in.';
      }
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : 'Authentication failed.';
      button.disabled = false;
    }
  });
}

window.addEventListener('hashchange', renderAuth);
renderAuth();
