// Grab elements from the HTML by their IDs
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const message       = document.getElementById('message');

// Your backend URL — change port if needed
const API = 'http://localhost:4000';

// Helper: sends data to a backend endpoint
async function postData(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value
    })
  });
  return res.json();
}

// Login button click
document.getElementById('login-btn')
  .addEventListener('click', async () => {
    const data = await postData('/login');
    message.textContent = data.message;
  });

// Register button click
document.getElementById('register-btn')
  .addEventListener('click', async () => {
    const data = await postData('/register');
    message.textContent = data.message || data.error;
  });