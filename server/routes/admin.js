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

// GET config (event name and theme, not PIN)
router.get('/config', (req, res) => {
  const config = db.getConfig();
  res.json({ eventName: config.eventName, theme: config.theme || 'default' });
});

// PUT update config
router.put('/config', (req, res) => {
  const { eventName, adminPin, theme } = req.body;
  const config = db.getConfig();

  if (eventName !== undefined) {
    config.eventName = eventName;
  }
  if (adminPin !== undefined) {
    config.adminPin = adminPin;
  }
  if (theme !== undefined) {
    config.theme = theme;
  }

  db.saveConfig(config);
  res.json({ eventName: config.eventName, theme: config.theme || 'default' });
});

// GET audit log
router.get('/audit-log', (req, res) => {
  const log = db.getAuditLog();
  const volunteers = db.getVolunteers();

  // Enrich entries with volunteer names
  const enrichedEntries = log.entries.map(entry => {
    const volunteer = volunteers.volunteers.find(v => v.id === entry.volunteerId);
    return {
      ...entry,
      volunteerName: volunteer ? `${volunteer.firstName} ${volunteer.lastName}`.trim() : 'Unknown'
    };
  });

  // Sort by timestamp descending (most recent first)
  enrichedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(enrichedEntries);
});

// DELETE clear audit log
router.delete('/audit-log', (req, res) => {
  db.saveAuditLog({ entries: [] });
  res.json({ message: 'Audit log cleared' });
});

module.exports = router;
