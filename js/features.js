// js/features.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display welcome message
    const user = JSON.parse(currentUser);
    document.getElementById('welcomeText').textContent = `Welcome, ${user.name}`;
    
    // Tab navigation
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Load appropriate content
            const tabName = this.getAttribute('data-tab');
            loadTabContent(tabName);
        });
    });
    
    // Load initial tab (Assignments)
    loadTabContent('assignments');
});

function loadTabContent(tabName) {
    const tabContent = document.getElementById('tabContent');
    
    switch(tabName) {
        case 'assignments':
            tabContent.innerHTML = `
                <h3>Assignments</h3>
                <p>Select a unit to view assignments:</p>
                <ul>
                    <li><a href="assignments/assignments.html">All Assignments</a></li>
                    <li><a href="assignments/calculus-assignments.html">Calculus</a></li>
                    <li><a href="assignments/philosophy-assignments.html">Philosophy</a></li>
                </ul>
            `;
            break;
        case 'notes':
            tabContent.innerHTML = `
                <h3>Notes</h3>
                <p>Select a unit to view notes:</p>
                <ul>
                    <li><a href="notes/notes.html">All Notes</a></li>
                    <li><a href="notes/calculus-notes.html">Calculus</a></li>
                    <li><a href="notes/philosophy-notes.html">Philosophy</a></li>
                </ul>
            `;
            break;
        case 'exams':
            tabContent.innerHTML = `
                <h3>Exams</h3>
                <p>Select a unit to view exam materials:</p>
                <ul>
                    <li><a href="exams/exams.html">All Exams</a></li>
                    <li><a href="exams/calculus-exams.html">Calculus</a></li>
                    <li><a href="exams/philosophy-exams.html">Philosophy</a></li>
                </ul>
            `;
            break;
    }
}