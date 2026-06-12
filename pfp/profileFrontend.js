const params = new URLSearchParams(window.location.search);
const profileText = document.getElementById('profileText');

const API = 'https://tasko-cgm7.onrender.com';

const username = params.get('username') || localStorage.getItem('username');

async function loadProfile() {
	if (!profileText) return;

	if (!username) {
		profileText.textContent = 'No user found. Please log in first.';
		return;
	}

	profileText.textContent = 'Loading profile...';

	try {
		const res = await fetch(`${API}/profile?username=${encodeURIComponent(username)}`);
		const data = await res.json();

		if (!res.ok) {
			profileText.textContent = data.error || 'Could not load profile.';
			return;
		}

		profileText.innerHTML = `
			<strong>${data.username}</strong><br>
			User ID: ${data.id}
		`;
	} catch (error) {
		console.error('Profile error:', error);
		profileText.textContent = 'Could not connect to the server.';
	}
}

loadProfile();