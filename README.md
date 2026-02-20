# Paragon Operations Map

> A live operational intelligence tool for property management — mapping every task, owner, and accountability gap across the entire organization.

---

## What Is It?

The **Paragon Operations Map** is an internal operations management tool built for **Paragon Property Management**. It provides a single source of truth for all operational responsibilities, ownership assignments, and organizational structure as the company scales from **~150 to 300–500 managed units**.

The tool answers three critical questions at a glance:

1. **What work exists?** — Every operational task across all 17 departments, documented and organized.
2. **Who owns it?** — Every task is assigned to a named team member or flagged as UNOWNED.
3. **Where are the gaps?** — Unowned responsibilities surface automatically, so nothing falls through the cracks.

---

## The Operational Problem It Solves

In a growing property management company, operational responsibility spreads across leasing, maintenance, accounting, compliance, tenant relations, and more. Without a structured system:

- Tasks go unclaimed and tenants, owners, or vendors fall through the cracks
- Onboarding new team members is slow because no single document captures "who does what"
- Leadership can't identify overloaded team members or understaffed departments
- Scaling decisions (hiring, role creation, process automation) are made without full visibility

The Paragon Operations Map gives leadership and the operations team **complete visibility** — across 17 departments, 350+ tasks, and 8 team members — in a single interactive interface.

---

## Who It's For

| Role | How They Use It |
|------|----------------|
| **Operations Manager** | Audit task ownership, identify gaps, plan role coverage |
| **CEO / Leadership** | Evaluate team structure, guide scaling decisions |
| **New Hires** | Understand their role and how it connects to the rest of the org |
| **Department Leads** | Review their task responsibilities and handoffs |

---

## Features

The tool is organized into three views, accessible from the top navigation bar.

---

### Tracking View — Task-Level Accountability

The Tracking View is the operational backbone. It lists every department as a collapsible card, with each task displayed alongside its assigned owner.

**What you can do:**

| Action | How |
|--------|-----|
| **Rename a task** | Double-click any task name → type the new name → press Enter to save or Escape to cancel |
| **Reassign an owner** | Click any color-coded owner badge → pick a new team member from the dropdown |
| **Collapse / expand a department** | Click the department header bar |
| **Search tasks** | Use the search bar to filter by keyword across all departments in real time |
| **Filter by person** | Use the owner dropdown to show only tasks belonging to a specific team member |
| **Spot unowned work** | Unowned tasks are highlighted in red with a pulsing badge — impossible to miss |

All edits update the live data model, so switching to the Map View always reflects the current state.

---

### Map View — Organizational Flow Visualization

The Map View renders a custom SVG flow diagram showing the full **Company → Department → Owner** relationship graph. Line thickness scales with task count, making workload distribution immediately visible.

**Static reading:**

- Each department box shows its name, total task count, and a red warning if any tasks are unowned
- Each owner circle is color-coded to match their badges in the Tracking View
- Bezier curves connect departments to owners; thicker = more tasks
- Dashed red lines indicate connections to unowned work

**Interactive controls:**

| Action | How |
|--------|-----|
| **Focus on one person's work** | Click their owner circle *or* their pill in the filter bar — their connections highlight, everything else dims |
| **Hide an owner's connections entirely** | Shift+click their pill in the filter bar |
| **See a department's full task list** | Click any department box — a task-list panel slides in from the right, grouped by owner |
| **Hover for details** | Hover over any department, owner circle, or connection curve for a tooltip with task counts and context |
| **Reset all filters** | Click the **Reset** button in the filter bar |

This makes it straightforward to answer questions like: *"What does Nathan own across the whole org?"* or *"Which departments involve unowned work?"*

---

### Strategic Models View — Scaling Playbook

The Strategic Models View presents four organizational structures evaluated for their fit as Paragon grows from 150 to 500 units:

| Model | Description |
|-------|-------------|
| **Functional Specialization** | Deep expertise by department; clear accountability |
| **Portfolio Segmentation** | Each PM owns a full unit portfolio end-to-end |
| **Pod System** | Small cross-functional squads; high flexibility |
| **Hybrid Core + Flex** ⭐ | Recommended — stable core team with flex support layer |

Each model includes team structure breakdown, pros and cons, and a real-world company example. Six industry case studies are included below, covering centralized leasing, AI automation adoption, virtual team cost savings, and restructuring outcomes.

---

### Live Stats Bar

A persistent stats bar at the bottom of every view shows:

- **Total Tasks** — complete count across all departments
- **Assigned** — tasks with a named owner
- **⚠ Unowned** — tasks with no assigned owner (highlighted in red)
- **Departments** — total department count

These update automatically when ownership is reassigned in the Tracking View.

---

## Project Structure

```
paragon-ops-map/
├── index.html              Main HTML — layout, view containers, navigation
├── css/
│   └── style.css           All application styles, component styles, responsive breakpoints
├── js/
│   ├── data.js             Organizational data model — departments, tasks, owner colors,
│   │                       strategic models, case studies
│   └── app.js              Rendering engine — view management, tracking view, SVG map,
│                           inline editing, owner picker, map state, tooltips, filters
├── webpack.common.js       Shared webpack configuration
├── webpack.config.dev.js   Development server config (hot reload)
└── webpack.config.prod.js  Production build config
```

**Key design principle:** All data lives in `data.js` as a plain JavaScript object (`orgData`). All rendering reads from that object. Edits made in the UI (task renames, owner reassignments) mutate the object in memory, which keeps every view in sync without a backend.

---

## Getting Started

**No build step required.** Open `index.html` directly in any modern browser and the tool is fully functional.

For development with live reload:

```bash
npm install
npm start          # starts webpack-dev-server at localhost:8080
npm run build      # produces a production bundle in dist/
```

---

## Data Model

All departments and tasks are defined in `js/data.js`. To add, remove, or restructure the org:

```js
// Add a task to an existing department
orgData.departments
  .find(d => d.id === 'leasing')
  .tasks.push({ name: "New task description", owner: "Nathan" });

// Add a new team member — add their color to ownerColors
const ownerColors = {
  "NewPerson": { class: "owner-newperson", hex: "#your-hex-color" },
  // ...
};
```

Add a matching CSS class in `style.css`:

```css
.owner-newperson { background: #your-hex-color; }
```

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Structure** | HTML5 | Semantic, no framework overhead |
| **Styles** | CSS3 (Flexbox, Grid, custom properties) | Responsive without a CSS framework |
| **Logic** | Vanilla JavaScript ES6 | No bundle size, no dependencies to maintain |
| **Visualization** | Custom SVG engine | Full control over layout and interactivity |
| **Build** | Webpack 5 (optional) | Bundling only — not required to run the app |

Zero runtime dependencies. Everything ships as static files.

---

## Browser Compatibility

Tested and working in all modern browsers (Chrome, Firefox, Safari, Edge). The `switchView()` function explicitly passes the clicked element as a parameter rather than relying on `window.event`, which ensures correct behavior in Firefox where that global is not available.

---

## Author

**Carlos Sanchez**
Operations Manager & Systems Builder — Paragon Property Management

*Built February 2026 to support operational stabilization and planning for the 150 → 500 unit growth phase.*
