const API = 'https://tasko-cgm7.onrender.com';

const currentUsernameEl = document.getElementById('currentUsername');
const usernameInput = document.getElementById('newUsername');
const editStatus = document.getElementById('editStatus');
const editForm = document.getElementById('editForm');
const saveButton = document.getElementById('saveUsernameBtn');
const cancelButton = document.getElementById('cancelEditBtn');

const currentUsername = localStorage.getItem('username');

function setStatus(message, state = '') {
  if (!editStatus) return;
  editStatus.textContent = message;
  editStatus.dataset.state = state;
}

async function loadProfile() {
  if (!currentUsername) {
    setStatus('Please log in first.', 'error');
    return;
  }

  currentUsernameEl.textContent = `@${currentUsername}`;
  usernameInput.value = currentUsername;

  try {
    const res = await fetch(`${API}/profile?username=${encodeURIComponent(currentUsername)}`);
    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || 'Could not load profile.', 'error');
      return;
    }

    currentUsernameEl.textContent = `@${data.username}`;
    usernameInput.value = data.username;
    setStatus('Update your username below.');
  } catch (error) {
    console.error('Edit profile error:', error);
    setStatus('Could not connect to the server.', 'error');
  }
}

if (editForm) {
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newUsername = usernameInput.value.trim();

    if (!newUsername) {
      setStatus('Username is required.', 'error');
      return;
    }

    saveButton.disabled = true;
    setStatus('Saving username...');

    try {
      const res = await fetch(`${API}/profile/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername, newUsername })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || 'Could not update username.', 'error');
        return;
      }

      localStorage.setItem('username', data.user.username);
      setStatus('Username updated.', 'success');
      window.location.href = '../profile.html';
    } catch (error) {
      console.error('Save username error:', error);
      setStatus('Could not connect to the server.', 'error');
    } finally {
      saveButton.disabled = false;
    }
  });
}

if (cancelButton) {
  cancelButton.addEventListener('click', () => {
    window.location.href = '../profile.html';
  });
}

loadProfile();