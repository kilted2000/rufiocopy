import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

//user types note
//hits send btn
//note displayed on page in browser
//get, post reqs
//constructor fuction to bind inputed text to notes

const notes = ['note 1', 'note 2', 'note 3']

app.get('/notes', (req, res) => {
    res.json(notes)
})

app.get('/notes/:id', (req, res) => {
  res.json(notes[req.params.id])
  console.log(notes[req.params.id])
  console.log(req.params.id)

})

// Add note: body contains { content }. Push to array and return updated notes.
app.post('/notes', (req, res) => {
  notes.push(req.body.content)
  console.log(req.body.content)
  res.json(notes)
  
})

// Delete note by id (array index): remove that index from the array, return updated notes.
app.delete('/notes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id) || id < 0 || id >= notes.length) {
    return res.status(404).json({ error: 'Note not found' })
  }
  notes.splice(id, 1)
  res.json(notes)
})


const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

