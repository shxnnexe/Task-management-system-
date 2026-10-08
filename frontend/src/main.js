import './style.css';

document.querySelector('#app').innerHTML = `
  <main class="launch-screen">
    <header class="masthead">
      <a class="wordmark" href="/" aria-label="Task Management System home">
        <span class="wordmark-mark" aria-hidden="true">T</span>
        <span>Task Management</span>
      </a>
      <span class="build-label"><span class="status-dot"></span> Frontend workspace</span>
    </header>
    <section class="welcome" aria-labelledby="welcome-title">
      <p class="eyebrow">A clear place to begin</p>
      <h1 id="welcome-title">Make room for<br /><em>what matters.</em></h1>
      <p class="welcome-copy">Your task workspace is ready to take shape.</p>
      <div class="welcome-rule" aria-hidden="true"><span></span></div>
      <p class="ticket-note">Project foundation <span>·</span> FE1-01</p>
    </section>
    <footer class="page-footer">Task Management System <span>Frontend</span></footer>
  </main>
`;