import seedData from './data/seed.json';

function generateId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

const KEYS = {
  volunteers: 'walkie:volunteers',
  walkies: 'walkie:walkies',
  liftCards: 'walkie:liftCards',
  config: 'walkie:config',
  auditLog: 'walkie:auditLog',
  initialized: 'walkie:initialized',
};

function read(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initializeStorage() {
  if (localStorage.getItem(KEYS.initialized)) return;
  write(KEYS.volunteers, seedData.volunteers);
  write(KEYS.walkies, seedData.walkies);
  write(KEYS.liftCards, seedData.liftCards);
  write(KEYS.config, seedData.config);
  write(KEYS.auditLog, seedData.auditLog);
  localStorage.setItem(KEYS.initialized, '1');
}

function addAuditEntry(entry) {
  const log = read(KEYS.auditLog) || [];
  log.push({
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  });
  write(KEYS.auditLog, log);
}

export const storage = {
  // Volunteers
  getVolunteers() {
    return read(KEYS.volunteers) || [];
  },

  addVolunteer(data) {
    if (!data.firstName) throw new Error('firstName required');
    const volunteers = this.getVolunteers();
    const volunteer = {
      id: generateId(),
      firstName: data.firstName,
      lastName: data.lastName || '',
      phone: data.phone || '',
    };
    volunteers.push(volunteer);
    write(KEYS.volunteers, volunteers);
    return volunteer;
  },

  updateVolunteer(id, data) {
    const volunteers = this.getVolunteers();
    const index = volunteers.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Volunteer not found');
    volunteers[index] = {
      ...volunteers[index],
      firstName: data.firstName || volunteers[index].firstName,
      lastName: data.lastName !== undefined ? data.lastName : volunteers[index].lastName,
      phone: data.phone !== undefined ? data.phone : volunteers[index].phone,
    };
    write(KEYS.volunteers, volunteers);
    return volunteers[index];
  },

  deleteVolunteer(id) {
    const volunteers = this.getVolunteers();
    const index = volunteers.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Volunteer not found');
    volunteers.splice(index, 1);
    write(KEYS.volunteers, volunteers);
  },

  // Walkies
  getWalkies() {
    return read(KEYS.walkies) || [];
  },

  addWalkie(data) {
    if (data.number === undefined) throw new Error('number required');
    const walkies = this.getWalkies();
    if (walkies.some(w => w.number === data.number)) {
      throw new Error('Walkie number already exists');
    }
    const walkie = {
      id: generateId(),
      number: data.number,
      notes: data.notes || '',
      assignedTo: null,
      assignedAt: null,
      unusable: false,
    };
    walkies.push(walkie);
    write(KEYS.walkies, walkies);
    return walkie;
  },

  updateWalkie(id, data) {
    const walkies = this.getWalkies();
    const index = walkies.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Walkie not found');
    if (data.number !== undefined && data.number !== walkies[index].number) {
      if (walkies.some(w => w.number === data.number)) {
        throw new Error('Walkie number already exists');
      }
    }
    walkies[index] = {
      ...walkies[index],
      number: data.number !== undefined ? data.number : walkies[index].number,
      notes: data.notes !== undefined ? data.notes : walkies[index].notes,
      unusable: data.unusable !== undefined ? data.unusable : walkies[index].unusable,
    };
    write(KEYS.walkies, walkies);
    return walkies[index];
  },

  deleteWalkie(id) {
    const walkies = this.getWalkies();
    const index = walkies.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Walkie not found');
    walkies.splice(index, 1);
    write(KEYS.walkies, walkies);
  },

  toggleWalkieUnusable(id) {
    const walkies = this.getWalkies();
    const index = walkies.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Walkie not found');
    walkies[index].unusable = !walkies[index].unusable;
    write(KEYS.walkies, walkies);
    return walkies[index];
  },

  signOutWalkie(walkieId, volunteerId) {
    if (!walkieId || !volunteerId) throw new Error('walkieId and volunteerId required');
    const walkies = this.getWalkies();
    const index = walkies.findIndex(w => w.id === walkieId);
    if (index === -1) throw new Error('Walkie not found');
    if (walkies[index].assignedTo) throw new Error('Walkie already signed out');
    if (walkies[index].unusable) throw new Error('Walkie is marked as unusable');
    walkies[index].assignedTo = volunteerId;
    walkies[index].assignedAt = new Date().toISOString();
    write(KEYS.walkies, walkies);
    addAuditEntry({
      action: 'sign-out',
      itemType: 'walkie',
      itemNumber: walkies[index].number,
      volunteerId,
    });
    return walkies[index];
  },

  returnWalkie(id) {
    const walkies = this.getWalkies();
    const index = walkies.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Walkie not found');
    const previousVolunteerId = walkies[index].assignedTo;
    if (previousVolunteerId) {
      addAuditEntry({
        action: 'return',
        itemType: 'walkie',
        itemNumber: walkies[index].number,
        volunteerId: previousVolunteerId,
      });
    }
    walkies[index].assignedTo = null;
    walkies[index].assignedAt = null;
    write(KEYS.walkies, walkies);
    return walkies[index];
  },

  resetWalkies() {
    const walkies = this.getWalkies().map(w => ({
      ...w,
      assignedTo: null,
      assignedAt: null,
    }));
    write(KEYS.walkies, walkies);
  },

  // Lift Cards
  getLiftCards() {
    return read(KEYS.liftCards) || [];
  },

  addLiftCard(data) {
    if (data.number === undefined) throw new Error('number required');
    const liftCards = this.getLiftCards();
    if (liftCards.some(lc => lc.number === data.number)) {
      throw new Error('Lift card number already exists');
    }
    const liftCard = {
      id: generateId(),
      number: data.number,
      notes: data.notes || '',
      assignedTo: null,
      assignedAt: null,
      unusable: false,
    };
    liftCards.push(liftCard);
    write(KEYS.liftCards, liftCards);
    return liftCard;
  },

  updateLiftCard(id, data) {
    const liftCards = this.getLiftCards();
    const index = liftCards.findIndex(lc => lc.id === id);
    if (index === -1) throw new Error('Lift card not found');
    if (data.number !== undefined && data.number !== liftCards[index].number) {
      if (liftCards.some(lc => lc.number === data.number)) {
        throw new Error('Lift card number already exists');
      }
    }
    liftCards[index] = {
      ...liftCards[index],
      number: data.number !== undefined ? data.number : liftCards[index].number,
      notes: data.notes !== undefined ? data.notes : liftCards[index].notes,
      unusable: data.unusable !== undefined ? data.unusable : liftCards[index].unusable,
    };
    write(KEYS.liftCards, liftCards);
    return liftCards[index];
  },

  deleteLiftCard(id) {
    const liftCards = this.getLiftCards();
    const index = liftCards.findIndex(lc => lc.id === id);
    if (index === -1) throw new Error('Lift card not found');
    liftCards.splice(index, 1);
    write(KEYS.liftCards, liftCards);
  },

  toggleLiftCardUnusable(id) {
    const liftCards = this.getLiftCards();
    const index = liftCards.findIndex(lc => lc.id === id);
    if (index === -1) throw new Error('Lift card not found');
    liftCards[index].unusable = !liftCards[index].unusable;
    write(KEYS.liftCards, liftCards);
    return liftCards[index];
  },

  signOutLiftCard(liftCardId, volunteerId) {
    if (!liftCardId || !volunteerId) throw new Error('liftCardId and volunteerId required');
    const liftCards = this.getLiftCards();
    const index = liftCards.findIndex(lc => lc.id === liftCardId);
    if (index === -1) throw new Error('Lift card not found');
    if (liftCards[index].assignedTo) throw new Error('Lift card already signed out');
    if (liftCards[index].unusable) throw new Error('Lift card is marked as unusable');
    liftCards[index].assignedTo = volunteerId;
    liftCards[index].assignedAt = new Date().toISOString();
    write(KEYS.liftCards, liftCards);
    addAuditEntry({
      action: 'sign-out',
      itemType: 'lift-card',
      itemNumber: liftCards[index].number,
      volunteerId,
    });
    return liftCards[index];
  },

  returnLiftCard(id) {
    const liftCards = this.getLiftCards();
    const index = liftCards.findIndex(lc => lc.id === id);
    if (index === -1) throw new Error('Lift card not found');
    const previousVolunteerId = liftCards[index].assignedTo;
    if (previousVolunteerId) {
      addAuditEntry({
        action: 'return',
        itemType: 'lift-card',
        itemNumber: liftCards[index].number,
        volunteerId: previousVolunteerId,
      });
    }
    liftCards[index].assignedTo = null;
    liftCards[index].assignedAt = null;
    write(KEYS.liftCards, liftCards);
    return liftCards[index];
  },

  resetLiftCards() {
    const liftCards = this.getLiftCards().map(lc => ({
      ...lc,
      assignedTo: null,
      assignedAt: null,
    }));
    write(KEYS.liftCards, liftCards);
  },

  // Admin
  verifyPin(pin) {
    const config = read(KEYS.config) || {};
    if (pin !== config.adminPin) throw new Error('Invalid PIN');
    return { valid: true };
  },

  getConfig() {
    const config = read(KEYS.config) || {};
    return { eventName: config.eventName, theme: config.theme || 'default' };
  },

  updateConfig(data) {
    const config = read(KEYS.config) || {};
    if (data.eventName !== undefined) config.eventName = data.eventName;
    if (data.adminPin !== undefined) config.adminPin = data.adminPin;
    if (data.theme !== undefined) config.theme = data.theme;
    write(KEYS.config, config);
    return { eventName: config.eventName, theme: config.theme || 'default' };
  },

  getAuditLog() {
    const entries = read(KEYS.auditLog) || [];
    const volunteers = this.getVolunteers();
    const enriched = entries.map(entry => {
      const volunteer = volunteers.find(v => v.id === entry.volunteerId);
      return {
        ...entry,
        volunteerName: volunteer ? `${volunteer.firstName} ${volunteer.lastName}`.trim() : 'Unknown',
      };
    });
    enriched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return enriched;
  },

  clearAuditLog() {
    write(KEYS.auditLog, []);
  },
};
