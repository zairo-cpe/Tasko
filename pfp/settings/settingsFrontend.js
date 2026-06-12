const currentUserEl = document.getElementById('settingsUsername');
const logoutButton = document.getElementById('logoutBtn');
const clearDataButton = document.getElementById('clearDataBtn');
const settingsStatus = document.getElementById('settingsStatus');

const currentUsername = localStorage.getItem('username');

function setStatus(message, state = '') {
  if (!settingsStatus) return;
  settingsStatus.textContent = message;
  settingsStatus.dataset.state = state;
}

if (currentUserEl) {
  currentUserEl.textContent = currentUsername ? `@${currentUsername}` : 'No active session';
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '../../index.html';
  });
}

if (clearDataButton) {
  clearDataButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setStatus('Local session data cleared.', 'success');
    if (currentUserEl) {
      currentUserEl.textContent = 'No active session';
    }
  });
}

if (!currentUsername) {
  setStatus('Please log in to use settings.', 'error');
}