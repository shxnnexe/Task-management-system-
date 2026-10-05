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
        <nav class="workspace-nav" aria-label="Workspace navigation">
          <a href="#tasks">Tasks</a>
          <button class="nav-action" id="sign-out" type="button">Sign out</button>
        </nav>
      </header>
      <section class="auth-card">
        <p class="eyebrow">YOU ARE SIGNED IN</p>
        <h1>Welcome, ${escapeHtml(session.user.username)}</h1>
        <p class="auth-copy">Your account is ready. Open Tasks to add work to your workspace.</p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-04</span></footer>
    </main>
  `;
  document.querySelector('#sign-out').addEventListener('click', signOut);
}

function signOut() {
  sessionStorage.removeItem('task-session');
  window.location.hash = '';
  renderAuth();
}

function renderTasks(session) {
  app.innerHTML = `
    <main class="auth-layout">
      <header class="masthead">
        <a class="wordmark" href="/" aria-label="Task Management System home">
          <span class="wordmark-mark" aria-hidden="true">T</span>
          <span>Task Management</span>
        </a>
        <nav class="workspace-nav" aria-label="Workspace navigation">
          <a href="#tasks" aria-current="page">Tasks</a>
          <button class="nav-action" id="sign-out" type="button">Sign out</button>
        </nav>
      </header>
      <section class="auth-card task-card">
        <p class="eyebrow">YOUR WORKSPACE</p>
        <h1>Tasks</h1>
        <p class="auth-copy">Create a task and assign it to one of your projects.</p>
        <form id="task-form" class="auth-form">
          <label for="task-title">Task title</label>
          <input id="task-title" name="title" maxlength="200" required />
          <label for="task-description">Description <span class="optional">(optional)</span></label>
          <textarea id="task-description" name="description" maxlength="5000" rows="3"></textarea>
          <label for="task-project">Project ID</label>
          <input id="task-project" name="projectId" required />
          <p class="form-message" id="task-message" role="status" aria-live="polite"></p>
          <button class="primary-button" type="submit">Create task</button>
        </form>
        <p class="auth-copy">Signed in as ${escapeHtml(session.user.username)}.</p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-05</span></footer>
    </main>
  `;
  document.querySelector('#sign-out').addEventListener('click', signOut);
  document.querySelector('#task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#task-message').textContent = 'Task API is not connected yet.';
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
    if (window.location.hash === '#tasks') renderTasks(session);
    else renderWorkspace(session);
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
