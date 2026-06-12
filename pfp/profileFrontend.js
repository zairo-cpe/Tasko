const params = new URLSearchParams(window.location.search);
const profileText = document.getElementById('profileText');
const newDocumentBtn = document.getElementById('newDocumentBtn');
const cancelDocumentBtn = document.getElementById('cancelDocumentBtn');
const documentForm = document.getElementById('documentForm');
const documentTitle = document.getElementById('documentTitle');
const documentContent = document.getElementById('documentContent');
const documentStatus = document.getElementById('documentStatus');
const documentList = document.getElementById('documentList');

const API = 'https://tasko-cgm7.onrender.com';

const username = params.get('username') || localStorage.getItem('username');
let activeDocumentId = null;

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

		await loadDocuments();
	} catch (error) {
		console.error('Profile error:', error);
		profileText.textContent = 'Could not connect to the server.';
	}
}

function setDocumentStatus(message, isError = false) {
	if (!documentStatus) return;
	documentStatus.textContent = message;
	documentStatus.dataset.state = isError ? 'error' : 'ok';
}

function showDocumentForm(show) {
	if (!documentForm) return;
	documentForm.classList.toggle('hidden', !show);
	if (show && documentTitle) {
		documentTitle.focus();
	}
}

function setFormMode(mode, documentItem = null) {
	activeDocumentId = documentItem ? documentItem.id : null;
	if (!documentForm) return;

	if (mode === 'edit' && documentItem) {
		documentTitle.value = documentItem.title || '';
		documentContent.value = documentItem.content || '';
		newDocumentBtn.textContent = 'Cancel edit';
		showDocumentForm(true);
		setDocumentStatus(`Editing document #${documentItem.id}`);
		return;
	}

	if (documentForm) {
		documentForm.reset();
	}
	if (newDocumentBtn) {
		newDocumentBtn.textContent = 'New document?';
	}
	showDocumentForm(mode === 'create');
}

function renderDocuments(documents) {
	if (!documentList) return;

	if (!documents.length) {
		documentList.innerHTML = '<p class="emptyState">No documents yet. Create your first one.</p>';
		return;
	}

	documentList.innerHTML = documents.map((document) => {
		const content = document.content ? document.content : 'No content yet.';

		return `
			<article class="documentCard">
				<h3>${document.title}</h3>
				<p>${content}</p>
				<div class="documentActions">
					<button type="button" class="editDocumentBtn" data-id="${document.id}" data-title="${encodeURIComponent(document.title)}" data-content="${encodeURIComponent(document.content || '')}">Edit</button>
					<button type="button" class="deleteDocumentBtn" data-id="${document.id}">Delete</button>
				</div>
			</article>`;
	}).join('');

	documentList.querySelectorAll('.editDocumentBtn').forEach((button) => {
		button.addEventListener('click', () => {
			const id = Number(button.dataset.id);
			const title = decodeURIComponent(button.dataset.title || '');
			const content = decodeURIComponent(button.dataset.content || '');
			setFormMode('edit', { id, title, content });
		});
	});

	documentList.querySelectorAll('.deleteDocumentBtn').forEach((button) => {
		button.addEventListener('click', async () => {
			const id = button.dataset.id;
			if (!window.confirm('Delete this document?')) return;

			setDocumentStatus('Deleting document...');

			try {
				const res = await fetch(`${API}/documents/${id}`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});

				const data = await res.json();

				if (!res.ok) {
					setDocumentStatus(data.error || 'Could not delete document.', true);
					return;
				}

				setDocumentStatus(data.message || 'Document deleted.');
				await loadDocuments();
			} catch (error) {
				console.error('Delete document error:', error);
				setDocumentStatus('Could not connect to the server.', true);
			}
		});
	});
}

async function loadDocuments() {
	if (!username || !documentList) return;

	try {
		const res = await fetch(`${API}/documents?username=${encodeURIComponent(username)}`);
		const data = await res.json();

		if (!res.ok) {
			setDocumentStatus(data.error || 'Could not load documents.', true);
			return;
		}

		renderDocuments(data);
		setDocumentStatus(data.length ? `${data.length} document${data.length !== 1 ? 's' : ''}` : '');
	} catch (error) {
		console.error('Documents error:', error);
		setDocumentStatus('Could not connect to the server.', true);
	}
}

if (newDocumentBtn) {
	newDocumentBtn.addEventListener('click', () => {
		if (activeDocumentId) {
			activeDocumentId = null;
			if (documentForm) documentForm.reset();
			setDocumentStatus('');
			newDocumentBtn.textContent = 'New document?';
			showDocumentForm(false);
			return;
		}

		setFormMode('create');
	});
}

if (cancelDocumentBtn) {
	cancelDocumentBtn.addEventListener('click', () => {
		activeDocumentId = null;
		if (documentForm) documentForm.reset();
		if (newDocumentBtn) newDocumentBtn.textContent = 'New document?';
		showDocumentForm(false);
		setDocumentStatus('');
	});
}

if (documentForm) {
	documentForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (!username) {
			setDocumentStatus('Please log in first.', true);
			return;
		}

		const title = documentTitle.value.trim();
		const content = documentContent.value.trim();

		if (!title) {
			setDocumentStatus('Document title is required.', true);
			return;
		}

		setDocumentStatus(activeDocumentId ? 'Updating document...' : 'Saving document...');

		try {
			const isEditing = Boolean(activeDocumentId);
			const res = await fetch(isEditing ? `${API}/documents/${activeDocumentId}` : `${API}/documents`, {
				method: isEditing ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, title, content })
			});

			const data = await res.json();

			if (!res.ok) {
				setDocumentStatus(data.error || 'Could not save document.', true);
				return;
			}

			documentForm.reset();
			activeDocumentId = null;
			showDocumentForm(false);
			if (newDocumentBtn) newDocumentBtn.textContent = 'New document?';
			setDocumentStatus(isEditing ? 'Document updated.' : 'Document saved.');
			await loadDocuments();
		} catch (error) {
			console.error('Save document error:', error);
			setDocumentStatus('Could not connect to the server.', true);
		}
	});
}

loadProfile();