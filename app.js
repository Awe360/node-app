const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let users = []; // In-memory storage

// CREATE: Add a user
app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).send(user);
});

// READ: Get all users
app.get('/users', (req, res) => {
  res.send(users);
});

// UPDATE: Update a user by index
app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < users.length) {
    users[id] = req.body;
    res.send(users[id]);
  } else {
    res.status(404).send('User not found');
  }
});

// DELETE: Delete a user by index
app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < users.length) {
    users.splice(id, 1);
    res.status(204).send();
  } else {
    res.status(404).send('User not found');
  }
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});