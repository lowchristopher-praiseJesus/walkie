const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readJSON(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeJSON(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getVolunteers: () => readJSON('volunteers.json'),
  saveVolunteers: (data) => writeJSON('volunteers.json', data),
  getWalkies: () => readJSON('walkies.json'),
  saveWalkies: (data) => writeJSON('walkies.json', data),
  getLiftCards: () => readJSON('liftCards.json'),
  saveLiftCards: (data) => writeJSON('liftCards.json', data),
  getConfig: () => readJSON('config.json'),
  saveConfig: (data) => writeJSON('config.json', data),
  getAuditLog: () => readJSON('auditLog.json') || { entries: [] },
  saveAuditLog: (data) => writeJSON('auditLog.json', data),
  addAuditEntry: (entry) => {
    const log = readJSON('auditLog.json') || { entries: [] };
    log.entries.push({
      ...entry,
      id: require('uuid').v4(),
      timestamp: new Date().toISOString()
    });
    writeJSON('auditLog.json', log);
  },
};
