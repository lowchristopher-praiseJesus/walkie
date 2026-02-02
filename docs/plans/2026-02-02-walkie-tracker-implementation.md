# Walkie Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-friendly web app for volunteers to sign out/return walkies at events with minimal clicks.

**Architecture:** React SPA frontend with Express.js backend. JSON file storage for volunteers, walkies, and config. PIN-protected admin interface.

**Tech Stack:** React 18, React Router, Express.js, Node.js, CSS Modules

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `server/package.json`
- Create: `client/package.json`
- Create: `.gitignore`

**Step 1: Initialize root package.json**

```bash
cd /Volumes/HomeX/Chris/Documents/walkie
npm init -y
```

**Step 2: Create server directory and package.json**

```bash
mkdir -p server
cd server && npm init -y && cd ..
```

**Step 3: Create React client with Vite**

```bash
npm create vite@latest client -- --template react
```

**Step 4: Install server dependencies**

```bash
cd server && npm install express cors uuid && cd ..
```

**Step 5: Install client dependencies**

```bash
cd client && npm install react-router-dom && npm install && cd ..
```

**Step 6: Create .gitignore**

```
node_modules/
dist/
.env
data/*.json
!data/.gitkeep
```

**Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: initial project setup with React + Express"
```

---

## Task 2: Data Layer Setup

**Files:**
- Create: `server/data/.gitkeep`
- Create: `server/data/volunteers.json`
- Create: `server/data/walkies.json`
- Create: `server/data/config.json`
- Create: `server/lib/db.js`

**Step 1: Create data directory and initial JSON files**

Create `server/data/volunteers.json`:
```json
{
  "volunteers": []
}
```

Create `server/data/walkies.json`:
```json
{
  "walkies": []
}
```

Create `server/data/config.json`:
```json
{
  "adminPin": "1234",
  "eventName": "Event"
}
```

**Step 2: Create database utility module**

Create `server/lib/db.js`:
```javascript
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
  getConfig: () => readJSON('config.json'),
  saveConfig: (data) => writeJSON('config.json', data),
};
```

**Step 3: Commit**

```bash
git add server/data server/lib/db.js
git commit -m "feat: add JSON data layer with db utility"
```

---

## Task 3: Express Server Setup

**Files:**
- Create: `server/index.js`
- Modify: `server/package.json` (add start script)

**Step 1: Create Express server**

Create `server/index.js`:
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 2: Add start script to server/package.json**

Add to scripts section:
```json
"scripts": {
  "start": "node index.js",
  "dev": "node --watch index.js"
}
```

**Step 3: Test server starts**

```bash
cd server && npm run dev
```

Expected: "Server running on port 3001"

**Step 4: Commit**

```bash
git add server/index.js server/package.json
git commit -m "feat: add Express server with health check endpoint"
```

---

## Task 4: Volunteers API

**Files:**
- Create: `server/routes/volunteers.js`
- Modify: `server/index.js`

**Step 1: Create volunteers routes**

Create `server/routes/volunteers.js`:
```javascript
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
```

**Step 2: Register routes in server/index.js**

Add after middleware setup:
```javascript
const volunteersRouter = require('./routes/volunteers');
app.use('/api/volunteers', volunteersRouter);
```

**Step 3: Test with curl**

```bash
curl http://localhost:3001/api/volunteers
```

Expected: `[]`

**Step 4: Commit**

```bash
git add server/routes/volunteers.js server/index.js
git commit -m "feat: add volunteers CRUD API"
```

---

## Task 5: Walkies API

**Files:**
- Create: `server/routes/walkies.js`
- Modify: `server/index.js`

**Step 1: Create walkies routes**

Create `server/routes/walkies.js`:
```javascript
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
```

**Step 2: Register routes in server/index.js**

Add after volunteers router:
```javascript
const walkiesRouter = require('./routes/walkies');
app.use('/api/walkies', walkiesRouter);
```

**Step 3: Commit**

```bash
git add server/routes/walkies.js server/index.js
git commit -m "feat: add walkies CRUD + sign-out/return API"
```

---

## Task 6: Admin API

**Files:**
- Create: `server/routes/admin.js`
- Modify: `server/index.js`

**Step 1: Create admin routes**

Create `server/routes/admin.js`:
```javascript
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
```

**Step 2: Register routes in server/index.js**

Add after walkies router:
```javascript
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);
```

**Step 3: Commit**

```bash
git add server/routes/admin.js server/index.js
git commit -m "feat: add admin PIN verification and config API"
```

---

## Task 7: React App Structure

**Files:**
- Modify: `client/src/App.jsx`
- Create: `client/src/App.css`
- Create: `client/src/api.js`
- Create: `client/src/context/AppContext.jsx`

**Step 1: Create API utility**

Create `client/src/api.js`:
```javascript
const API_BASE = 'http://localhost:3001/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Volunteers
  getVolunteers: () => fetchJSON('/volunteers'),
  addVolunteer: (data) => fetchJSON('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  updateVolunteer: (id, data) => fetchJSON(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolunteer: (id) => fetchJSON(`/volunteers/${id}`, { method: 'DELETE' }),

  // Walkies
  getWalkies: () => fetchJSON('/walkies'),
  addWalkie: (data) => fetchJSON('/walkies', { method: 'POST', body: JSON.stringify(data) }),
  updateWalkie: (id, data) => fetchJSON(`/walkies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWalkie: (id) => fetchJSON(`/walkies/${id}`, { method: 'DELETE' }),
  signOutWalkie: (walkieId, volunteerId) => fetchJSON('/walkies/sign-out', { method: 'POST', body: JSON.stringify({ walkieId, volunteerId }) }),
  returnWalkie: (id) => fetchJSON(`/walkies/return/${id}`, { method: 'POST' }),
  resetWalkies: () => fetchJSON('/walkies/reset', { method: 'POST' }),

  // Admin
  verifyPin: (pin) => fetchJSON('/admin/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  getConfig: () => fetchJSON('/admin/config'),
  updateConfig: (data) => fetchJSON('/admin/config', { method: 'PUT', body: JSON.stringify(data) }),
};
```

**Step 2: Create App Context**

Create `client/src/context/AppContext.jsx`:
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [volunteers, setVolunteers] = useState([]);
  const [walkies, setWalkies] = useState([]);
  const [config, setConfig] = useState({ eventName: 'Event' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const [vols, walks, cfg] = await Promise.all([
        api.getVolunteers(),
        api.getWalkies(),
        api.getConfig(),
      ]);
      setVolunteers(vols);
      setWalkies(walks);
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = {
    volunteers,
    walkies,
    config,
    isAdmin,
    setIsAdmin,
    loading,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
```

**Step 3: Update App.jsx with routing**

Replace `client/src/App.jsx`:
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import SignOut from './pages/SignOut';
import Return from './pages/Return';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/return" element={<Return />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
```

**Step 4: Create base App.css**

Replace `client/src/App.css`:
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 16px 0;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  color: #333;
}

.header .status {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.btn {
  display: block;
  width: 100%;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.1s, opacity 0.1s;
}

.btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-secondary {
  background: #34C759;
  color: white;
}

.btn-danger {
  background: #FF3B30;
  color: white;
}

.btn-outline {
  background: white;
  border: 2px solid #ddd;
  color: #333;
}

.btn-small {
  padding: 12px 16px;
  font-size: 14px;
  width: auto;
  display: inline-block;
}

.admin-link {
  text-align: center;
  margin-top: 32px;
}

.admin-link a {
  color: #666;
  font-size: 14px;
  text-decoration: none;
}

.back-link {
  margin-bottom: 16px;
}

.back-link a {
  color: #007AFF;
  text-decoration: none;
  font-size: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.tile {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  font-size: 24px;
  font-weight: 600;
  transition: transform 0.1s, border-color 0.1s;
}

.tile:active {
  transform: scale(0.95);
}

.tile.selected {
  border-color: #007AFF;
  background: #E5F1FF;
}

.tile .number {
  font-size: 28px;
}

.tile .name {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.letter-btn {
  padding: 16px 8px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.letter-btn:active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.volunteer-list {
  list-style: none;
}

.volunteer-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 16px;
  border: 2px solid transparent;
}

.volunteer-item:active {
  border-color: #007AFF;
}

.section-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.input {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
}

.input:focus {
  outline: none;
  border-color: #007AFF;
}

.pin-input {
  text-align: center;
  font-size: 32px;
  letter-spacing: 16px;
}

.message {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.message.success {
  background: #D4EDDA;
  color: #155724;
}

.message.error {
  background: #F8D7DA;
  color: #721C24;
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  background: #E5E5E5;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.tab.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.list-item-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: #666;
}
```

**Step 5: Commit**

```bash
git add client/src/
git commit -m "feat: add React app structure with routing and context"
```

---

## Task 8: Home Page

**Files:**
- Create: `client/src/pages/Home.jsx`

**Step 1: Create Home page**

Create `client/src/pages/Home.jsx`:
```javascript
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Home() {
  const { config, walkies, loading } = useApp();

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  const inUse = walkies.filter(w => w.assignedTo).length;
  const total = walkies.length;

  return (
    <div className="container">
      <div className="header">
        <h1>{config.eventName}</h1>
        <p className="status">
          {inUse} of {total} walkies in use
        </p>
      </div>

      <Link to="/sign-out">
        <button className="btn btn-primary">Sign Out Walkie</button>
      </Link>

      <Link to="/return">
        <button className="btn btn-secondary">Return Walkie</button>
      </Link>

      <div className="admin-link">
        <Link to="/admin">Admin</Link>
      </div>
    </div>
  );
}

export default Home;
```

**Step 2: Commit**

```bash
git add client/src/pages/Home.jsx
git commit -m "feat: add Home page component"
```

---

## Task 9: Sign Out Page

**Files:**
- Create: `client/src/pages/SignOut.jsx`

**Step 1: Create SignOut page**

Create `client/src/pages/SignOut.jsx`:
```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function SignOut() {
  const { volunteers, walkies, refresh } = useApp();
  const navigate = useNavigate();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [message, setMessage] = useState(null);

  const filteredVolunteers = selectedLetter
    ? volunteers.filter(v => v.lastName.toUpperCase().startsWith(selectedLetter))
    : [];

  const availableWalkies = walkies
    .filter(w => !w.assignedTo)
    .sort((a, b) => a.number - b.number);

  const handleSignOut = async (walkie) => {
    try {
      await api.signOutWalkie(walkie.id, selectedVolunteer.id);
      setMessage({ type: 'success', text: `Walkie ${walkie.number} signed out to ${selectedVolunteer.firstName}` });
      await refresh();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Step 1: Select letter
  if (!selectedLetter) {
    return (
      <div className="container">
        <div className="back-link">
          <Link to="/">&larr; Back</Link>
        </div>
        <h2 className="section-title">Select first letter of last name</h2>
        <div className="letter-grid">
          {LETTERS.map(letter => (
            <button
              key={letter}
              className="letter-btn"
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Select volunteer
  if (!selectedVolunteer) {
    return (
      <div className="container">
        <div className="back-link">
          <a href="#" onClick={(e) => { e.preventDefault(); setSelectedLetter(null); }}>
            &larr; Back to letters
          </a>
        </div>
        <h2 className="section-title">Select your name ({selectedLetter})</h2>
        {filteredVolunteers.length === 0 ? (
          <div className="empty-state">
            <p>No volunteers found with last name starting with "{selectedLetter}"</p>
          </div>
        ) : (
          <ul className="volunteer-list">
            {filteredVolunteers.map(v => (
              <li
                key={v.id}
                className="volunteer-item"
                onClick={() => setSelectedVolunteer(v)}
              >
                {v.lastName}, {v.firstName}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Step 3: Select walkie
  return (
    <div className="container">
      <div className="back-link">
        <a href="#" onClick={(e) => { e.preventDefault(); setSelectedVolunteer(null); }}>
          &larr; Back to volunteers
        </a>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <h2 className="section-title">
        Hi {selectedVolunteer.firstName}! Select a walkie
      </h2>

      {availableWalkies.length === 0 ? (
        <div className="empty-state">
          <p>No walkies available</p>
        </div>
      ) : (
        <div className="grid">
          {availableWalkies.map(w => (
            <div
              key={w.id}
              className="tile"
              onClick={() => handleSignOut(w)}
            >
              <span className="number">{w.number}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SignOut;
```

**Step 2: Commit**

```bash
git add client/src/pages/SignOut.jsx
git commit -m "feat: add SignOut page with letter filter and walkie selection"
```

---

## Task 10: Return Page

**Files:**
- Create: `client/src/pages/Return.jsx`

**Step 1: Create Return page**

Create `client/src/pages/Return.jsx`:
```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

function Return() {
  const { volunteers, walkies, refresh } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const checkedOutWalkies = walkies
    .filter(w => w.assignedTo)
    .sort((a, b) => a.number - b.number);

  const getVolunteerName = (volunteerId) => {
    const v = volunteers.find(vol => vol.id === volunteerId);
    return v ? `${v.firstName} ${v.lastName.charAt(0)}.` : 'Unknown';
  };

  const handleReturn = async (walkie) => {
    try {
      await api.returnWalkie(walkie.id);
      setMessage({ type: 'success', text: `Walkie ${walkie.number} returned` });
      await refresh();
      setTimeout(() => {
        if (checkedOutWalkies.length <= 1) {
          navigate('/');
        } else {
          setMessage(null);
        }
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="container">
      <div className="back-link">
        <Link to="/">&larr; Back</Link>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <h2 className="section-title">Tap walkie to return</h2>

      {checkedOutWalkies.length === 0 ? (
        <div className="empty-state">
          <p>No walkies are currently signed out</p>
        </div>
      ) : (
        <div className="grid">
          {checkedOutWalkies.map(w => (
            <div
              key={w.id}
              className="tile"
              onClick={() => handleReturn(w)}
            >
              <span className="number">{w.number}</span>
              <span className="name">{getVolunteerName(w.assignedTo)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Return;
```

**Step 2: Commit**

```bash
git add client/src/pages/Return.jsx
git commit -m "feat: add Return page showing checked-out walkies"
```

---

## Task 11: Admin Page

**Files:**
- Create: `client/src/pages/Admin.jsx`

**Step 1: Create Admin page**

Create `client/src/pages/Admin.jsx`:
```javascript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

function Admin() {
  const { volunteers, walkies, config, isAdmin, setIsAdmin, refresh } = useApp();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('volunteers');
  const [message, setMessage] = useState(null);

  // Form states
  const [newVolunteer, setNewVolunteer] = useState({ firstName: '', lastName: '', phone: '' });
  const [newWalkie, setNewWalkie] = useState({ number: '', notes: '' });
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editingWalkie, setEditingWalkie] = useState(null);
  const [eventName, setEventName] = useState(config.eventName);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.verifyPin(pin);
      setIsAdmin(true);
      setPinError(false);
    } catch {
      setPinError(true);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Volunteer handlers
  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    try {
      await api.addVolunteer(newVolunteer);
      setNewVolunteer({ firstName: '', lastName: '', phone: '' });
      await refresh();
      showMessage('success', 'Volunteer added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateVolunteer = async (e) => {
    e.preventDefault();
    try {
      await api.updateVolunteer(editingVolunteer.id, editingVolunteer);
      setEditingVolunteer(null);
      await refresh();
      showMessage('success', 'Volunteer updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!confirm('Delete this volunteer?')) return;
    try {
      await api.deleteVolunteer(id);
      await refresh();
      showMessage('success', 'Volunteer deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Walkie handlers
  const handleAddWalkie = async (e) => {
    e.preventDefault();
    try {
      await api.addWalkie({ ...newWalkie, number: parseInt(newWalkie.number) });
      setNewWalkie({ number: '', notes: '' });
      await refresh();
      showMessage('success', 'Walkie added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateWalkie = async (e) => {
    e.preventDefault();
    try {
      await api.updateWalkie(editingWalkie.id, {
        ...editingWalkie,
        number: parseInt(editingWalkie.number)
      });
      setEditingWalkie(null);
      await refresh();
      showMessage('success', 'Walkie updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteWalkie = async (id) => {
    if (!confirm('Delete this walkie?')) return;
    try {
      await api.deleteWalkie(id);
      await refresh();
      showMessage('success', 'Walkie deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleResetWalkies = async () => {
    if (!confirm('Reset all walkies? This will clear all sign-outs.')) return;
    try {
      await api.resetWalkies();
      await refresh();
      showMessage('success', 'All walkies reset');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateEventName = async () => {
    try {
      await api.updateConfig({ eventName });
      await refresh();
      showMessage('success', 'Event name updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // PIN screen
  if (!isAdmin) {
    return (
      <div className="container">
        <div className="back-link">
          <Link to="/">&larr; Back</Link>
        </div>
        <div className="header">
          <h1>Admin Access</h1>
        </div>
        <form onSubmit={handlePinSubmit}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className="input pin-input"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {pinError && <div className="message error">Invalid PIN</div>}
          <button type="submit" className="btn btn-primary">Enter</button>
        </form>
      </div>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const sortedWalkies = [...walkies].sort((a, b) => a.number - b.number);

  return (
    <div className="container">
      <div className="back-link">
        <Link to="/">&larr; Back</Link>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          Volunteers
        </button>
        <button
          className={`tab ${activeTab === 'walkies' ? 'active' : ''}`}
          onClick={() => setActiveTab('walkies')}
        >
          Walkies
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Volunteers Tab */}
      {activeTab === 'volunteers' && (
        <div>
          {editingVolunteer ? (
            <form onSubmit={handleUpdateVolunteer}>
              <h3 className="section-title">Edit Volunteer</h3>
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="input"
                  value={editingVolunteer.firstName}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="input"
                  value={editingVolunteer.lastName}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  className="input"
                  value={editingVolunteer.phone}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, phone: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditingVolunteer(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAddVolunteer}>
                <h3 className="section-title">Add Volunteer</h3>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    className="input"
                    value={newVolunteer.firstName}
                    onChange={(e) => setNewVolunteer({...newVolunteer, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    className="input"
                    value={newVolunteer.lastName}
                    onChange={(e) => setNewVolunteer({...newVolunteer, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    className="input"
                    value={newVolunteer.phone}
                    onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Volunteer</button>
              </form>

              <h3 className="section-title" style={{ marginTop: 24 }}>
                Volunteers ({volunteers.length})
              </h3>
              {sortedVolunteers.map(v => (
                <div key={v.id} className="list-item">
                  <span>{v.lastName}, {v.firstName}</span>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => setEditingVolunteer(v)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteVolunteer(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Walkies Tab */}
      {activeTab === 'walkies' && (
        <div>
          {editingWalkie ? (
            <form onSubmit={handleUpdateWalkie}>
              <h3 className="section-title">Edit Walkie</h3>
              <div className="form-group">
                <label>Number</label>
                <input
                  className="input"
                  type="number"
                  value={editingWalkie.number}
                  onChange={(e) => setEditingWalkie({...editingWalkie, number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  className="input"
                  value={editingWalkie.notes}
                  onChange={(e) => setEditingWalkie({...editingWalkie, notes: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditingWalkie(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAddWalkie}>
                <h3 className="section-title">Add Walkie</h3>
                <div className="form-group">
                  <label>Number</label>
                  <input
                    className="input"
                    type="number"
                    value={newWalkie.number}
                    onChange={(e) => setNewWalkie({...newWalkie, number: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <input
                    className="input"
                    value={newWalkie.notes}
                    onChange={(e) => setNewWalkie({...newWalkie, notes: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Walkie</button>
              </form>

              <h3 className="section-title" style={{ marginTop: 24 }}>
                Walkies ({walkies.length})
              </h3>
              {sortedWalkies.map(w => (
                <div key={w.id} className="list-item">
                  <span>
                    #{w.number}
                    {w.assignedTo && <span style={{ color: '#FF9500' }}> (in use)</span>}
                  </span>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => setEditingWalkie(w)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteWalkie(w.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h3 className="section-title">Event Settings</h3>
          <div className="form-group">
            <label>Event Name</label>
            <input
              className="input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleUpdateEventName}>
            Update Event Name
          </button>

          <h3 className="section-title" style={{ marginTop: 32 }}>Reset</h3>
          <button className="btn btn-danger" onClick={handleResetWalkies}>
            Reset All Walkies
          </button>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            This clears all sign-outs for a new event.
          </p>
        </div>
      )}
    </div>
  );
}

export default Admin;
```

**Step 2: Commit**

```bash
git add client/src/pages/Admin.jsx
git commit -m "feat: add Admin page with PIN protection and CRUD management"
```

---

## Task 12: Create pages index and finalize

**Files:**
- Create: `client/src/pages/index.js`
- Delete: `client/src/App.css` (default Vite one)
- Modify: `client/index.html` (viewport meta)

**Step 1: Create pages index**

Create `client/src/pages/index.js`:
```javascript
export { default as Home } from './Home';
export { default as SignOut } from './SignOut';
export { default as Return } from './Return';
export { default as Admin } from './Admin';
```

**Step 2: Update client/index.html for mobile**

Ensure the viewport meta is correct:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**Step 3: Remove unused Vite default files**

```bash
rm client/src/index.css client/public/vite.svg client/src/assets/react.svg
```

**Step 4: Update client/src/main.jsx**

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: finalize client setup and cleanup"
```

---

## Task 13: Add concurrent dev script to root

**Files:**
- Modify: `package.json` (root)

**Step 1: Install concurrently**

```bash
npm install concurrently --save-dev
```

**Step 2: Update root package.json scripts**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "start": "cd server && npm start"
  }
}
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add concurrent dev script"
```

---

## Task 14: Configure Vite proxy for API

**Files:**
- Modify: `client/vite.config.js`

**Step 1: Update Vite config**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 2: Update client/src/api.js to use relative URLs**

Change the API_BASE:
```javascript
const API_BASE = '/api';
```

**Step 3: Commit**

```bash
git add client/vite.config.js client/src/api.js
git commit -m "feat: configure Vite proxy for API calls"
```

---

## Task 15: Add production build and static serving

**Files:**
- Modify: `server/index.js`
- Modify: `package.json` (root)

**Step 1: Update server to serve static files in production**

Add to `server/index.js` after routes:
```javascript
const path = require('path');

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}
```

**Step 2: Add build scripts to root package.json**

```json
{
  "scripts": {
    "build": "cd client && npm run build",
    "start:prod": "NODE_ENV=production node server/index.js"
  }
}
```

**Step 3: Commit**

```bash
git add server/index.js package.json
git commit -m "feat: add production build and static file serving"
```

---

## Summary

After completing all tasks, run:

```bash
npm run dev
```

This starts both the server (port 3001) and client (port 5173). Access the app at `http://localhost:5173` on your mobile device (same network).

For production:
```bash
npm run build
npm run start:prod
```

Access at `http://localhost:3001`.
