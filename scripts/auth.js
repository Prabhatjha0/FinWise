// auth.js — handles signup and login (client-side demo)
document.addEventListener('DOMContentLoaded', ()=>{
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const id = document.getElementById('loginEmailOrId').value.trim().toLowerCase();
      const pass = document.getElementById('loginPass').value;
      if(DUMMY_API.login(id, pass)){
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
      if(DUMMY_API.signup(name, id, email, pass)){
        location.href = 'dashboard.html';
      }
    });
  }
});