const params = new URLSearchParams(window.location.search);
    const username = params.get('username') || params.get('user');
    const profileText = document.getElementById('profileText');
    if (username) {
      profileText.textContent = `Signed in as ${username}.`;
    } else {
      profileText.innerHTML = 'No user information found. Please <a href="../login.html">sign in</a> again.';
    }