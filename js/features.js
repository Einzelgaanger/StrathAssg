// js/features.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user information
    const user = JSON.parse(currentUser);
    document.getElementById('userName').textContent = user.name;
    
    // Load motivational quotes
    const quotes = [
        "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
        "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
        "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. - Pelé",
        "The expert in anything was once a beginner. - Helen Hayes",
        "Don't let what you cannot do interfere with what you can do. - John Wooden"
    ];
    
    // Display random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationQuote').textContent = randomQuote;
});