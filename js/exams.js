// js/exams.js
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
          if (window.location.pathname.includes('calculus-exams.html') || 
              window.location.pathname.includes('philosophy-exams.html')) {
              window.location.href = 'exams.html';
          } else {
              window.location.href = '../features.html';
          }
      });
  });
  
  // Initialize Firebase
  const firebaseConfig = {
      apiKey: "AIzaSyDm_zKtFcQLqLXvUBwz8ydavf-f10rgI6E",
      authDomain: "strath-assignments.firebaseapp.com",
      projectId: "strath-assignments",
      storageBucket: "strath-assignments.appspot.com",
      messagingSenderId: "1008534071944",
      appId: "1:1008534071944:web:b3d94f8564951c52440d3d",
      measurementId: "G-2BHV20YL1C"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // Get current unit from URL
  let currentUnit = '';
  if (window.location.pathname.includes('calculus-exams.html')) {
      currentUnit = 'calculus';
  } else if (window.location.pathname.includes('philosophy-exams.html')) {
      currentUnit = 'philosophy';
  }
  
  // Load exams for specific unit page
  if (currentUnit) {
      loadExams(currentUnit);
      setupAdminControls(isAdmin);
  }
});

function loadExams(unit) {
  const examsList = document.getElementById('examsList');
  const db = firebase.database();
  const examsRef = db.ref(`exams/${unit}`);
  
  examsRef.on('value', (snapshot) => {
      examsList.innerHTML = '';
      const exams = snapshot.val() || {};
      
      Object.entries(exams).forEach(([id, exam]) => {
          const examElement = createExamElement(id, exam, unit);
          examsList.appendChild(examElement);
      });
  });
}

function createExamElement(id, exam, unit) {
  const examElement = document.createElement('div');
  examElement.className = 'exam';
  
  const date = new Date(exam.createdAt);
  
  examElement.innerHTML = `
      <h3>${exam.title}</h3>
      ${exam.description ? `<p>${exam.description}</p>` : ''}
      <p class="date">Uploaded: ${date.toLocaleString()}</p>
      ${exam.fileUrl ? `<p><a href="${exam.fileUrl}" target="_blank">Download File</a></p>` : ''}
      <div class="admin-actions">
          <button class="edit-btn" data-id="${id}" data-unit="${unit}">Edit</button>
          <button class="delete-btn" data-id="${id}" data-unit="${unit}">Delete</button>
      </div>
  `;
  
  // Add event listeners for admin actions
  const editBtn = examElement.querySelector('.edit-btn');
  if (editBtn) {
      editBtn.addEventListener('click', function() {
          editExam(unit, id, exam);
      });
  }
  
  const deleteBtn = examElement.querySelector('.delete-btn');
  if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to delete this exam?')) {
              deleteExam(unit, id);
          }
      });
  }
  
  return examElement;
}

function setupAdminControls(isAdmin) {
  const adminControls = document.getElementById('adminControls');
  const adminActions = document.querySelectorAll('.admin-actions');
  
  if (isAdmin) {
      adminControls.style.display = 'block';
      adminActions.forEach(action => {
          action.style.display = 'block';
      });
      
      // Add exam form functionality
      const addBtn = document.getElementById('addExamBtn');
      const form = document.getElementById('examForm');
      const saveBtn = document.getElementById('saveExam');
      const cancelBtn = document.getElementById('cancelExam');
      
      let currentExamId = null;
      
      addBtn.addEventListener('click', function() {
          currentExamId = null;
          form.style.display = 'block';
          document.getElementById('examTitle').value = '';
          document.getElementById('examDesc').value = '';
          document.getElementById('examFile').value = '';
      });
      
      saveBtn.addEventListener('click', function() {
          const title = document.getElementById('examTitle').value;
          const description = document.getElementById('examDesc').value;
          const file = document.getElementById('examFile').files[0];
          
          if (!title || !file) {
              alert('Please fill all required fields');
              return;
          }
          
          const unit = window.location.pathname.includes('calculus') ? 'calculus' : 'philosophy';
          
          // Upload file to Firebase Storage
          const storageRef = firebase.storage().ref();
          const fileRef = storageRef.child(`exams/${unit}/${Date.now()}_${file.name}`);
          fileRef.put(file).then((snapshot) => {
              return snapshot.ref.getDownloadURL();
          }).then((downloadURL) => {
              saveExam(unit, currentExamId, title, description, downloadURL);
          });
      });
      
      cancelBtn.addEventListener('click', function() {
          form.style.display = 'none';
      });
  } else {
      adminControls.style.display = 'none';
  }
}

function saveExam(unit, id, title, description, fileUrl) {
  const db = firebase.database();
  const examsRef = db.ref(`exams/${unit}`);
  
  const examData = {
      title,
      description: description || '',
      fileUrl,
      createdAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  if (id) {
      // Update existing exam
      examsRef.child(id).update(examData);
  } else {
      // Create new exam
      examsRef.push(examData);
  }
  
  document.getElementById('examForm').style.display = 'none';
}

function editExam(unit, id, exam) {
  const form = document.getElementById('examForm');
  form.style.display = 'block';
  
  document.getElementById('examTitle').value = exam.title;
  document.getElementById('examDesc').value = exam.description || '';
  
  currentExamId = id;
}

function deleteExam(unit, id) {
  const db = firebase.database();
  db.ref(`exams/${unit}/${id}`).remove();
}