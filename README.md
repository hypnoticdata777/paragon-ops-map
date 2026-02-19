# Paragon Operations Map

A complete operational visualization and strategic analysis tool built to map, analyze, and scale property management operations.

## Overview

The **Paragon Operations Map** provides a full operational breakdown of a property management company, including:

- 17 departments
- 350+ operational tasks
- Ownership visibility per task
- Unowned task detection (highlighted in red)
- Strategic scaling models with pros/cons analysis
- Industry case study insights

Designed to support operational stabilization and scaling from **150 → 500 units**.

---

## Features

### Tracking View
- Department-based task cards, all expanded by default
- Color-coded owner badges per task
- Red highlighting for unowned responsibilities
- Click any department header to collapse/expand

### Map View
- SVG-generated operational flow map
- Company → Department → Task → Owner visualization
- Animated dashed lines for unowned tasks
- Horizontally scrollable on smaller screens

### Strategic Models
- 4 organizational scaling models (Functional, Portfolio, Pod, Hybrid)
- Real-world industry case studies
- Side-by-side pros/cons comparison

---

## Project Structure

```
index.html          - Main UI, layout, and view templates
css/style.css       - All application styles + mobile media queries
js/data.js          - Organizational data, strategic models, case studies
js/app.js           - Rendering logic and visualization engine
```

---

## Getting Started

Open `index.html` directly in any browser — no build step required. The app uses plain HTML, CSS, and vanilla JavaScript with no dependencies.

For development with the included webpack setup:

```bash
npm install
npm start    # dev server
npm run build  # production build to dist/
```

---

## Technologies Used

- HTML5
- CSS3 with responsive media queries
- Vanilla JavaScript (ES6)
- SVG rendering engine (no external library)

No frameworks — pure logic-driven implementation.

---

## Browser Compatibility

Works in all modern browsers. The `switchView()` function explicitly passes the clicked element rather than relying on `window.event`, ensuring correct behavior in Firefox, Safari, and Chrome.

---

## Purpose

This project was created to:

- Identify operational gaps and unowned responsibilities
- Clarify task ownership across all departments
- Reduce single points of failure
- Support leadership decision-making during growth
- Enable scalable organizational design

---

## Author

**Carlos Sanchez**
Operations Manager & Systems Builder

---

## Created

February 2026
