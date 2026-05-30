const params = new URLSearchParams(window.location.search);
const username = localStorage.getItem('username');
const profileText = document.getElementById('profileText');
profileText.textContent = `${username}.`;