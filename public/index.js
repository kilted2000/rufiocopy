// Grab the <ul> element that will display the list of notes.
const noteList = document.getElementById('list')
// Grab the <input> where the user types a new note.
const noteInput = document.getElementById('content')
// Grab the <form> so we can handle submit events for adding notes.
const form = document.getElementById('form')

// Key used to store and load notes from localStorage in the browser.
const LOCAL_STORAGE_KEY = 'notes'

// Save the given notes array into localStorage so it persists across refreshes.
function saveNotesToLocalStorage(notes) {
  try {
    // Convert the notes array to a JSON string and store it under our key.
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes))
  } catch (e) {
    // If something goes wrong (e.g. storage is full), log the error for debugging.
    console.error('Failed to save notes to localStorage', e)
  }
}

// Load notes from localStorage, if they exist and are valid.
function loadNotesFromLocalStorage() {
  try {
    // Read the raw string stored under our key (or null if nothing is stored).
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    // If nothing was stored, signal "no local notes" with null.
    if (!raw) return null
    // Parse the JSON string back into a JavaScript value.
    const parsed = JSON.parse(raw)
    // Only accept the value if it is an array (what we expect for notes).
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    // If parsing fails or access fails, log the error and fall back to null.
    console.error('Failed to load notes from localStorage', e)
    return null
  }
}

// Render the given notes array into the <ul> and also persist it to localStorage.
function renderNotes(notes) {
  // Whenever we render, also update localStorage so the UI state is saved.
  saveNotesToLocalStorage(notes)
  // Build the inner HTML by mapping each note to an <li> with actions.
  noteList.innerHTML = notes
    .map(
      (note, i) =>
        // data-id stores the index so we know which note to update/delete.
        // Buttons get CSS classes so our click handlers can detect which action was clicked.
        `<li data-id="${i}">${escapeHtml(note)} <button type="button" class="delete-note" aria-label="Delete note">Destroy</button><button type="button" class="update-note" aria-label="Update note">Update</button></li>`
    )
    // Join all the list items into a single HTML string.
    .join('')
}

// Escape arbitrary text so it is safe to insert into innerHTML.
function escapeHtml(text) {
  // Create a temporary <div> element in memory.
  const div = document.createElement('div')
  // Assign the untrusted text to textContent so the browser escapes it for us.
  div.textContent = text
  // Read back the safe, escaped HTML representation.
  return div.innerHTML
}

// Ask the server for the current list of notes.
async function loadNotes() {
  // Send a GET request to our /notes endpoint.
  const response = await fetch('/notes')
  // Parse the JSON body into a JavaScript array of notes.
  const notes = await response.json()
  // Render the notes into the page (and update localStorage).
  renderNotes(notes)
}

// First, try to render any notes stored in localStorage so they show
// even before the server responds (or if the user refreshes the page).
const localNotes = loadNotesFromLocalStorage()
// If we found a valid array in localStorage, render it immediately.
if (localNotes) {
  renderNotes(localNotes)
}

// Then sync with the server so localStorage and UI match the backend.
await loadNotes()

// --- Adding a new note ---
// Attach a submit handler to the form so we can add notes when the user submits.
form.addEventListener('submit', async (e) => {
  // Stop the browser from doing a full page reload on form submit.
  e.preventDefault()
  // Read the user's input and trim whitespace from both ends.
  const note = noteInput.value.trim()
  // If the input is empty after trimming, do nothing.
  if (!note) return

  // Send a POST request to the server with the new note content as JSON.
  const res = await fetch('/notes', {
    method: 'POST', // HTTP verb for "create" in our simple API.
    headers: { 'Content-Type': 'application/json' }, // Tell the server we're sending JSON.
    body: JSON.stringify({ content: note }) // Wrap the note text in an object with a content property.
  })

  // Only proceed if the server responded with a success status (2xx).
  if (res.ok) {
    // The server responds with the full, updated notes array.
    const notes = await res.json()
    // Re-render the list (and update localStorage) using the new array.
    renderNotes(notes)
    // Clear the input so the user can type a new note.
    noteInput.value = ''
  }
})

// --- Updating a note (PATCH) ---
// Use event delegation on the <ul> to handle clicks on any "Update" button.
noteList.addEventListener('click', async (e) => {
  // If the clicked element is not an update button, ignore this click.
  if (!e.target.classList.contains('update-note')) return
  // Find the closest <li> ancestor for the clicked button.
  const li = e.target.closest('li')
  // Read the data-id attribute from the <li> so we know which note index this is.
  const id = li?.getAttribute('data-id')
  // If for some reason there is no id, bail out safely.
  if (id == null) return

  // Grab the current note text from the first child text node in the <li>.
  const currentText = li.firstChild.textContent.trim()
  // Show a prompt dialog pre-filled with the current text so the user can edit it.
  const updated = prompt('Edit note:', currentText)
  // If the user cancelled the prompt (pressed Esc or Cancel), do nothing.
  if (updated == null) return
  // Trim the updated text to remove extra whitespace.
  const newText = updated.trim()
  // If the result is an empty string, do not send an update.
  if (!newText) return

  // Send a PATCH request to /notes/:id with the new content for this index.
  const res = await fetch(`/notes/${id}`, {
    method: 'PATCH', // HTTP verb for a partial update.
    headers: { 'Content-Type': 'application/json' }, // Indicate JSON body.
    body: JSON.stringify({ content: newText }) // Include the updated text as content.
  })

  // If the server successfully updated the note...
  if (res.ok) {
    // ...it returns the full, updated notes array.
    const notes = await res.json()
    // Re-render the list (and update localStorage) to reflect the change.
    renderNotes(notes)
  }
})

// --- Deleting a note ---
// Use event delegation on the <ul> to handle clicks on any "Destroy" button.
noteList.addEventListener('click', async (e) => {
  // If the clicked element is not a delete button, ignore this click.
  if (!e.target.classList.contains('delete-note')) return
  // Find the closest <li> ancestor for the clicked button.
  const li = e.target.closest('li')
  // Read the data-id attribute from the <li> to know which index to delete.
  const id = li?.getAttribute('data-id')
  // If we could not find an id, abort safely.
  if (id == null) return

  // Send a DELETE request to /notes/:id to remove this note on the server.
  const res = await fetch(`/notes/${id}`, { method: 'DELETE' })
  // If the server successfully deleted the note...
  if (res.ok) {
    // ...it returns the full, updated notes array.
    const notes = await res.json()
    // Re-render the list (and update localStorage) to reflect the removal.
    renderNotes(notes)
  }
})
