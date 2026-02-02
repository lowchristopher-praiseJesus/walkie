const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');

const router = express.Router();

// GET all volunteers
router.get('/', (req, res) => {
  const data = db.getVolunteers();
  res.json(data.volunteers);
});

// POST new volunteer
router.post('/', (req, res) => {
  const { firstName, lastName, phone } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'firstName and lastName required' });
  }

  const data = db.getVolunteers();
  const volunteer = {
    id: uuidv4(),
    firstName,
    lastName,
    phone: phone || ''
  };
  data.volunteers.push(volunteer);
  db.saveVolunteers(data);
  res.status(201).json(volunteer);
});

// PUT update volunteer
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone } = req.body;

  const data = db.getVolunteers();
  const index = data.volunteers.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }

  data.volunteers[index] = {
    ...data.volunteers[index],
    firstName: firstName || data.volunteers[index].firstName,
    lastName: lastName || data.volunteers[index].lastName,
    phone: phone !== undefined ? phone : data.volunteers[index].phone
  };
  db.saveVolunteers(data);
  res.json(data.volunteers[index]);
});

// DELETE volunteer
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const data = db.getVolunteers();
  const index = data.volunteers.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }

  data.volunteers.splice(index, 1);
  db.saveVolunteers(data);
  res.status(204).send();
});

module.exports = router;
