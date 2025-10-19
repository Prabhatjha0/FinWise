// scripts/nav.js
// FINAL ROBUST VERSION
// This version waits for the DOM to be fully loaded before
// attaching event listeners, which fixes the race condition on dashboard.html.

// --- 1. Apply theme on initial load ---
// This runs immediately and is safe.
const currentTheme = localStorage.getItem('fw_theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark');
}

// --- 2. Generate Navbar HTML ---
// This also runs immediately.
const navHolder = document.getElementById('nav-placeholder');
const session = localStorage.getItem('fw_session');

const navHtml = `
  <header class="topbar">
    <div class="container topbar-inner">
      <div class="logo">
        <a href="index.html" class="logo-link">
          <img src="assets/logo.png" alt="FinWise Logo" class="logo-img">
        </a>
      </div>
      <nav class="nav">
        <button class="nav-toggle btn" id="navToggle" aria-label="Toggle menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-items">
          <a href="index.html">Home</a>
          <a href="learning.html">Learning</a>
          <a href="tools.html">Tools</a>
          <a href="news.html">News</a>
          <a href="about.html">About</a>
          ${session ? '<a href="dashboard.html">Dashboard</a>' : ''}
          ${session ? '<button id="logoutBtn" class="btn">Logout</button>' : '<a href="login.html" class="btn">Login</a>'}
          <button id="themeToggle" class="btn theme-toggle"></button>
        </div>
      </nav>
    </div>
  </header>
`;

// Inject the HTML into the placeholder div
if (navHolder) {
    navHolder.innerHTML = navHtml;
}

// --- 3. Setup Button Logic AFTER the page is loaded ---
// This is the key fix. We wait for the 'DOMContentLoaded' event.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Set initial text based on the <body> tag
        themeToggle.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';

        // Add click listener
        themeToggle.addEventListener('click', e => {
            const isDark = document.body.classList.toggle('dark');
            const theme = isDark ? 'dark' : 'light';
            localStorage.setItem('fw_theme', theme);
            e.target.textContent = isDark ? 'Light' : 'Dark';
        });
    }

    // --- Logout Button Logic ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.DUMMY_API) {
                DUMMY_API.logout(); // Use API logout
            } else {
                localStorage.removeItem('fw_session'); // Fallback
            }
            location.href = 'index.html';
        });
    }

    // --- Mobile Nav Toggle Logic ---
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const nav = navToggle.closest('.nav');
            if (nav) nav.classList.toggle('open');
        });
    }
});