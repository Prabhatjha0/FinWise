// auth.js — handles signup and login (client-side demo)
document.addEventListener('DOMContentLoaded', ()=>{
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const id = document.getElementById('loginEmailOrId').value.trim().toLowerCase();
      const pass = document.getElementById('loginPass').value;
      const users = JSON.parse(localStorage.getItem('fw_users')||'{}');
      if(users[id] && users[id].pass===pass){
        localStorage.setItem('fw_session', id);
        location.href = 'dashboard.html';
      } else {
        alert('Invalid credentials or user not found.');
      }
    });
  }

  const signupForm = document.getElementById('signupForm');
  if(signupForm){
    signupForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const id = document.getElementById('userId').value.trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const pass = document.getElementById('pass').value;
      const users = JSON.parse(localStorage.getItem('fw_users')||'{}');
      if(users[id]){ alert('User ID already exists. Please login.'); return; }
      users[id] = {name,email,pass,created:new Date().toISOString()};
      localStorage.setItem('fw_users', JSON.stringify(users));
      localStorage.setItem('fw_session', id);
      location.href = 'dashboard.html';
    });
  }
});