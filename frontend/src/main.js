import './style.css';

const app = document.querySelector('#app');

function renderAuth() {
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
          <p class="form-message" id="form-message" aria-live="polite"></p>
          <button class="primary-button" type="submit">${action}</button>
        </form>
        <p class="auth-switch">${isLogin ? 'New here?' : 'Already registered?'} <a href="#${isLogin ? 'register' : 'login'}">${isLogin ? 'Create account' : 'Sign in'}</a></p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-03</span></footer>
    </main>
  `;

  document.querySelector('#auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#form-message').textContent = `${action} API is not connected yet.`;
  });
}

window.addEventListener('hashchange', renderAuth);
renderAuth();
