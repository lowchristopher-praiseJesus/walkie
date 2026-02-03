# UI Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Walkie Tracker app with Tailwind CSS, shadcn/ui components, and a dark-first theme while preserving all existing functionality.

**Architecture:** Replace plain CSS with Tailwind utility classes and CSS variables for theming. Add shadcn/ui components (Button, Input, Card, Tabs, Badge, Alert) to `components/ui/`. Update all 4 pages to use new components and dark theme styling.

**Tech Stack:** Tailwind CSS v4 (via @tailwindcss/vite), shadcn/ui, React 19, Vite 7

---

### Task 1: Install Tailwind CSS

**Files:**
- Modify: `client/package.json`
- Modify: `client/vite.config.js`
- Create: `client/src/index.css`
- Modify: `client/src/main.jsx`

**Step 1: Install Tailwind CSS and Vite plugin**

Run:
```bash
cd /Volumes/HomeX/Chris/Documents/walkie/client && npm install tailwindcss @tailwindcss/vite
```

**Step 2: Update vite.config.js to use Tailwind plugin**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 3: Create src/index.css with Tailwind imports and CSS variables**

```css
@import "tailwindcss";

@theme {
  --color-primary: #007AFF;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-danger: #FF3B30;
  --color-gold: #F9A825;
}

@layer base {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 211 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 142 71% 45%;
    --secondary-foreground: 0 0% 100%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 211 100% 50%;
    --radius: 0.75rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-zinc-950 text-zinc-100 font-sans antialiased;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}
```

**Step 4: Update main.jsx to import index.css instead of App.css**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Verify Tailwind is working**

Run:
```bash
cd /Volumes/HomeX/Chris/Documents/walkie && npm run dev
```
Expected: App loads with dark background (zinc-950)

**Step 6: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.js client/src/index.css client/src/main.jsx
git commit -m "feat: add Tailwind CSS with dark theme"
```

---

### Task 2: Create shadcn/ui Button Component

**Files:**
- Create: `client/src/components/ui/button.jsx`
- Create: `client/src/lib/utils.js`

**Step 1: Create utility function for class merging**

Create `client/src/lib/utils.js`:
```javascript
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
```

**Step 2: Create Button component**

Create `client/src/components/ui/button.jsx`:
```jsx
import { cn } from '../../lib/utils'

