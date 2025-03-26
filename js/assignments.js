// js/assignments.js
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
      window.location.href = '../login.html';
      return;
  }
  
  const user = JSON.parse(currentUser);
  const isAdmin = user.isAdmin;
  
  // Back button functionality
  const backButtons = document.querySelectorAll('.back-btn');
  backButtons.forEach(btn => {
      btn.addEventListener('click', function() {
          if (window.location.pathname.includes('calculus-assignments.html') || 
              window.location.pathname.includes('philosophy-assignments.html')) {
              window.location.href = 'assignments.html';
          } else {
              window.location.href = '../features.html';
          }
      });
  });
  
  // Initialize Firebase (you'll need to add your config)
  const firebaseConfig = {
      apiKey: "AIzaSyDm_zKtFcQLqLXvUBwz8ydavf-f10rgI6E",
      authDomain: "strath-assignments.firebaseapp.com",
      projectId: "strath-assignments",
      storageBucket: "strath-assignments.appspot.com",
      messagingSenderId: "1008534071944",
      appId: "1:1008534071944:web:b3d94f8564951c52440d3d",
      measurementId: "G-2BHV20YL1C"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // Get current unit from URL
  let currentUnit = '';
  if (window.location.pathname.includes('calculus-assignments.html')) {
      currentUnit = 'calculus';
  } else if (window.location.pathname.includes('philosophy-assignments.html')) {
      currentUnit = 'philosophy';
  }
  
  // Load assignments for specific unit page
  if (currentUnit) {
      loadAssignments(currentUnit);
      setupAdminControls(isAdmin);
  } else {
      // On main assignments page, load counts for badges
      updateAssignmentBadges();
  }
});

function loadAssignments(unit) {
  const assignmentsList = document.getElementById('assignmentsList');
  const db = firebase.database();
  const assignmentsRef = db.ref(`assignments/${unit}`);
  
  assignmentsRef.on('value', (snapshot) => {
      assignmentsList.innerHTML = '';
      const assignments = snapshot.val() || {};
      let overdueCount = 0;
      
      Object.entries(assignments).forEach(([id, assignment]) => {
          const assignmentElement = createAssignmentElement(id, assignment, unit);
          assignmentsList.appendChild(assignmentElement);
          
          // Check if assignment is overdue
          if (new Date(assignment.deadline) < new Date() && !assignment.completed) {
              overdueCount++;
          }
      });
      
      // Update badge on main assignments page
      if (unit === 'calculus') {
          updateBadge('calculusBadge', overdueCount);
      } else if (unit === 'philosophy') {
          updateBadge('philosophyBadge', overdueCount);
      }
  });
}

