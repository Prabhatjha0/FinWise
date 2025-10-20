// scripts/nav.js
// FINAL ROBUST VERSION
// UPDATED with OS Preference, Accent Color Themes, and new TOGGLE for accent picker.

// --- 1. Apply theme on initial load ---
// This runs immediately and is safe.

// --- Get Light/Dark Theme ---
const getInitialTheme = () => {
  const storedTheme = localStorage.getItem('fw_theme');
  if (storedTheme) return storedTheme;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}
const currentTheme = getInitialTheme();
if (currentTheme === 'dark') {
    document.body.classList.add('dark');
}

// --- Get Accent Theme ---
const currentAccent = localStorage.getItem('fw_accent') || 'theme-default';
if (currentAccent !== 'theme-default') {
  document.body.classList.add(currentAccent);
}

// --- 2. Generate Navbar HTML (with new theme picker toggle) ---
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

          <div class="theme-picker-wrapper" id="themePickerWrapper">
            <button class="btn theme-toggle-btn" id="themePickerToggle" aria-label="Choose accent color">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l.1.08C16.14 6.48 18 9.4 18 12.5a6 6 0 0 1-12 0c0-3.1 1.86-6.02 5.9-9.73l.1-.08zM12 15a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
            </button>
            <div class="theme-picker" id="themePicker">
              <button class="color-swatch" id="swatch-default" data-theme="theme-default" aria-label="Default Teal Theme"></button>
              <button class="color-swatch" id="swatch-blue" data-theme="theme-blue" aria-label="Blue Theme"></button>
              <button class="color-swatch" id="swatch-green" data-theme="theme-green" aria-label="Green Theme"></button>
              <button class="color-swatch" id="swatch-orange" data-theme="theme-orange" aria-label="Orange Theme"></button>
            </div>
          </div>

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
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic (Light/Dark) ---
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
        themeToggle.addEventListener('click', e => {
            const isDark = document.body.classList.toggle('dark');
            const theme = isDark ? 'dark' : 'light';
            localStorage.setItem('fw_theme', theme);
            e.target.textContent = isDark ? 'Light' : 'Dark';
        });
    }

    // --- NEW: Accent Picker TOGGLE Logic ---
    const themePickerWrapper = document.getElementById('themePickerWrapper');
    const themePickerToggle = document.getElementById('themePickerToggle');
    if (themePickerToggle && themePickerWrapper) {
      themePickerToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from bubbling to 'document'
        themePickerWrapper.classList.toggle('open');
      });

      // Optional: Close when clicking outside
      document.addEventListener('click', (e) => {
        if (themePickerWrapper.classList.contains('open') && !themePickerWrapper.contains(e.target)) {
          themePickerWrapper.classList.remove('open');
        }
      });
    }

    // --- Accent Theme SWATCH Logic ---
    const themePicker = document.getElementById('themePicker');
    if (themePicker) {
      const swatches = themePicker.querySelectorAll('.color-swatch');
      
      // 1. Set the currently active swatch
      const activeSwatch = document.querySelector(`[data-theme="${currentAccent}"]`);
      if (activeSwatch) {
        activeSwatch.classList.add('active');
      }

      // 2. Add click listeners to all swatches
      swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          const newTheme = swatch.dataset.theme;
          swatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          localStorage.setItem('fw_accent', newTheme);
          
          document.body.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-default');
          if (newTheme !== 'theme-default') {
            document.body.classList.add(newTheme);
          }
          // Close the picker after selection
          themePickerWrapper.classList.remove('open');
        });
      });
    }

    // --- Logout Button Logic ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.DUMMY_API) {
                DUMMY_API.logout();
            } else {
                localStorage.removeItem('fw_session');
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