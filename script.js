const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const API = 'https:localhost:4000';

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

document.getElementById("loginBtn").addEventListener('click', async () => {
    const data = await postData('/login');
})

document.getElementById("registerBtn").addEventListener('click', async () => {
    const data = await postData('/register');
})