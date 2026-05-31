const searchEl  = document.getElementById('search')
const resultsEl = document.getElementById('results')
const statusEl  = document.getElementById('status')

let debounceTimer

searchEl.addEventListener('input', (e) => {
  clearTimeout(debounceTimer)
  const query = e.target.value.trim()

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
    const res  = await fetch(`http://localhost:4000/search?query=${encodeURIComponent(query)}`)
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
    <div class="user-card" style="animation-delay:${i * 30}ms">
      <div class="avatar">${initials}</div>
      <div class="user-info">
        <span class="user-name">${highlighted}</span>
        <span class="user-handle">@${name}</span>
      </div>
    </div>`
  }).join('')
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