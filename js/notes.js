// js/notes.js
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
          if (window.location.pathname.includes('calculus-notes.html') || 
              window.location.pathname.includes('philosophy-notes.html')) {
              window.location.href = 'notes.html';
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
  if (window.location.pathname.includes('calculus-notes.html')) {
      currentUnit = 'calculus';
  } else if (window.location.pathname.includes('philosophy-notes.html')) {
      currentUnit = 'philosophy';
  }
  
  // Load notes for specific unit page
  if (currentUnit) {
      loadNotes(currentUnit);
      setupAdminControls(isAdmin);
  }
});

function loadNotes(unit) {
  const notesList = document.getElementById('notesList');
  const db = firebase.database();
  const notesRef = db.ref(`notes/${unit}`);
  
  notesRef.on('value', (snapshot) => {
      notesList.innerHTML = '';
      const notes = snapshot.val() || {};
      
      Object.entries(notes).forEach(([id, note]) => {
          const noteElement = createNoteElement(id, note, unit);
          notesList.appendChild(noteElement);
      });
  });
}

function createNoteElement(id, note, unit) {
  const noteElement = document.createElement('div');
  noteElement.className = 'note';
  
  const date = new Date(note.createdAt);
  
  noteElement.innerHTML = `
      <h3>${note.title}</h3>
      ${note.description ? `<p>${note.description}</p>` : ''}
      <p class="date">Uploaded: ${date.toLocaleString()}</p>
      ${note.fileUrl ? `<p><a href="${note.fileUrl}" target="_blank">Download File</a></p>` : ''}
      <div class="admin-actions">
          <button class="edit-btn" data-id="${id}" data-unit="${unit}">Edit</button>
          <button class="delete-btn" data-id="${id}" data-unit="${unit}">Delete</button>
      </div>
  `;
  
  // Add event listeners for admin actions
  const editBtn = noteElement.querySelector('.edit-btn');
  if (editBtn) {
      editBtn.addEventListener('click', function() {
          editNote(unit, id, note);
      });
  }
  
  const deleteBtn = noteElement.querySelector('.delete-btn');
  if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to delete this note?')) {
              deleteNote(unit, id);
          }
      });
  }
  
  return noteElement;
}

function setupAdminControls(isAdmin) {
  const adminControls = document.getElementById('adminControls');
  const adminActions = document.querySelectorAll('.admin-actions');
  
  if (isAdmin) {
      adminControls.style.display = 'block';
      adminActions.forEach(action => {
          action.style.display = 'block';
      });
      
      // Add note form functionality
      const addBtn = document.getElementById('addNoteBtn');
      const form = document.getElementById('noteForm');
      const saveBtn = document.getElementById('saveNote');
      const cancelBtn = document.getElementById('cancelNote');
      
      let currentNoteId = null;
      
      addBtn.addEventListener('click', function() {
          currentNoteId = null;
          form.style.display = 'block';
          document.getElementById('noteTitle').value = '';
          document.getElementById('noteDesc').value = '';
          document.getElementById('noteFile').value = '';
      });
      
      saveBtn.addEventListener('click', function() {
          const title = document.getElementById('noteTitle').value;
          const description = document.getElementById('noteDesc').value;
          const file = document.getElementById('noteFile').files[0];
          
          if (!title || !file) {
              alert('Please fill all required fields');
              return;
          }
          
          const unit = window.location.pathname.includes('calculus') ? 'calculus' : 'philosophy';
          
          // Upload file to Firebase Storage
          const storageRef = firebase.storage().ref();
          const fileRef = storageRef.child(`notes/${unit}/${Date.now()}_${file.name}`);
          fileRef.put(file).then((snapshot) => {
              return snapshot.ref.getDownloadURL();
          }).then((downloadURL) => {
              saveNote(unit, currentNoteId, title, description, downloadURL);
          });
      });
      
      cancelBtn.addEventListener('click', function() {
          form.style.display = 'none';
      });
  } else {
      adminControls.style.display = 'none';
  }
}

function saveNote(unit, id, title, description, fileUrl) {
  const db = firebase.database();
  const notesRef = db.ref(`notes/${unit}`);
  
  const noteData = {
      title,
      description: description || '',
      fileUrl,
      createdAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  if (id) {
      // Update existing note
      notesRef.child(id).update(noteData);
  } else {
      // Create new note
      notesRef.push(noteData);
  }
  
  document.getElementById('noteForm').style.display = 'none';
}

function editNote(unit, id, note) {
  const form = document.getElementById('noteForm');
  form.style.display = 'block';
  
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('noteDesc').value = note.description || '';
  
  currentNoteId = id;
}

function deleteNote(unit, id) {
  const db = firebase.database();
  db.ref(`notes/${unit}/${id}`).remove();
}