// Import the Express framework so we can create an HTTP server easily.
import express from 'express'
// Import Node's path utilities for working with filesystem paths in a cross‑platform way.
import path from 'path'
// Import helper to convert import.meta.url into a real filesystem path.
import { fileURLToPath } from 'url'

// Create a new Express application instance.
const app = express()

// Resolve the absolute path to this server.js file.
//converts module path to useable OS path
const __filename = fileURLToPath(import.meta.url)
// Resolve the directory that contains this file; used for building other paths.
//regularizes paths no matter the directory
const __dirname = path.dirname(__filename)

// Serve static files (HTML, JS, CSS) from the "public" folder at the web root.
app.use(express.static(path.join(__dirname, 'public')))
// Parse incoming JSON request bodies and populate req.body with the result.
app.use(express.json())

// Handle GET requests to the root URL, serving the main HTML page.
app.get('/', (req, res) => {
  // Send the index.html file located in the project root directory.
  res.sendFile(path.join(__dirname, 'index.html'))
})

// In‑memory array of note strings; this simulates a simple database.
const notes = ['note 1', 'note 2', 'note 3']

// Return the full list of notes as JSON.
app.get('/notes', (req, res) => {
  // Serialize the notes array as JSON in the HTTP response.
  res.json(notes)
})

// Return a single note by its index (:id is the index in the notes array).
app.get('/notes/:id', (req, res) => {
  // Send back the note stored at the requested index.
  res.json(notes[req.params.id])
})

// Add note: body contains { content }. Push to array and return updated notes.
app.post('/notes', (req, res) => {
  // Push the new note text from the request body into our array.
  notes.push(req.body.content)
  // Return the full updated notes array so the client can re-render.
  res.json(notes)
})

// Update note by id (array index): replace content and return updated notes.
app.patch('/notes/:id', (req, res) => {
  // Convert the :id route parameter from string to integer index.
  const id = parseInt(req.params.id, 10)
  // If id is not a number or is out of bounds, respond with a 404 error.
  if (Number.isNaN(id) || id < 0 || id >= notes.length) {
    return res.status(404).json({ error: 'Note not found' })
  }
  // Replace the note at this index with the new content from the request body.
  notes[id] = req.body.content
  // Return the full updated notes array so the client can re-render.
  res.json(notes)
})

// Delete note by id (array index): remove that index from the array, return updated notes.
app.delete('/notes/:id', (req, res) => {
  // Convert the :id route parameter from string to integer index.
  const id = parseInt(req.params.id, 10)
  // If id is invalid or out of range, return a 404 error so the client knows it failed.
  if (Number.isNaN(id) || id < 0 || id >= notes.length) {
    return res.status(404).json({ error: 'Note not found' })
  }
  // Remove exactly one element from the notes array at this index.
  notes.splice(id, 1)
  // Return the full updated notes array so the client stays in sync.
  res.json(notes)
})

// Port number on which the HTTP server will listen for incoming connections.
const PORT = 3000
// Start the Express server and log a message once it is running.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
