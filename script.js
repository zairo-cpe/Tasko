const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const message       = document.getElementById('message');

const API = 'http://localhost:4000';

async function postData(endpoint) {
  if (!usernameInput.value || !passwordInput.value) {
    message.textContent = 'Please fill in both fields.';
    return {};
  }

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

document.getElementById('loginBtn').addEventListener('click', async () => {
  const data = await postData('/login');
  if (data.token) localStorage.setItem('token', data.token);
  if (data.message) message.textContent = data.message;
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const data = await postData('/register');
  message.textContent = data.message || data.error;
});