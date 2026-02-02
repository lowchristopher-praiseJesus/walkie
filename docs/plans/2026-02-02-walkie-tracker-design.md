# Walkie Tracker - Design Document

## Overview

A mobile-friendly web app for tracking walkie-talkie sign-out/sign-in at volunteer events. Designed for minimal clicks and easy use on smartphones.

## Core User Flows

### Sign-Out Flow (Volunteer taking a walkie)
1. Volunteer lands on main page, taps "Sign Out Walkie"
2. Types first letter of their last name
3. System shows filtered list of volunteers starting with that letter
4. Volunteer taps their name
5. System shows grid of available walkies (only those not checked out)
6. Volunteer taps the walkie number they're taking
7. Confirmation shown, done

### Sign-In Flow (Returning a walkie)
1. Volunteer/coordinator taps "Return Walkie"
2. System shows all currently checked-out walkies as tiles (walkie number + volunteer name)
3. Tap any tile to return that walkie
4. Confirmation shown, walkie is now available again

### Admin Flow
1. Tap "Admin" → enter 4-digit PIN
2. Access management screens for:
   - Add/edit/delete volunteers (name, optional phone)
   - Add/edit/delete walkies (number, optional notes)
   - View current status dashboard
   - Reset all walkies (for new event)

## Technical Architecture

### Frontend (React)
- Single Page Application with React Router
- Mobile-first responsive design (large tap targets, minimal scrolling)
- Pages:
  - `/` - Home with "Sign Out" and "Return" buttons
  - `/sign-out` - Volunteer selection → Walkie selection flow
  - `/return` - Grid of checked-out walkies
  - `/admin` - PIN gate, then management tabs
- State management: React Context
- Styling: CSS modules

### Backend (Node.js + Express)
- REST API endpoints:
  - `GET /api/volunteers` - list all volunteers
  - `POST /api/volunteers` - add volunteer
  - `PUT /api/volunteers/:id` - edit volunteer
  - `DELETE /api/volunteers/:id` - delete volunteer
  - `GET /api/walkies` - list all walkies with status
  - `POST /api/walkies` - add walkie
  - `PUT /api/walkies/:id` - edit walkie
  - `DELETE /api/walkies/:id` - delete walkie
  - `POST /api/sign-out` - sign out a walkie to a volunteer
  - `POST /api/return/:walkieId` - return a walkie
  - `POST /api/reset` - reset all walkies for new event
  - `POST /api/admin/verify` - verify PIN

### Data Storage (JSON files)
- `data/volunteers.json` - volunteer list
- `data/walkies.json` - walkie list with current assignment status
- `data/config.json` - admin PIN and app settings

## Data Models

### volunteers.json
```json
{
  "volunteers": [
    {
      "id": "v1",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "555-1234"
    }
  ]
}
```

### walkies.json
```json
{
  "walkies": [
    {
      "id": "w1",
      "number": 1,
      "notes": "Channel 5",
      "assignedTo": null,
      "assignedAt": null
    }
  ]
}
```

### config.json
```json
{
  "adminPin": "1234",
  "eventName": "Spring Fundraiser"
}
```

## UI Components

### Home Screen
- Event name at top (if configured)
- Two large buttons: "Sign Out Walkie" / "Return Walkie"
- Small "Admin" link in corner
- Status summary: "12 of 20 walkies in use"

### Sign-Out Screen
- Letter grid (A-Z) for filtering by last name
- Volunteer list appears after letter selection
- Available walkies shown as large numbered tiles

### Return Screen
- Grid of checked-out walkies showing: walkie number + volunteer name
- Single tap to return with brief confirmation

## Deployment
- Initially: Local/self-hosted on a server
- Future: Cloud deployment (Vercel, Railway, etc.)
