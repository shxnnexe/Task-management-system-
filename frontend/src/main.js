import './style.css';

const app = document.querySelector('#app');

function renderRegistration() {
  app.innerHTML = `
    <main class="auth-layout">
      <header class="masthead">
        <a class="wordmark" href="/" aria-label="Task Management System home">
          <span class="wordmark-mark" aria-hidden="true">T</span>
          <span>Task Management</span>
        </a>
        <a class="nav-action" href="#login">Login</a>
      </header>
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="eyebrow">GET STARTED</p>
        <h1 id="auth-title">Create account</h1>
        <p class="auth-copy">Register to organize your tasks in one place.</p>
        <form id="register-form" class="auth-form">
          <label for="register-username">Username</label>
          <input id="register-username" name="username" autocomplete="username" minlength="1" maxlength="50" required />
          <label for="register-password">Password</label>
          <input id="register-password" name="password" type="password" autocomplete="new-password" minlength="6" required />
          <p class="form-message" id="form-message" aria-live="polite"></p>
          <button class="primary-button" type="submit">Create account</button>
        </form>
        <p class="auth-switch">Already registered? <a href="#login">Sign in</a></p>
      </section>
      <footer class="page-footer">Task Management System <span>FE1-02</span></footer>
    </main>
  `;

  document.querySelector('#register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#form-message').textContent = 'Registration API is not connected yet.';
  });
}

window.addEventListener('hashchange', renderRegistration);
renderRegistration();