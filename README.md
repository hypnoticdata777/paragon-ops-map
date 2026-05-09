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
5. Complete the setup screen — you're live

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

On first launch, the setup screen captures company name, portfolio size, and primary operations focus. That profile stays in `localStorage` and adjusts the app's tone automatically for stability, maintenance, growth, or compliance workflows.

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

### 🔄 Multi-Device Sync

Use the **Copy State** and **Paste State** buttons in the stats bar to transfer your full data set between devices without a backend.

- **Copy State** — serializes all tasks, team members, and work orders to your clipboard as a single JSON blob
- **Paste State** — reads from the clipboard and restores the full state (prompts for confirmation before overwriting)

Works across any two browsers that share clipboard access (e.g. paste into a colleague's machine via a chat tool, or sync between your laptop and tablet).

---

### 📋 Audit Log

Every meaningful change is recorded in an append-only audit log stored in `localStorage`.

Click **Audit Log** in the stats bar to open the log panel. Each entry shows:

| Field | Content |
|-------|---------|
| Time | Timestamp of the action |
| Action | What happened (Owner changed, Status changed, Priority changed, Task renamed, Auto-assigned, etc.) |
| Detail | The before/after values or relevant context |

The log caps at 500 entries (oldest entries are dropped). You can clear it at any time from inside the panel. Logged actions include: owner assignments, status and priority changes, task renames, auto-assign runs, work order advances and deletions, imports, and paste-state operations.

---

### 🔗 Task Dependencies

Each task can be marked as **blocked by** another task in any department.

Click the dependency chip on a task row (in Tracking view or the due-date panel) to open the dependency picker:

- Search across all departments and tasks
- Select the blocking task — a chip appears on the dependent task
- The chip turns **red** if the blocking task is not yet Done, and **green** once it is resolved
- Click **Clear** in the picker or the chip's remove control to unlink the dependency

Dependencies persist in `localStorage` alongside all other task data.

---

### 📱 Mobile Touch Targets

The app is optimized for touch devices via a `@media (hover: none) and (pointer: coarse)` media query that activates only on real touch screens (not just narrow viewports):

- Task rows expand to a minimum of 52 px tall
- Status pills, owner badges, priority dots, and action buttons all meet the 36 px minimum tap target
- All interactive elements use `touch-action: manipulation` to eliminate the 300 ms tap delay

---

### 🔔 Overdue Notifications

The app can send browser notifications for overdue tasks.

Click **🔔 Alerts** in the stats bar (visible after granting permission) to trigger a permission request. Once granted:

- On each page load the app checks for tasks with a due date in the past that are not Done
- One grouped notification is sent per session (not on every reload) listing the overdue count
- Permission is requested lazily on interaction, not on page load, which browsers prefer

The last notification date is stored in `localStorage` to avoid spamming repeated visits.

---

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
- A **Playbook** panel for that employee's owned tasks, priorities, blockers, affinities, and active work orders

Affinities tell the auto-assign engine which departments this person covers.

#### Role Playbooks

Click **Playbook** on any employee card to open a scrollable role summary without leaving the app. Each playbook shows workload metrics, status breakdown, department affinities, priority focus, blockers/overdue items, active work orders, and the full responsibility list. A Markdown download remains available inside the panel for handoffs or onboarding packets.

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
| Set a due date | Click the calendar icon on the task row |
| Set a dependency | Click the dependency chip → search and select the blocking task |
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

Also contains: Export to JSON or CSV · Import a saved config · Copy State · Paste State · Audit Log · 🔔 Alerts · Reset to defaults

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

On first load, the setup screen asks for your company name, portfolio size, and primary operations focus. It saves to `localStorage`, appears in the header and SVG map, and adjusts the app's accent tone. To reset it, open DevTools → Application → localStorage → delete `pm-ops-company-name` and `pm-ops-profile-v1`, then reload.

### Keep navigation out of the way

Use **Hide nav** in the header to collapse the tab bar into a thin working strip. Hover or focus the strip to reveal it, or click **Show nav** to restore the full tabs. The preference saves locally.

---

## Project Structure

```
pm-ops-map/
├── index.html              Main layout, navigation, modals
├── config.json             Master data — departments, tasks, owners, colors, affinities
├── css/
│   └── style.css           All styles, responsive breakpoints, animations
├── js/
│   ├── app.js              Entry point — imports all modules, registers window globals, boots the app
│   ├── state.js            Shared mutable state, constants, setters, and employee helpers
│   ├── storage.js          localStorage persistence, toast notifications, company profile helpers
│   ├── ui.js               Stats bar, beacons, onboarding modal, welcome guide, notifications
│   ├── io.js               Export / Import (JSON + CSV), clipboard sync, undo stack
│   ├── data.js             Jest-only shim — reads config.json for test assertions
│   ├── utils.js            Pure utility functions (CommonJS — imported by both webpack and Jest)
│   ├── views/
│   │   ├── tracking.js     Tracking view, filter bar, owner picker, status/priority cycles,
│   │   │                   due dates, task dependencies
│   │   ├── map.js          SVG flow map, department panel, tooltips, SVG helpers
│   │   ├── team.js         Team Manager, auto-assign engine, role playbooks, audit log
│   │   └── workorders.js   Work Orders kanban board
│   └── __tests__/
│       ├── data.test.js    Unit tests for config.json structure (10 tests)
│       └── utils.test.js   Unit tests for utility functions (37 tests)
├── CONTRIBUTING.md         How to contribute
├── LICENSE.txt             MIT License
└── webpack.config.*.js     Optional build configs (not needed to run the app)
```

---

## Architecture

### Data flow

All data lives in `config.json`. On load, `app.js` fetches it, stamps each task with a stable `_configName` identity key, and hands the result to `state.js`. Every module imports state variables directly from there. Edits in the UI mutate those in-memory objects; `storage.js` persists them to `localStorage` after each change. Nothing goes to a server.

### Module dependency graph

```
utils.js          ← no dependencies (pure functions, CommonJS)
state.js          ← no dependencies
storage.js        ← state, utils
ui.js             ← state, storage, utils
views/tracking.js ← state, storage, utils, ui, views/map
views/map.js      ← state, storage, utils
views/team.js     ← state, storage, utils, ui, views/tracking, views/map, views/workorders
views/workorders.js ← state, storage, utils, ui
io.js             ← state, storage, utils, ui, views/tracking, views/map, views/team
app.js            ← everything above
```

There are **no circular dependencies** in this graph. Each arrow points only downward.

### Why `utils.js` uses CommonJS

All other modules use ES module `import/export` syntax. `utils.js` deliberately uses `module.exports` so Jest can `require()` it directly without any Babel transform or `--experimental-vm-modules` flag. Webpack 5 handles the CJS↔ESM interop transparently for the browser build.

### Global function assignments

Webpack bundles ES modules into a closure, which means functions are not automatically on `window`. Because `index.html` uses inline `onclick="fn()"` handlers throughout, `app.js` explicitly assigns every handler to `window` via `Object.assign(window, { ... })` after importing them. If you add a new function that needs to be callable from HTML, add it to that block at the bottom of `app.js`.

### Known workaround — `window._saveUndoSnapshot`

The undo snapshot function (`_saveUndoSnapshot`) lives in `io.js`. The auto-assign engine in `views/team.js` needs to call it before bulk-assigning tasks, but `io.js` already imports from `views/team.js` (for `renderTeamView` and `renderLegend`). A direct import back would create a circular dependency.

The workaround is that `runAutoAssign()` in `team.js` calls it via the window global:

```js
// views/team.js
window._saveUndoSnapshot && window._saveUndoSnapshot();
```

`app.js` assigns `_saveUndoSnapshot` to `window` as part of its normal global registration, so this works correctly in the browser. The `&&` guard prevents a crash in any environment where `app.js` hasn't run yet (e.g. isolated unit tests).

The clean long-term fix would be to extract `_saveUndoSnapshot` and `undoLastAction` into their own `undo.js` module that both `team.js` and `io.js` can import without a cycle. PRs welcome.

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