const buttonVariants = {
  variant: {
    default: 'bg-[--color-primary] text-white hover:bg-[--color-primary]/90',
    secondary: 'bg-[--color-success] text-white hover:bg-[--color-success]/90',
    destructive: 'bg-[--color-danger] text-white hover:bg-[--color-danger]/90',
    outline: 'border-2 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800',
    ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
  },
  size: {
    default: 'h-12 px-6 text-base',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-20 px-8 text-xl',
  },
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-100',
        'active:scale-[0.98] active:opacity-90',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Step 3: Commit**

```bash
git add client/src/lib/utils.js client/src/components/ui/button.jsx
git commit -m "feat: add Button component"
```

---

### Task 3: Create shadcn/ui Input Component

**Files:**
- Create: `client/src/components/ui/input.jsx`

**Step 1: Create Input component**

Create `client/src/components/ui/input.jsx`:
```jsx
import { cn } from '../../lib/utils'

export function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-lg border-2 border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100',
        'placeholder:text-zinc-500',
        'focus:outline-none focus:border-[--color-primary]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export function PinInput({ className, ...props }) {
  return (
    <Input
      className={cn(
        'text-center text-3xl tracking-[1rem] font-mono',
        className
      )}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={4}
      {...props}
    />
  )
}
```

**Step 2: Commit**

```bash
git add client/src/components/ui/input.jsx
git commit -m "feat: add Input component"
```

---

### Task 4: Create shadcn/ui Card Component

**Files:**
- Create: `client/src/components/ui/card.jsx`

**Step 1: Create Card component**

Create `client/src/components/ui/card.jsx`:
```jsx
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-zinc-800 bg-zinc-900 p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-zinc-100', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('text-zinc-300', className)} {...props}>
      {children}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add client/src/components/ui/card.jsx
git commit -m "feat: add Card component"
```

---

### Task 5: Create shadcn/ui Tabs Component

**Files:**
- Create: `client/src/components/ui/tabs.jsx`

**Step 1: Create Tabs component**

Create `client/src/components/ui/tabs.jsx`:
```jsx
import { cn } from '../../lib/utils'

export function Tabs({ className, children, ...props }) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex rounded-lg bg-zinc-800 p-1 mb-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ className, active, children, ...props }) {
  return (
    <button
      className={cn(
        'flex-1 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
        active
          ? 'bg-zinc-900 text-zinc-100 shadow-sm'
          : 'text-zinc-400 hover:text-zinc-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add client/src/components/ui/tabs.jsx
git commit -m "feat: add Tabs component"
```

---

### Task 6: Create Badge and Alert Components

**Files:**
- Create: `client/src/components/ui/badge.jsx`
- Create: `client/src/components/ui/alert.jsx`

**Step 1: Create Badge component**

Create `client/src/components/ui/badge.jsx`:
```jsx
import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-zinc-700 text-zinc-100',
  warning: 'bg-[--color-warning]/20 text-[--color-warning]',
  success: 'bg-[--color-success]/20 text-[--color-success]',
  danger: 'bg-[--color-danger]/20 text-[--color-danger]',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

**Step 2: Create Alert component**

Create `client/src/components/ui/alert.jsx`:
```jsx
import { cn } from '../../lib/utils'

const alertVariants = {
  success: 'bg-[--color-success]/10 border-[--color-success]/20 text-[--color-success]',
  error: 'bg-[--color-danger]/10 border-[--color-danger]/20 text-[--color-danger]',
}

export function Alert({ className, variant = 'success', children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 text-center text-sm font-medium',
        alertVariants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add client/src/components/ui/badge.jsx client/src/components/ui/alert.jsx
git commit -m "feat: add Badge and Alert components"
```

---

### Task 7: Create Component Index

**Files:**
- Create: `client/src/components/ui/index.js`

**Step 1: Create barrel export**

Create `client/src/components/ui/index.js`:
```javascript
export { Button } from './button'
export { Input, PinInput } from './input'
export { Card, CardHeader, CardTitle, CardContent } from './card'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
export { Badge } from './badge'
export { Alert } from './alert'
```

**Step 2: Commit**

```bash
git add client/src/components/ui/index.js
git commit -m "feat: add component barrel export"
```

---

### Task 8: Update Home Page

**Files:**
- Modify: `client/src/pages/Home.jsx`

**Step 1: Rewrite Home.jsx with Tailwind and new components**

```jsx
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';

function Home() {
  const { config, walkies, liftCards, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Loading...</h1>
        </div>
      </div>
    );
  }

  const walkiesInUse = walkies.filter(w => w.assignedTo).length;
  const liftCardsInUse = liftCards.filter(lc => lc.assignedTo).length;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <header className="text-center py-6 mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">{config.eventName}</h1>
          <p className="text-zinc-400 mt-2">
            {walkiesInUse} {walkiesInUse === 1 ? 'walkie' : 'walkies'}, {liftCardsInUse} {liftCardsInUse === 1 ? 'lift card' : 'lift cards'} issued
          </p>
        </header>

        <div className="space-y-4">
          <Link to="/sign-out" className="block">
            <Button variant="default" size="lg" className="w-full">
              Collect Walkie / Lift Card
            </Button>
          </Link>

          <Link to="/return" className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Return Walkie / Lift Card
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link to="/admin" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
```

**Step 2: Verify the page renders correctly**

Run:
```bash
cd /Volumes/HomeX/Chris/Documents/walkie && npm run dev
```
Check: Home page has dark background, styled buttons

**Step 3: Commit**

```bash
git add client/src/pages/Home.jsx
git commit -m "feat: update Home page with Tailwind styling"
```

---

### Task 9: Update SignOut Page

**Files:**
- Modify: `client/src/pages/SignOut.jsx`

**Step 1: Rewrite SignOut.jsx with Tailwind and new components**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Button, Alert, Badge } from '../components/ui';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WALKIES = 2;
const MAX_LIFT_CARDS = 2;

function SignOut() {
  const { volunteers, walkies, liftCards, refresh } = useApp();
  const navigate = useNavigate();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedWalkies, setSelectedWalkies] = useState([]);
  const [selectedLiftCards, setSelectedLiftCards] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredVolunteers = selectedLetter
    ? volunteers.filter(v => v.firstName.toUpperCase().startsWith(selectedLetter))
    : [];

  const availableWalkies = walkies
    .filter(w => !w.assignedTo && !w.unusable)
    .sort((a, b) => a.number - b.number);

  const availableLiftCards = liftCards
    .filter(lc => !lc.assignedTo && !lc.unusable)
    .sort((a, b) => a.number - b.number);

  const getAssignedWalkies = (volunteerId) => {
    return walkies
      .filter(w => w.assignedTo === volunteerId)
      .map(w => w.number)
      .sort((a, b) => a - b);
  };

  const getAssignedLiftCards = (volunteerId) => {
    return liftCards
      .filter(lc => lc.assignedTo === volunteerId)
      .map(lc => lc.number)
      .sort((a, b) => a - b);
  };

  const toggleWalkie = (walkie) => {
    const isSelected = selectedWalkies.some(w => w.id === walkie.id);
    if (isSelected) {
      setSelectedWalkies(selectedWalkies.filter(w => w.id !== walkie.id));
    } else if (selectedWalkies.length < MAX_WALKIES) {
      setSelectedWalkies([...selectedWalkies, walkie]);
    }
  };

  const toggleLiftCard = (liftCard) => {
    const isSelected = selectedLiftCards.some(lc => lc.id === liftCard.id);
    if (isSelected) {
      setSelectedLiftCards(selectedLiftCards.filter(lc => lc.id !== liftCard.id));
    } else if (selectedLiftCards.length < MAX_LIFT_CARDS) {
      setSelectedLiftCards([...selectedLiftCards, liftCard]);
    }
  };

  const handleDone = async () => {
    if (selectedWalkies.length === 0 && selectedLiftCards.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one item' });
      return;
    }

    setSubmitting(true);
    try {
      const results = [];

      for (const walkie of selectedWalkies) {
        await api.signOutWalkie(walkie.id, selectedVolunteer.id);
        results.push(`Walkie #${walkie.number}`);
      }

      for (const liftCard of selectedLiftCards) {
        await api.signOutLiftCard(liftCard.id, selectedVolunteer.id);
        results.push(`Lift Card #${liftCard.number}`);
      }

      setMessage({ type: 'success', text: `${results.join(', ')} signed out to ${selectedVolunteer.firstName}` });
      await refresh();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setSubmitting(false);
    }
  };

  const formatSelectedNumbers = (items) => {
    return items.map(item => `#${item.number}`).join(', ');
  };

  // Step 1: Select letter
  if (!selectedLetter) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <Link to="/" className="text-[--color-primary] hover:underline text-base mb-4 inline-block">
            &larr; Back
          </Link>
          <h2 className="text-zinc-400 text-base mb-4">Type the first letter of your name</h2>
          <div className="grid grid-cols-6 gap-2">
            {LETTERS.map(letter => (
              <button
                key={letter}
                className="aspect-square flex items-center justify-center text-lg font-semibold bg-zinc-800 border-2 border-zinc-700 rounded-lg text-zinc-100 hover:bg-zinc-700 active:bg-[--color-primary] active:border-[--color-primary] transition-colors"
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select volunteer
  if (!selectedVolunteer) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <button
            onClick={() => setSelectedLetter(null)}
            className="text-[--color-primary] hover:underline text-base mb-4"
          >
            &larr; Back to letters
          </button>
          <h2 className="text-zinc-400 text-base mb-4">Select your name ({selectedLetter})</h2>
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No servers found with first name starting with "{selectedLetter}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVolunteers.map(v => {
                const assignedWalkies = getAssignedWalkies(v.id);
                const assignedLiftCards = getAssignedLiftCards(v.id);
                const hasEquipment = assignedWalkies.length > 0 || assignedLiftCards.length > 0;
                return (
                  <button
                    key={v.id}
                    className="w-full text-left p-4 bg-zinc-800 rounded-lg border-2 border-transparent hover:border-zinc-600 active:border-[--color-primary] transition-colors"
                    onClick={() => setSelectedVolunteer(v)}
                  >
                    <span className="text-zinc-100">{v.firstName} {v.lastName}</span>
                    {hasEquipment && (
                      <Badge variant="warning" className="ml-2">
                        has {[
                          assignedWalkies.length > 0 && `walkie${assignedWalkies.length > 1 ? 's' : ''} #${assignedWalkies.join(', #')}`,
                          assignedLiftCards.length > 0 && `lift card${assignedLiftCards.length > 1 ? 's' : ''} #${assignedLiftCards.join(', #')}`
                        ].filter(Boolean).join(', ')}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Select equipment
  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <button
          onClick={() => { setSelectedVolunteer(null); setSelectedWalkies([]); setSelectedLiftCards([]); }}
          className="text-[--color-primary] hover:underline text-base mb-4"
        >
          &larr; Back to servers
        </button>

        {message && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <h2 className="text-zinc-400 text-base mb-4">
          Hi {selectedVolunteer.firstName}! Select your equipment
        </h2>

        {/* Walkies Section */}
        <h3 className="text-zinc-500 text-sm font-medium mt-4 mb-2 flex items-center gap-2">
          Walkies (up to {MAX_WALKIES})
          {selectedWalkies.length > 0 && (
            <Badge variant="success">{formatSelectedNumbers(selectedWalkies)} selected</Badge>
          )}
        </h3>
        {availableWalkies.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            <p>No walkies available</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
            {availableWalkies.map(w => {
              const isSelected = selectedWalkies.some(sw => sw.id === w.id);
              const isDisabled = !isSelected && selectedWalkies.length >= MAX_WALKIES;
              return (
                <button
                  key={w.id}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                    isSelected
                      ? 'bg-[--color-success] border-[--color-success] text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-500'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  onClick={() => !isDisabled && toggleWalkie(w)}
                  disabled={isDisabled}
                >
                  {w.number}
                </button>
              );
            })}
          </div>
        )}

        {/* Lift Cards Section */}
        <h3 className="text-zinc-500 text-sm font-medium mt-6 mb-2 flex items-center gap-2">
          Lift Cards (up to {MAX_LIFT_CARDS}, optional)
          {selectedLiftCards.length > 0 && (
            <Badge variant="success">{formatSelectedNumbers(selectedLiftCards)} selected</Badge>
          )}
        </h3>
        {availableLiftCards.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            <p>No lift cards available</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
            {availableLiftCards.map(lc => {
              const isSelected = selectedLiftCards.some(slc => slc.id === lc.id);
              const isDisabled = !isSelected && selectedLiftCards.length >= MAX_LIFT_CARDS;
              return (
                <button
                  key={lc.id}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                    isSelected
                      ? 'bg-[--color-success] border-[--color-success] text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-500'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  onClick={() => !isDisabled && toggleLiftCard(lc)}
                  disabled={isDisabled}
                >
                  {lc.number}
                </button>
              );
            })}
          </div>
        )}

        {/* Done Button */}
        <Button
          variant="default"
          className="w-full mt-6"
          onClick={handleDone}
          disabled={submitting || (selectedWalkies.length === 0 && selectedLiftCards.length === 0)}
        >
          {submitting ? 'Signing out...' : 'Done'}
        </Button>
      </div>
    </div>
  );
}

export default SignOut;
```

**Step 2: Verify the page renders correctly**

Check: All 3 steps work with dark styling

**Step 3: Commit**

```bash
git add client/src/pages/SignOut.jsx
git commit -m "feat: update SignOut page with Tailwind styling"
```

---

### Task 10: Update Return Page

**Files:**
- Modify: `client/src/pages/Return.jsx`

**Step 1: Rewrite Return.jsx with Tailwind and new components**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Alert } from '../components/ui';

const STORAGE_KEY = 'returnPageState';

function getStoredState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

function saveState(initialItems, returnedItems) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ initialItems, returnedItems }));
}

function Return() {
  const { volunteers, walkies, liftCards, refresh } = useApp();
  const [message, setMessage] = useState(null);

  // Initialize state from sessionStorage or current data
  const [state, setState] = useState(() => {
    const stored = getStoredState();
    if (stored) {
      return stored;
    }
    return {
      initialItems: {
        walkies: walkies.filter(w => w.assignedTo).map(w => ({ ...w })),
        liftCards: liftCards.filter(lc => lc.assignedTo).map(lc => ({ ...lc }))
      },
      returnedItems: {
        walkies: {},
        liftCards: {}
      }
    };
  });

  const { initialItems, returnedItems } = state;

  // Sync state with server data: add new items, update re-assigned items
  useEffect(() => {
    setState(prev => {
      const currentWalkieIds = new Set(prev.initialItems.walkies.map(w => w.id));
      const currentLiftCardIds = new Set(prev.initialItems.liftCards.map(lc => lc.id));

      // Find newly checked-out items
      const newWalkies = walkies.filter(w => w.assignedTo && !currentWalkieIds.has(w.id));
      const newLiftCards = liftCards.filter(lc => lc.assignedTo && !currentLiftCardIds.has(lc.id));

      // Find items that were returned but have been re-assigned to someone else
      const reAssignedWalkieIds = new Set();
      const reAssignedLiftCardIds = new Set();

      walkies.forEach(w => {
        if (w.assignedTo && prev.returnedItems.walkies[w.id]) {
          reAssignedWalkieIds.add(w.id);
        }
      });

      liftCards.forEach(lc => {
        if (lc.assignedTo && prev.returnedItems.liftCards[lc.id]) {
          reAssignedLiftCardIds.add(lc.id);
        }
      });

      const hasNewItems = newWalkies.length > 0 || newLiftCards.length > 0;
      const hasReAssignments = reAssignedWalkieIds.size > 0 || reAssignedLiftCardIds.size > 0;

      if (!hasNewItems && !hasReAssignments) {
        return prev;
      }

      let updatedWalkies = prev.initialItems.walkies.map(w => {
        if (reAssignedWalkieIds.has(w.id)) {
          const current = walkies.find(cw => cw.id === w.id);
          return current ? { ...current } : w;
        }
        return w;
      });
      updatedWalkies = [...updatedWalkies, ...newWalkies.map(w => ({ ...w }))];

      let updatedLiftCards = prev.initialItems.liftCards.map(lc => {
        if (reAssignedLiftCardIds.has(lc.id)) {
          const current = liftCards.find(clc => clc.id === lc.id);
          return current ? { ...current } : lc;
        }
        return lc;
      });
      updatedLiftCards = [...updatedLiftCards, ...newLiftCards.map(lc => ({ ...lc }))];

      const updatedReturnedWalkies = { ...prev.returnedItems.walkies };
      const updatedReturnedLiftCards = { ...prev.returnedItems.liftCards };
      reAssignedWalkieIds.forEach(id => delete updatedReturnedWalkies[id]);
      reAssignedLiftCardIds.forEach(id => delete updatedReturnedLiftCards[id]);

      const updated = {
        initialItems: {
          walkies: updatedWalkies,
          liftCards: updatedLiftCards
        },
        returnedItems: {
          walkies: updatedReturnedWalkies,
          liftCards: updatedReturnedLiftCards
        }
      };

      saveState(updated.initialItems, updated.returnedItems);
      return updated;
    });
  }, [walkies, liftCards]);

  const checkedOutWalkies = [...initialItems.walkies].sort((a, b) => a.number - b.number);
  const checkedOutLiftCards = [...initialItems.liftCards].sort((a, b) => a.number - b.number);
  const totalCheckedOut = checkedOutWalkies.length + checkedOutLiftCards.length;

  const getVolunteerName = (volunteerId) => {
    const v = volunteers.find(vol => vol.id === volunteerId);
    return v ? `${v.firstName} ${v.lastName.charAt(0)}.` : 'Unknown';
  };

  const handleWalkieClick = async (walkie) => {
    const isReturned = returnedItems.walkies[walkie.id];

    if (isReturned) {
      try {
        await api.signOutWalkie(walkie.id, isReturned);
        setState(prev => {
          const { [walkie.id]: _, ...rest } = prev.returnedItems.walkies;
          const updated = { ...prev, returnedItems: { ...prev.returnedItems, walkies: rest } };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Walkie #${walkie.number} restored` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      try {
        await api.returnWalkie(walkie.id);
        setState(prev => {
          const updated = {
            ...prev,
            returnedItems: {
              ...prev.returnedItems,
              walkies: { ...prev.returnedItems.walkies, [walkie.id]: walkie.assignedTo }
            }
          };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Walkie #${walkie.number} returned` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
  };

  const handleLiftCardClick = async (liftCard) => {
    const isReturned = returnedItems.liftCards[liftCard.id];

    if (isReturned) {
      try {
        await api.signOutLiftCard(liftCard.id, isReturned);
        setState(prev => {
          const { [liftCard.id]: _, ...rest } = prev.returnedItems.liftCards;
          const updated = { ...prev, returnedItems: { ...prev.returnedItems, liftCards: rest } };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Lift Card #${liftCard.number} restored` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      try {
        await api.returnLiftCard(liftCard.id);
        setState(prev => {
          const updated = {
            ...prev,
            returnedItems: {
              ...prev.returnedItems,
              liftCards: { ...prev.returnedItems.liftCards, [liftCard.id]: liftCard.assignedTo }
            }
          };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Lift Card #${liftCard.number} returned` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <Link to="/" className="text-[--color-primary] hover:underline text-base mb-4 inline-block">
          &larr; Back
        </Link>

        {message && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <h2 className="text-zinc-400 text-base mb-4">Tap item to return</h2>

        {totalCheckedOut === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No equipment is currently signed out</p>
          </div>
        ) : (
          <>
            {/* Walkies Section */}
            {checkedOutWalkies.length > 0 && (
              <>
                <h3 className="text-zinc-500 text-sm font-medium mt-4 mb-2">
                  Walkies ({checkedOutWalkies.length})
                </h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
                  {checkedOutWalkies.map(w => {
                    const isReturned = returnedItems.walkies[w.id];
                    return (
                      <button
                        key={w.id}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
                          isReturned
                            ? 'opacity-40 bg-zinc-700 border-zinc-600 line-through'
                            : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                        }`}
                        onClick={() => handleWalkieClick(w)}
                      >
                        <span className="text-2xl font-bold text-zinc-100">{w.number}</span>
                        <span className="text-xs text-zinc-400 mt-1 px-1 truncate max-w-full">
                          {getVolunteerName(w.assignedTo)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Lift Cards Section */}
            {checkedOutLiftCards.length > 0 && (
              <>
                <h3 className="text-zinc-500 text-sm font-medium mt-6 mb-2">
                  Lift Cards ({checkedOutLiftCards.length})
                </h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
                  {checkedOutLiftCards.map(lc => {
                    const isReturned = returnedItems.liftCards[lc.id];
                    return (
                      <button
                        key={lc.id}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
                          isReturned
                            ? 'opacity-40 bg-zinc-700 border-zinc-600 line-through'
                            : 'bg-amber-900/30 border-[--color-gold] hover:border-amber-400'
                        }`}
                        onClick={() => handleLiftCardClick(lc)}
                      >
                        <span className="text-2xl font-bold text-zinc-100">{lc.number}</span>
                        <span className="text-xs text-zinc-400 mt-1 px-1 truncate max-w-full">
                          {getVolunteerName(lc.assignedTo)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Return;
```

**Step 2: Verify the page renders correctly**

Check: Tiles show with dark styling, gold accent on lift cards, strikethrough on returned items

**Step 3: Commit**

```bash
git add client/src/pages/Return.jsx
git commit -m "feat: update Return page with Tailwind styling"
```

---

### Task 11: Update Admin Page

**Files:**
- Modify: `client/src/pages/Admin.jsx`

**Step 1: Rewrite Admin.jsx with Tailwind and new components**

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Button, Input, PinInput, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, Alert, Badge } from '../components/ui';

function Admin() {
  const { volunteers, walkies, liftCards, config, isAdmin, setIsAdmin, refresh } = useApp();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('volunteers');
  const [message, setMessage] = useState(null);

  // Form states
  const [newVolunteer, setNewVolunteer] = useState({ firstName: '', lastName: '', phone: '' });
  const [newWalkie, setNewWalkie] = useState({ number: '', notes: '' });
  const [newLiftCard, setNewLiftCard] = useState({ number: '', notes: '' });
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editingWalkie, setEditingWalkie] = useState(null);
  const [editingLiftCard, setEditingLiftCard] = useState(null);
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
      showMessage('success', 'Server added');
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
      showMessage('success', 'Server updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!confirm('Delete this server?')) return;
    try {
      await api.deleteVolunteer(id);
      await refresh();
      showMessage('success', 'Server deleted');
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

  const handleToggleWalkieUnusable = async (id) => {
    try {
      await api.toggleWalkieUnusable(id);
      await refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Lift Card handlers
  const handleAddLiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.addLiftCard({ ...newLiftCard, number: parseInt(newLiftCard.number) });
      setNewLiftCard({ number: '', notes: '' });
      await refresh();
      showMessage('success', 'Lift card added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateLiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.updateLiftCard(editingLiftCard.id, {
        ...editingLiftCard,
        number: parseInt(editingLiftCard.number)
      });
      setEditingLiftCard(null);
      await refresh();
      showMessage('success', 'Lift card updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteLiftCard = async (id) => {
    if (!confirm('Delete this lift card?')) return;
    try {
      await api.deleteLiftCard(id);
      await refresh();
      showMessage('success', 'Lift card deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleToggleLiftCardUnusable = async (id) => {
    try {
      await api.toggleLiftCardUnusable(id);
      await refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleResetAllEquipment = async () => {
    if (!confirm('Reset all equipment? This will clear all sign-outs for walkies and lift cards.')) return;
    try {
      await Promise.all([
        api.resetWalkies(),
        api.resetLiftCards()
      ]);
      sessionStorage.removeItem('returnPageState');
      await refresh();
      showMessage('success', 'All equipment reset');
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
      <div className="min-h-screen flex flex-col">
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <Link to="/" className="text-[--color-primary] hover:underline text-base mb-4 inline-block">
            &larr; Back
          </Link>
          <header className="text-center py-6 mb-8">
            <h1 className="text-2xl font-bold text-zinc-100">Admin Access</h1>
          </header>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <PinInput
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && <Alert variant="error">Invalid PIN</Alert>}
            <Button type="submit" className="w-full">Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const sortedWalkies = [...walkies].sort((a, b) => a.number - b.number);
  const sortedLiftCards = [...liftCards].sort((a, b) => a.number - b.number);

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <Link to="/" className="text-[--color-primary] hover:underline text-base mb-4 inline-block">
          &larr; Back
        </Link>

        {message && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <Tabs>
          <TabsList>
            <TabsTrigger active={activeTab === 'volunteers'} onClick={() => setActiveTab('volunteers')}>
              Servers
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'walkies'} onClick={() => setActiveTab('walkies')}>
              Walkies
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'liftCards'} onClick={() => setActiveTab('liftCards')}>
              Lift Cards
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div>
              {editingVolunteer ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Server</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateVolunteer} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                        <Input
                          value={editingVolunteer.firstName}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Last Name (optional)</label>
                        <Input
                          value={editingVolunteer.lastName}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, lastName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Phone (optional)</label>
                        <Input
                          value={editingVolunteer.phone}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, phone: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingVolunteer(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Server</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddVolunteer} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                          <Input
                            value={newVolunteer.firstName}
                            onChange={(e) => setNewVolunteer({...newVolunteer, firstName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Last Name (optional)</label>
                          <Input
                            value={newVolunteer.lastName}
                            onChange={(e) => setNewVolunteer({...newVolunteer, lastName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Phone (optional)</label>
                          <Input
                            value={newVolunteer.phone}
                            onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Server</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Servers ({volunteers.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedVolunteers.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100">{v.lastName}, {v.firstName}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingVolunteer(v)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteVolunteer(v.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Walkies Tab */}
          {activeTab === 'walkies' && (
            <div>
              {editingWalkie ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Walkie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateWalkie} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Number</label>
                        <Input
                          type="number"
                          value={editingWalkie.number}
                          onChange={(e) => setEditingWalkie({...editingWalkie, number: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                        <Input
                          value={editingWalkie.notes}
                          onChange={(e) => setEditingWalkie({...editingWalkie, notes: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingWalkie(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Walkie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddWalkie} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Number</label>
                          <Input
                            type="number"
                            value={newWalkie.number}
                            onChange={(e) => setNewWalkie({...newWalkie, number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                          <Input
                            value={newWalkie.notes}
                            onChange={(e) => setNewWalkie({...newWalkie, notes: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Walkie</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Walkies ({walkies.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedWalkies.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100 flex items-center gap-2">
                          #{w.number}
                          {w.assignedTo && <Badge variant="warning">in use</Badge>}
                          {w.unusable && <Badge variant="danger">unusable</Badge>}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={w.unusable ? 'secondary' : 'outline'}
                            className={!w.unusable ? 'bg-[--color-warning] text-white hover:bg-[--color-warning]/90' : ''}
                            onClick={() => handleToggleWalkieUnusable(w.id)}
                          >
                            {w.unusable ? 'Enable' : 'Disable'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingWalkie(w)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteWalkie(w.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lift Cards Tab */}
          {activeTab === 'liftCards' && (
            <div>
              {editingLiftCard ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Lift Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateLiftCard} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Number</label>
                        <Input
                          type="number"
                          value={editingLiftCard.number}
                          onChange={(e) => setEditingLiftCard({...editingLiftCard, number: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                        <Input
                          value={editingLiftCard.notes}
                          onChange={(e) => setEditingLiftCard({...editingLiftCard, notes: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingLiftCard(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Lift Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddLiftCard} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Number</label>
                          <Input
                            type="number"
                            value={newLiftCard.number}
                            onChange={(e) => setNewLiftCard({...newLiftCard, number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                          <Input
                            value={newLiftCard.notes}
                            onChange={(e) => setNewLiftCard({...newLiftCard, notes: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Lift Card</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Lift Cards ({liftCards.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedLiftCards.map(lc => (
                      <div key={lc.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100 flex items-center gap-2">
                          #{lc.number}
                          {lc.assignedTo && <Badge variant="warning">in use</Badge>}
                          {lc.unusable && <Badge variant="danger">unusable</Badge>}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={lc.unusable ? 'secondary' : 'outline'}
                            className={!lc.unusable ? 'bg-[--color-warning] text-white hover:bg-[--color-warning]/90' : ''}
                            onClick={() => handleToggleLiftCardUnusable(lc.id)}
                          >
                            {lc.unusable ? 'Enable' : 'Disable'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLiftCard(lc)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteLiftCard(lc.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Event Name</label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleUpdateEventName}>
                    Update Event Name
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full" onClick={handleResetAllEquipment}>
                    Reset All Equipment
                  </Button>
                  <p className="text-xs text-zinc-500 mt-2">
                    This clears all sign-outs for walkies and lift cards for a new event.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default Admin;
```

**Step 2: Verify the page renders correctly**

Check: PIN screen, all tabs, forms, and list items render with dark styling

**Step 3: Commit**

```bash
git add client/src/pages/Admin.jsx
git commit -m "feat: update Admin page with Tailwind styling"
```

---

### Task 12: Update App.jsx and Clean Up

**Files:**
- Modify: `client/src/App.jsx`
- Delete: `client/src/App.css`

**Step 1: Update App.jsx to remove App.css import**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import SignOut from './pages/SignOut';
import Return from './pages/Return';
import Admin from './pages/Admin';

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

**Step 2: Delete App.css**

Run:
```bash
rm /Volumes/HomeX/Chris/Documents/walkie/client/src/App.css
```

**Step 3: Final verification**

Run:
```bash
cd /Volumes/HomeX/Chris/Documents/walkie && npm run dev
```
Check: All pages work correctly with dark theme

**Step 4: Commit**

```bash
git add client/src/App.jsx
git rm client/src/App.css
git commit -m "feat: remove old CSS, complete UI modernization"
```

---

### Task 13: Final Testing and Polish

**Step 1: Test all user flows**

1. Home page loads with dark theme
2. Sign-out flow: letter selection -> volunteer selection -> equipment selection -> submit
3. Return flow: tap to return, tap to undo
4. Admin: PIN entry, all 4 tabs, CRUD operations

**Step 2: Test responsive behavior**

Check on mobile viewport (375px) and tablet viewport (768px)

**Step 3: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix: UI polish and responsive adjustments"
```