function createAssignmentElement(id, assignment, unit) {
  const assignmentElement = document.createElement('div');
  assignmentElement.className = 'assignment';
  
  const deadlineDate = new Date(assignment.deadline);
  const now = new Date();
  const timeLeft = deadlineDate - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  let statusText = '';
  if (assignment.completed) {
      statusText = 'Completed';
  } else if (timeLeft <= 0) {
      statusText = 'Overdue';
  } else {
      statusText = `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
  }
  
  assignmentElement.innerHTML = `
      <h3>${assignment.title}</h3>
      <p>${assignment.description}</p>
      <p class="deadline">Deadline: ${deadlineDate.toLocaleString()}</p>
      <p>Status: ${statusText}</p>
      ${assignment.fileUrl ? `<p><a href="${assignment.fileUrl}" target="_blank">Download File</a></p>` : ''}
      <div class="actions">
          <button class="complete-btn" data-id="${id}" data-unit="${unit}">Mark as Done</button>
          <div class="admin-actions">
              <button class="edit-btn" data-id="${id}" data-unit="${unit}">Edit</button>
              <button class="delete-btn" data-id="${id}" data-unit="${unit}">Delete</button>
          </div>
      </div>
  `;
  
  // Add event listeners
  const completeBtn = assignmentElement.querySelector('.complete-btn');
  completeBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to mark this assignment as completed?')) {
          markAssignmentComplete(unit, id);
      }
  });
  
  const editBtn = assignmentElement.querySelector('.edit-btn');
  if (editBtn) {
      editBtn.addEventListener('click', function() {
          editAssignment(unit, id, assignment);
      });
  }
  
  const deleteBtn = assignmentElement.querySelector('.delete-btn');
  if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to delete this assignment?')) {
              deleteAssignment(unit, id);
          }
      });
  }
  
  return assignmentElement;
}

function setupAdminControls(isAdmin) {
  const adminControls = document.getElementById('adminControls');
  const adminActions = document.querySelectorAll('.admin-actions');
  
  if (isAdmin) {
      adminControls.style.display = 'block';
      adminActions.forEach(action => {
          action.style.display = 'block';
      });
      
      // Add assignment form functionality
      const addBtn = document.getElementById('addAssignmentBtn');
      const form = document.getElementById('assignmentForm');
      const saveBtn = document.getElementById('saveAssignment');
      const cancelBtn = document.getElementById('cancelAssignment');
      
      let currentAssignmentId = null;
      
      addBtn.addEventListener('click', function() {
          currentAssignmentId = null;
          form.style.display = 'block';
          document.getElementById('assignmentTitle').value = '';
          document.getElementById('assignmentDesc').value = '';
          document.getElementById('assignmentDeadline').value = '';
          document.getElementById('assignmentFile').value = '';
      });
      
      saveBtn.addEventListener('click', function() {
          const title = document.getElementById('assignmentTitle').value;
          const description = document.getElementById('assignmentDesc').value;
          const deadline = document.getElementById('assignmentDeadline').value;
          const file = document.getElementById('assignmentFile').files[0];
          
          if (!title || !description || !deadline) {
              alert('Please fill all required fields');
              return;
          }
          
          const unit = window.location.pathname.includes('calculus') ? 'calculus' : 'philosophy';
          
          if (file) {
              // Upload file to Firebase Storage
              const storageRef = firebase.storage().ref();
              const fileRef = storageRef.child(`assignments/${unit}/${Date.now()}_${file.name}`);
              fileRef.put(file).then((snapshot) => {
                  return snapshot.ref.getDownloadURL();
              }).then((downloadURL) => {
                  saveAssignment(unit, currentAssignmentId, title, description, deadline, downloadURL);
              });
          } else {
              saveAssignment(unit, currentAssignmentId, title, description, deadline);
          }
      });
      
      cancelBtn.addEventListener('click', function() {
          form.style.display = 'none';
      });
  } else {
      adminControls.style.display = 'none';
  }
}

function saveAssignment(unit, id, title, description, deadline, fileUrl = '') {
  const db = firebase.database();
  const assignmentsRef = db.ref(`assignments/${unit}`);
  
  const assignmentData = {
      title,
      description,
      deadline,
      fileUrl,
      completed: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  if (id) {
      // Update existing assignment
      assignmentsRef.child(id).update(assignmentData);
  } else {
      // Create new assignment
      assignmentsRef.push(assignmentData);
  }
  
  document.getElementById('assignmentForm').style.display = 'none';
}

function markAssignmentComplete(unit, id) {
  const db = firebase.database();
  db.ref(`assignments/${unit}/${id}`).update({
      completed: true
  });
}

function editAssignment(unit, id, assignment) {
  const form = document.getElementById('assignmentForm');
  form.style.display = 'block';
  
  document.getElementById('assignmentTitle').value = assignment.title;
  document.getElementById('assignmentDesc').value = assignment.description;
  document.getElementById('assignmentDeadline').value = assignment.deadline;
  
  currentAssignmentId = id;
}

function deleteAssignment(unit, id) {
  const db = firebase.database();
  db.ref(`assignments/${unit}/${id}`).remove();
}

function updateAssignmentBadges() {
  const db = firebase.database();
  
  // Calculus badge
  db.ref('assignments/calculus').on('value', (snapshot) => {
      const assignments = snapshot.val() || {};
      let overdueCount = 0;
      
      Object.values(assignments).forEach(assignment => {
          if (new Date(assignment.deadline) < new Date() && !assignment.completed) {
              overdueCount++;
          }
      });
      
      updateBadge('calculusBadge', overdueCount);
  });
  
  // Philosophy badge
  db.ref('assignments/philosophy').on('value', (snapshot) => {
      const assignments = snapshot.val() || {};
      let overdueCount = 0;
      
      Object.values(assignments).forEach(assignment => {
          if (new Date(assignment.deadline) < new Date() && !assignment.completed) {
              overdueCount++;
          }
      });
      
      updateBadge('philosophyBadge', overdueCount);
  });
}

function updateBadge(badgeId, count) {
  const badge = document.getElementById(badgeId);
  if (badge) {
      if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'flex';
      } else {
          badge.style.display = 'none';
      }
  }
}