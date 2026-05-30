const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const message       = document.getElementById('message');
const terms         = document.getElementById('terms');
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
  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Loading...';
  btn.disabled = true;

  const data = await postData('/login');

  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', usernameInput.value);
    window.location.href = 'pfp/profile.html';
  } else {
    btn.textContent = 'Login'; // ← reset button
    btn.disabled = false;
    message.style.color = 'red';
    message.textContent = data.message || data.error;
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  if (terms.checked) {
    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Loading...';
    btn.disabled = true; // prevent double clicking

    const data = await postData('/register');

    btn.textContent = 'Register'; // ← reset button text after done
    btn.disabled = false;

    if (data.message) {
      message.style.color = 'green';
      message.textContent = data.message;
    } else {
      message.style.color = 'red';
      message.textContent = data.error;
    }
  } else {
    message.style.color = 'red';
    message.textContent = 'Please agree to the terms and conditions.';
  }
});