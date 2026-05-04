# PM Ops Map

> An open-source operations management tool for property management companies — track every department, every task, every maintenance request, and exactly who owns what.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.txt)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://hypnoticdata777.github.io/paragon-ops-map/)
[![Download v1.0.0](https://img.shields.io/badge/Download-v1.0.0-orange)](https://github.com/hypnoticdata777/paragon-ops-map/releases/latest)

**[▶ Live Demo](https://hypnoticdata777.github.io/paragon-ops-map/)** — runs entirely in the browser, nothing to install.

---

## Download & Use in 5 Minutes

**No server. No database. No login. No dependencies.**

### Option A — Download the ZIP (Recommended for most companies)

1. Go to [Releases](https://github.com/hypnoticdata777/paragon-ops-map/releases/latest)
2. Download `pm-ops-map.zip` under **Assets**
3. Unzip it anywhere on your computer
4. Open `index.html` in Chrome, Firefox, Safari, or Edge
5. Enter your company name when prompted — you're live

### Option B — Clone and Run

```bash
git clone https://github.com/hypnoticdata777/paragon-ops-map.git
cd paragon-ops-map
open index.html        # Mac
start index.html       # Windows
xdg-open index.html    # Linux
```

> **Note:** `fetch('config.json')` requires a server. If you open `index.html` directly from the filesystem and see a config error, run `npm start` instead (see [Development](#development)).

### Option C — Fork and Host on GitHub Pages (Free)

1. Fork this repo
2. Go to **Settings → Pages → Source → main branch**
3. Your tool is live at `https://yourusername.github.io/paragon-ops-map/`

---

## What It Does

PM Ops Map gives your property management team a single source of truth for all operational responsibilities. It comes pre-loaded with **17 common PM departments and 260+ standard tasks** — all fully editable to match your company.

It answers six questions at a glance:

1. **What work exists?** — Every task across every department, organized and documented
2. **Who owns it?** — Every task assigned to a named team member or flagged UNOWNED
3. **Where are the gaps?** — Unowned tasks surface automatically, highlighted in red
4. **Who is overloaded?** — The workload dashboard shows task distribution and flags imbalances
5. **What's the current state?** — Every task carries a live status and priority so you can see what's in flight, blocked, or done without a separate project tool
6. **What maintenance is in progress?** — The Work Orders board tracks every repair and service request from intake to completion

---

## Who It's For

| Role | How They Use It |
|------|----------------|
| **Operations Manager** | Audit ownership, spot gaps, run auto-assign to fill them |
| **CEO / Leadership** | See workload distribution and who is overloaded at a glance |
| **Department Leads** | Review responsibilities, track status, flag blockers |
| **Maintenance Coordinator** | Log work orders, assign vendors, advance jobs through the pipeline |
| **New Hires** | Understand their role and how it connects to the rest of the org |

---

## Features

### 🔧 Work Orders — Maintenance Pipeline

The **Work Orders tab** is a kanban board for tracking maintenance requests and service jobs from intake to completion.

#### Four-stage pipeline

| Stage | Meaning |
|-------|---------|
| **Submitted** | Request received — not yet scheduled |
| **Scheduled** | Vendor or staff member confirmed — date set |
| **In Progress** | Work is actively underway |
| **✓ Completed** | Job closed out |

Click **→ Next Status** on any card to advance it one step. Cards show their priority with a colored left border (red = high, amber = medium, green = low).

#### Work order fields

Each work order captures: property address, unit number, issue title, notes, priority, assignee (pulled from your team roster), vendor name, and estimated cost.

#### Beacon

A pulsing red dot appears on the Work Orders tab whenever an open work order has no assignee — so nothing slips through the cracks.

---

### 👥 Team Manager — Auto-Assignment Engine

The **Team Manager tab** manages your employee roster and distributes tasks automatically.

#### Employee Roster

Add employees by name and pick their badge color from the palette. Each employee card shows:
- Their current task count and a mini workload bar
- **Department affinity tags** — one per department, click to toggle on/off
- A **Playbook** export for that employee's owned tasks, priorities, blockers, affinities, and active work orders

Affinities tell the auto-assign engine which departments this person covers.

#### ⚡ Auto-Assign

Click **Auto-Assign** in the filter bar to instantly route every UNOWNED task using two rules:

| Rule | Logic |
|------|-------|
| **Affinity match** | Prefer employees tagged for that department |
| **Workload balance** | Among matching employees, pick the one with the fewest tasks right now |

If no employee has an affinity for a department, the engine falls back to the globally least-loaded person — so no task is ever left UNOWNED after a run.

#### Workload Dashboard

A horizontal bar chart sorted by task count. Employees carrying significantly more than the team average (≥35% above, more than 5 tasks) are flagged with a ⚠ beacon.

#### Beacons

| Beacon | Location | Meaning |
|--------|----------|---------|
| 🔴 Dot | Team Manager tab | UNOWNED tasks exist |
| 🔴 Badge | Auto-Assign button | Live count of UNOWNED tasks |
| ⚠ Icon | Workload Dashboard row | Employee is significantly above team average |
| 🔴 Banner | Top of Team Manager | UNOWNED count with a one-click fix |
| 🔴 Dot | Work Orders tab | Open work order has no assignee |

---

### 📊 Tracking View — Task-Level Accountability

Every department displayed as a collapsible card. Each task row shows its priority, name, status, and owner — all editable with a single click.

#### Task interactions

| Action | How |
|--------|-----|
| Rename a task | Double-click the task name → type → Enter to save |
| Reassign an owner | Click the owner badge → pick from dropdown |
| Change status | Click the status pill — cycles through the four states |
| Change priority | Click the colored dot — cycles through the three levels |
| Spot unowned tasks | Red pulsing badge — impossible to miss |

#### Status lifecycle

| Status | Meaning |
|--------|---------|
| **To Do** | Not started yet — the default |
| **In Progress** | Actively being worked on |
| **⚠ Blocked** | Something is stopping this task |
| **✓ Done** | Complete — row dims |

#### Priority levels

| Priority | Indicator | When to use |
|----------|-----------|-------------|
| 🔴 **High** | Red dot | Time-sensitive or business-critical |
| 🟡 **Medium** | Amber dot | Normal operational work |
| 🟢 **Low** | Green dot | Nice-to-have or background tasks |

#### Department headers

Each department header shows a **thin progress bar** (% of tasks Done) and inline counts for done and blocked tasks. Both update live as you click.

#### Filters

| Filter | Options |
|--------|---------|
| Keyword search | Full-text across all task names |
| Owner | Show one team member's tasks only |
| Status | To Do / In Progress / Blocked / Done |
| Priority | High / Medium / Low |

All four filters compose together. The Clear button resets all at once.

---

### 🗺 Map View — Org Flow Visualization

A custom SVG diagram showing **Company → Departments → Owners**. Line thickness scales with task count.

| Action | How |
|--------|-----|
| Focus on one person | Click their owner circle — connections highlight, others dim |
| See a department's tasks | Click any department box — detail panel slides in |
| Hover for counts | Tooltip on any department, owner, or connection line |
| Shift-click a pill | Hide/show that owner's connections entirely |
| Reset | Click Reset in the controls bar |

---

### 📈 Live Stats Bar

Persistent across all views, updates whenever any task changes:

| Stat | What it shows |
|------|--------------|
| Total Tasks | All tasks across all departments |
| ✓ Assigned | Tasks with a named owner |
| ✓ Done | Tasks marked Done (green) |
| ⏳ In Progress | Tasks actively being worked (orange) |
| ⚠ Blocked | Tasks that are stuck (red) |
| ⚠ Unowned | Tasks with no assigned owner (red) |
| Departments | Total department count |

Also contains: Export to JSON or CSV · Import a saved config · Reset to defaults

> **Export/Import note:** JSON and CSV exports include `status` and `priority` alongside `name` and `owner`. Old exports without those fields import cleanly — they default to `To Do` / `Medium` on load.

---

## Customizing It for Your Company

### Add or remove team members

Use the **Team Manager tab** — no code required. Type a name, pick a badge color, click **+ Add Employee**. To remove someone, click ✕ on their card (their tasks revert to UNOWNED automatically).

To set up auto-assignment, click the department affinity tags on each employee card to mark which areas they cover, then run **⚡ Auto-Assign**.

### Customize departments and tasks

Edit `config.json` in the project root. This is the master data file — no JavaScript knowledge needed.

**Add a task to an existing department:**

```json
{
  "id": "leasing",
  "name": "Leasing & Marketing",
  "color": "#1976d2",
  "tasks": [
    { "name": "Follow up on expired listings", "owner": "UNOWNED" }
  ]
}
```

**Add a new department:**

```json
{
  "id": "hr",
  "name": "Human Resources",
  "color": "#5e35b1",
  "tasks": [
    { "name": "Post job listings",       "owner": "Jordan" },
    { "name": "Run onboarding process",  "owner": "UNOWNED" }
  ]
}
```

**Add default employee colors and affinities** in the `ownerColors` and `defaultAffinities` sections of `config.json`. These are used to seed the team roster on first load. After that, the Team Manager UI takes over.

### Update your company name

On first load a prompt asks for your company name. It saves to `localStorage` and appears in the header and SVG map. To reset it, open DevTools → Application → localStorage → delete `pm-ops-company-name`, then reload.

---

## Project Structure

```
pm-ops-map/
├── index.html              Main layout, navigation, modals
├── config.json             Master data — departments, tasks, owners, colors, affinities
├── css/
│   └── style.css           All styles, responsive breakpoints, animations
├── js/
│   ├── app.js              All rendering — views, SVG map, editing, filters, persistence
│   ├── data.js             Jest-only shim — reads config.json for test assertions
│   └── __tests__/
│       └── data.test.js    Unit tests for config.json structure
├── CONTRIBUTING.md         How to contribute
├── LICENSE.txt             MIT License
└── webpack.config.*.js     Optional build configs (not needed to run the app)
```

**Design principle:** All data lives in `config.json`. On load the app fetches it, hydrates the in-memory `orgData` object, and every view reads from that. Edits in the UI mutate the in-memory object; `localStorage` persists those edits across page reloads. Nothing goes to a server.

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Structure | HTML5 | Semantic, no framework overhead |
| Styles | CSS3 (Flexbox, Grid) | Responsive without a CSS library |
| Logic | Vanilla JavaScript ES6+ | Zero dependencies to maintain |
| Visualization | Custom SVG engine | Full control over layout and interactivity |
| Persistence | localStorage | Edits survive page refresh without a backend |
| Build | Webpack 5 (optional) | Not required to run the app |

**Zero runtime dependencies.** Everything ships as static files.

---

## Browser Compatibility

Works in all modern browsers: Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+.

---

## Development

```bash
npm install
npm start          # webpack-dev-server with live reload at localhost:8080
npm test           # Jest unit test suite
npm run build      # Production bundle → dist/
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — especially department templates, mobile UX improvements, and new visualization options.

---

## License

MIT — free to use, modify, and deploy for any property management company. See [LICENSE.txt](LICENSE.txt).
