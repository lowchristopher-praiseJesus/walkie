# UI Modernization Design

## Overview

Modernize the Walkie Tracker app with shadcn/ui components, Tailwind CSS, and a dark-first theme optimized for tablet use at a central event desk.

## Context

- **Use case**: Admin tablet at central desk, one person signing out equipment to servers
- **Environment**: Event venues, often dimly lit
- **Approach**: Preserve current interaction flows, modernize visuals only

## Technical Stack

### Additions
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- shadcn/ui components (Button, Input, Card, Tabs, Badge, Alert)
- Dark mode default via CSS variables

### Color Palette (Dark Theme)

| Role | Value | Hex |
|------|-------|-----|
| Background | zinc-950 | #09090b |
| Cards/surfaces | zinc-900 | #18181b |
| Borders | zinc-800 | #27272a |
| Text (primary) | zinc-100 | #f4f4f5 |
| Text (muted) | zinc-400 | #a1a1aa |
| Primary (blue) | - | #007AFF |
| Success (green) | - | #34C759 |
| Warning (orange) | - | #FF9500 |
| Danger (red) | - | #FF3B30 |
| Lift cards (gold) | - | #F9A825 |

## Component Styling

### Buttons
- Large touch targets: min 48px, 80px for home CTAs
- Variants: default (blue), secondary (green), destructive (red), outline, ghost
- Scale down on active press

### Letter Grid
- 6-column grid preserved
- Dark tiles with hover/active states

### Equipment Tiles
- Auto-fill grid with 80px minimum
- Selected: vibrant green background
- Disabled: 40% opacity

### Tabs (Admin)
- shadcn Tabs with dark styling
- Smooth transitions

### Forms
- Dark inputs with blue focus ring
- Muted labels, bright input text

### Alerts
- Success: green tint
- Error: red tint

## Page Layouts

### Home
- Centered 480px container
- Large event name, muted status line
- Two large stacked CTAs
- Subtle admin link

### Sign-Out (3 steps)
- Letter grid (step 1)
- Volunteer cards with equipment badges (step 2)
- Equipment tile grids with section headers (step 3)

### Return
- Section headers with counts
- Tile grids, returned items dimmed with strikethrough
- Gold accent for lift cards

### Admin
- Tab navigation (Servers, Walkies, Lift Cards, Settings)
- Add form + list per tab
- Destructive reset button in Settings
