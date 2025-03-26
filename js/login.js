// js/login.js
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const admissionNumber = document.getElementById('admissionNumber').value.trim();
  const errorElement = document.getElementById('error');
  
  // Check if user exists
  const user = users.find(u => 
      u.name.toLowerCase() === name.toLowerCase() && 
      u.admissionNumber === admissionNumber
  );
  
  if (user) {
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Redirect to features page
      window.location.href = 'features.html';
  } else {
      errorElement.textContent = 'Invalid name or admission number';
  }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
      window.location.href = 'features.html';
  }
});