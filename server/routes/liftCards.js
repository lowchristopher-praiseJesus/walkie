const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');

const router = express.Router();

// GET all lift cards
router.get('/', (req, res) => {
  const data = db.getLiftCards();
  res.json(data.liftCards);
});

// POST new lift card
router.post('/', (req, res) => {
  const { number, notes } = req.body;
  if (number === undefined) {
    return res.status(400).json({ error: 'number required' });
  }

  const data = db.getLiftCards();

  // Check for duplicate number
  if (data.liftCards.some(lc => lc.number === number)) {
    return res.status(400).json({ error: 'Lift card number already exists' });
  }

  const liftCard = {
    id: uuidv4(),
    number,
    notes: notes || '',
    assignedTo: null,
    assignedAt: null,
    unusable: false
  };
  data.liftCards.push(liftCard);
  db.saveLiftCards(data);
  res.status(201).json(liftCard);
});

// PUT update lift card
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { number, notes, unusable } = req.body;

  const data = db.getLiftCards();
  const index = data.liftCards.findIndex(lc => lc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lift card not found' });
  }

  // Check for duplicate number if changing
  if (number !== undefined && number !== data.liftCards[index].number) {
    if (data.liftCards.some(lc => lc.number === number)) {
      return res.status(400).json({ error: 'Lift card number already exists' });
    }
  }

  data.liftCards[index] = {
    ...data.liftCards[index],
    number: number !== undefined ? number : data.liftCards[index].number,
    notes: notes !== undefined ? notes : data.liftCards[index].notes,
    unusable: unusable !== undefined ? unusable : data.liftCards[index].unusable
  };
  db.saveLiftCards(data);
  res.json(data.liftCards[index]);
});

// POST toggle lift card unusable status
router.post('/:id/toggle-unusable', (req, res) => {
  const { id } = req.params;

  const data = db.getLiftCards();
  const index = data.liftCards.findIndex(lc => lc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lift card not found' });
  }

  data.liftCards[index].unusable = !data.liftCards[index].unusable;
  db.saveLiftCards(data);
  res.json(data.liftCards[index]);
});

// DELETE lift card
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const data = db.getLiftCards();
  const index = data.liftCards.findIndex(lc => lc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lift card not found' });
  }

  data.liftCards.splice(index, 1);
  db.saveLiftCards(data);
  res.status(204).send();
});

// POST sign out lift card
router.post('/sign-out', (req, res) => {
  const { liftCardId, volunteerId } = req.body;
  if (!liftCardId || !volunteerId) {
    return res.status(400).json({ error: 'liftCardId and volunteerId required' });
  }

  const liftCardsData = db.getLiftCards();
  const index = liftCardsData.liftCards.findIndex(lc => lc.id === liftCardId);
  if (index === -1) {
    return res.status(404).json({ error: 'Lift card not found' });
  }

  if (liftCardsData.liftCards[index].assignedTo) {
    return res.status(400).json({ error: 'Lift card already signed out' });
  }

  if (liftCardsData.liftCards[index].unusable) {
    return res.status(400).json({ error: 'Lift card is marked as unusable' });
  }

  liftCardsData.liftCards[index].assignedTo = volunteerId;
  liftCardsData.liftCards[index].assignedAt = new Date().toISOString();
  db.saveLiftCards(liftCardsData);

  // Log the sign-out
  db.addAuditEntry({
    action: 'sign-out',
    itemType: 'lift-card',
    itemNumber: liftCardsData.liftCards[index].number,
    volunteerId: volunteerId
  });

  res.json(liftCardsData.liftCards[index]);
});

// POST return lift card
router.post('/return/:id', (req, res) => {
  const { id } = req.params;

  const data = db.getLiftCards();
  const index = data.liftCards.findIndex(lc => lc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lift card not found' });
  }

  const previousVolunteerId = data.liftCards[index].assignedTo;

  // Log the return before clearing
  if (previousVolunteerId) {
    db.addAuditEntry({
      action: 'return',
      itemType: 'lift-card',
      itemNumber: data.liftCards[index].number,
      volunteerId: previousVolunteerId
    });
  }

  data.liftCards[index].assignedTo = null;
  data.liftCards[index].assignedAt = null;
  db.saveLiftCards(data);
  res.json(data.liftCards[index]);
});

// POST reset all lift cards
router.post('/reset', (req, res) => {
  const data = db.getLiftCards();
  data.liftCards = data.liftCards.map(lc => ({
    ...lc,
    assignedTo: null,
    assignedAt: null
  }));
  db.saveLiftCards(data);
  res.json({ message: 'All lift cards reset' });
});

module.exports = router;
