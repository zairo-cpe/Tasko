const searchEl  = document.getElementById('search')
const resultsEl = document.getElementById('results')
const statusEl  = document.getElementById('status')

let debounceTimer
let currentQuery = ''

searchEl.addEventListener('input', (e) => {
  clearTimeout(debounceTimer)
  const query = e.target.value.trim()
  currentQuery = query

  if (!query) {
    resultsEl.innerHTML = ''
    statusEl.textContent = ''
    return
  }

  statusEl.textContent = 'searching…'
  debounceTimer = setTimeout(() => searchUsers(query), 300)
})

async function searchUsers(query) {
  try {
    const res  = await fetch(`https://tasko-cgm7.onrender.com/search?query=${encodeURIComponent(query)}`)
    const data = await res.json()

    statusEl.textContent = data.length
      ? `${data.length} result${data.length !== 1 ? 's' : ''}`
      : ''

    renderResults(data, query)
  } catch (err) {
    console.error('Search error:', err)
    statusEl.textContent = 'something went wrong.'
  }
}

function renderResults(users, query) {
  if (users.length === 0) {
    resultsEl.innerHTML = `
      <div class="no-results">
        <span>⌀</span>
        no users found for "${query}"
      </div>`
    return
  }

  resultsEl.innerHTML = users.map((user, i) => {
    const name        = user.username
    const initials    = name.slice(0, 2).toUpperCase()
    const highlighted = highlight(name, query)

    return `
    <button type="button" class="user-card user-card-button" data-username="${name}" style="animation-delay:${i * 30}ms">
      <div class="avatar">${initials}</div>
      <div class="user-info">
        <span class="user-name">${highlighted}</span>
        <span class="user-handle">@${name}</span>
      </div>
    </button>`
  }).join('')

  resultsEl.querySelectorAll('.user-card-button').forEach((button) => {
    button.addEventListener('click', () => {
      showUserDocuments(button.dataset.username)
    })
  })
}

async function showUserDocuments(username) {
  if (!username) return

  statusEl.textContent = `loading documents for @${username}...`
  resultsEl.innerHTML = ''

  try {
    const res = await fetch(`https://tasko-cgm7.onrender.com/documents?username=${encodeURIComponent(username)}`)
    const documents = await res.json()

    if (!res.ok) {
      statusEl.textContent = documents.error || 'could not load documents.'
      return
    }

    statusEl.innerHTML = `
      showing saved documents for <strong>@${username}</strong>
      <button type="button" class="back-button" id="backToSearch">back</button>
    `

    resultsEl.innerHTML = renderDocumentTable(documents)

    const backButton = document.getElementById('backToSearch')
    if (backButton) {
      backButton.addEventListener('click', () => {
        if (currentQuery) {
          searchUsers(currentQuery)
        } else {
          resultsEl.innerHTML = ''
          statusEl.textContent = ''
        }
      })
    }
  } catch (err) {
    console.error('Document load error:', err)
    statusEl.textContent = 'something went wrong.'
  }
}

function renderDocumentTable(documents) {
  if (!documents.length) {
    return `
      <div class="no-results">
        <span>∅</span>
        no saved documents for this user
      </div>`
  }

  return `
    <div class="document-list document-list--compact">
      ${documents.map((document) => `
        <article class="documentCard documentCard--compact">
          <h3>${document.title}</h3>
        </article>`).join('')}
    </div>`
}

function highlight(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    text.slice(0, idx) +
    `<strong style="color:var(--accent);font-weight:500">${text.slice(idx, idx + query.length)}</strong>` +
    text.slice(idx + query.length)
  )
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchEl.focus()
  }
})