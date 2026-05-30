const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const message       = document.getElementById('message');

const API = 'https://tasko-cgm7.onrender.com';

async function postData(endpoint) {
  if (!usernameInput.value || !passwordInput.value) {
    message.textContent = 'Please fill in both fields.';
    return {};
  }

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value
      })
    });
    return await res.json();
  } catch (err) {
    console.error("Network error:", err);
    return { error: "Could not connect to the server. Please try again later." };
  }
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const data = await postData('/login');
  if (data.token) localStorage.setItem('token', data.token);
  // Fallback to data.error if login message isn't present
  if (data.message || data.error) message.textContent = data.message || data.error;
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const data = await postData('/register');
  message.textContent = data.message || data.error;
});