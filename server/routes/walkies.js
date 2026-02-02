const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');

const router = express.Router();

// GET all walkies
router.get('/', (req, res) => {
  const data = db.getWalkies();
  res.json(data.walkies);
});

// POST new walkie
router.post('/', (req, res) => {
  const { number, notes } = req.body;
  if (number === undefined) {
    return res.status(400).json({ error: 'number required' });
  }

  const data = db.getWalkies();

  // Check for duplicate number
  if (data.walkies.some(w => w.number === number)) {
    return res.status(400).json({ error: 'Walkie number already exists' });
  }

  const walkie = {
    id: uuidv4(),
    number,
    notes: notes || '',
    assignedTo: null,
    assignedAt: null
  };
  data.walkies.push(walkie);
  db.saveWalkies(data);
  res.status(201).json(walkie);
});

// PUT update walkie
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { number, notes } = req.body;

  const data = db.getWalkies();
  const index = data.walkies.findIndex(w => w.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Walkie not found' });
  }

  // Check for duplicate number if changing
  if (number !== undefined && number !== data.walkies[index].number) {
    if (data.walkies.some(w => w.number === number)) {
      return res.status(400).json({ error: 'Walkie number already exists' });
    }
  }

  data.walkies[index] = {
    ...data.walkies[index],
    number: number !== undefined ? number : data.walkies[index].number,
    notes: notes !== undefined ? notes : data.walkies[index].notes
  };
  db.saveWalkies(data);
  res.json(data.walkies[index]);
});

// DELETE walkie
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const data = db.getWalkies();
  const index = data.walkies.findIndex(w => w.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Walkie not found' });
  }

  data.walkies.splice(index, 1);
  db.saveWalkies(data);
  res.status(204).send();
});

// POST sign out walkie
router.post('/sign-out', (req, res) => {
  const { walkieId, volunteerId } = req.body;
  if (!walkieId || !volunteerId) {
    return res.status(400).json({ error: 'walkieId and volunteerId required' });
  }

  const walkiesData = db.getWalkies();
  const index = walkiesData.walkies.findIndex(w => w.id === walkieId);
  if (index === -1) {
    return res.status(404).json({ error: 'Walkie not found' });
  }

  if (walkiesData.walkies[index].assignedTo) {
    return res.status(400).json({ error: 'Walkie already signed out' });
  }

  walkiesData.walkies[index].assignedTo = volunteerId;
  walkiesData.walkies[index].assignedAt = new Date().toISOString();
  db.saveWalkies(walkiesData);
  res.json(walkiesData.walkies[index]);
});

// POST return walkie
router.post('/return/:id', (req, res) => {
  const { id } = req.params;

  const data = db.getWalkies();
  const index = data.walkies.findIndex(w => w.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Walkie not found' });
  }

  data.walkies[index].assignedTo = null;
  data.walkies[index].assignedAt = null;
  db.saveWalkies(data);
  res.json(data.walkies[index]);
});

// POST reset all walkies
router.post('/reset', (req, res) => {
  const data = db.getWalkies();
  data.walkies = data.walkies.map(w => ({
    ...w,
    assignedTo: null,
    assignedAt: null
  }));
  db.saveWalkies(data);
  res.json({ message: 'All walkies reset' });
});

module.exports = router;
