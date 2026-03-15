const noteList = document.getElementById('list')
const noteInput = document.getElementById('content')
const form = document.getElementById('form')

function renderNotes(notes) {
  noteList.innerHTML = notes
    .map(
      (note, i) =>
        `<li data-id="${i}">${escapeHtml(note)} <button type="button" class="delete-note" aria-label="Delete note">Destroy</button></li>`
    )
    .join('')
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

async function loadNotes() {
  const response = await fetch('/notes')
  const notes = await response.json()
  renderNotes(notes)
}

await loadNotes()

// --- Adding a new note ---
// 1. User types in the input and clicks Submit (form submit).
// 2. We prevent the default form submit so the page doesn't reload.
// 3. We read the trimmed text from the input; if it's empty, we do nothing.
// 4. We send a POST request to /notes with the note content in the body as JSON.
// 5. The server adds the note to the notes array and returns the updated array.
// 6. If the request succeeded, we re-render the list with the new array and clear the input.
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const note = noteInput.value.trim()
  if (!note) return

  const res = await fetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: note })
  })

  if (res.ok) {
    const notes = await res.json()
    renderNotes(notes)
    noteInput.value = ''
  }
})

// --- Deleting a note ---
// 1. User clicks the "Delete" button on a note (we use event delegation on the list).
// 2. We check that the click was on a .delete-note button, then find its <li> and its data-id (the note's index).
// 3. We send a DELETE request to /notes/:id so the server can remove that note from the array.
// 4. The server removes the note at that index and returns the updated array.
// 5. If the request succeeded, we re-render the list so the UI matches the server and indices stay correct.
noteList.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete-note')) return
  const li = e.target.closest('li')
  const id = li?.getAttribute('data-id')
  if (id == null) return

  const res = await fetch(`/notes/${id}`, { method: 'DELETE' })
  if (res.ok) {
    const notes = await res.json()
    renderNotes(notes)
  }
})



