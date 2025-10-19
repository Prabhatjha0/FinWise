// Inject a simple nav into pages (placeholder div with id=nav-placeholder)
// Apply theme class globally
const theme = localStorage.getItem('fw_theme') || 'light';
if(theme==='dark') document.body.classList.add('dark');

// Function to initialize and wire up the theme toggle button
function setupThemeToggle(){
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const currentTheme = localStorage.getItem('fw_theme') || 'light';
    // Set initial text
    themeToggle.textContent = currentTheme==='dark' ? 'Light' : 'Dark';

    // Wire up the click listener
    themeToggle.addEventListener('click', e=>{
      const t = document.body.classList.toggle('dark') ? 'dark' : 'light';
      localStorage.setItem('fw_theme', t);
      e.target.textContent = t==='dark' ? 'Light' : 'Dark';
    });
  }
}

const navHolder = document.getElementById('nav-placeholder');
const session = localStorage.getItem('fw_session');

const navHtml = `
  <header class="topbar">
    <div class="container topbar-inner">
      <div class="logo"><img src="assets/logo.svg" alt="FinWise" /><span class="brand">FinWise</span></div>
      <nav class="nav">
        <button class="nav-toggle btn" id="navToggle" aria-label="Toggle menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-items">
          <a href="index.html">Home</a>
          <a href="learning.html">Learning</a>
          <a href="tools.html">Tools</a>
          <a href="news.html">News</a>
          <a href="about.html">About</a>
          ${session?'<a href="dashboard.html">Dashboard</a>':''}
          ${session?'<button id="logoutBtn" class="btn">Logout</button>':'<a href="login.html" class="btn">Login</a>'}
          <button id="themeToggle" class="btn theme-toggle"></button>
        </div>
      </nav>
    </div>
  </header>
`;
if(navHolder) navHolder.innerHTML = navHtml;
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('fw_session'); location.href='index.html'; });

// Now calls the centralized function
setupThemeToggle();

// mobile nav toggle
const navToggle = document.getElementById('navToggle');
if(navToggle){
  navToggle.addEventListener('click', ()=>{
    const nav = navToggle.closest('.nav');
    if(nav) nav.classList.toggle('open');
  });
}