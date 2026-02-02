const express = require('express');
const db = require('../lib/db');

const router = express.Router();

// POST verify PIN
router.post('/verify', (req, res) => {
  const { pin } = req.body;
  const config = db.getConfig();

  if (pin === config.adminPin) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: 'Invalid PIN' });
  }
});

// GET config (event name only, not PIN)
router.get('/config', (req, res) => {
  const config = db.getConfig();
  res.json({ eventName: config.eventName });
});

// PUT update config
router.put('/config', (req, res) => {
  const { eventName, adminPin } = req.body;
  const config = db.getConfig();

  if (eventName !== undefined) {
    config.eventName = eventName;
  }
  if (adminPin !== undefined) {
    config.adminPin = adminPin;
  }

  db.saveConfig(config);
  res.json({ eventName: config.eventName });
});

module.exports = router;
