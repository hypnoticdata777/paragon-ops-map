# PM Ops Map

> An open-source operational intelligence tool for property management companies — map every task, owner, and accountability gap across your entire organization.

**[▶ Live Demo](https://hypnoticdata777.github.io/paragon-ops-map/)** — no install required, runs in the browser.

---

## What Is It?

**PM Ops Map** is a lightweight, self-hosted tool that gives property management companies a single source of truth for all operational responsibilities, ownership assignments, and organizational structure.

It comes pre-loaded with 17 common PM departments and 350+ standard tasks — all fully editable to match your company's actual operations. No database, no login, no vendor lock-in.

The tool answers three questions at a glance:

1. **What work exists?** — Every operational task across all departments, documented and organized.
2. **Who owns it?** — Every task is assigned to a named team member or flagged as UNOWNED.
3. **Where are the gaps?** — Unowned responsibilities surface automatically, so nothing falls through the cracks.

---

## The Problem It Solves

In a growing property management company, operational responsibility spreads across leasing, maintenance, accounting, compliance, tenant relations, and more. Without a structured system:

- Tasks go unclaimed and tenants, owners, or vendors fall through the cracks
- Onboarding new team members is slow because no single document captures "who does what"
- Leadership can't identify overloaded team members or understaffed departments
- Scaling decisions — hiring, role creation, process automation — are made without full visibility

PM Ops Map gives your leadership and operations team **complete visibility** across every department, task, and team member in a single interactive interface.

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

All edits update the live data model and auto-save to the browser. Switching to the Map View always reflects the current state.

---

### Map View — Organizational Flow Visualization

The Map View renders a custom SVG flow diagram showing the full **Company → Department → Owner** relationship graph. Line thickness scales with task count, making workload distribution immediately visible.

**Static reading:**

- Each department box shows its name, total task count, and a red warning if any tasks are unowned
- Each owner circle is color-coded to match their badges in the Tracking View
- Bezier curves connect departments to owners — thicker lines mean more tasks
- Dashed red lines indicate connections to unowned work

**Interactive controls:**

| Action | How |
|--------|-----|
| **Focus on one person's work** | Click their owner circle *or* their pill in the filter bar — their connections highlight, everything else dims |
| **Hide an owner's connections entirely** | Shift+click their pill in the filter bar |
| **See a department's full task list** | Click any department box — a task-list panel slides in from the right, grouped by owner |
| **Hover for details** | Hover over any department, owner circle, or connection curve for a tooltip with task counts and context |
| **Reset all filters** | Click the **Reset** button in the filter bar |

---

### Strategic Models View — Scaling Playbook

The Strategic Models View presents four organizational structures for property management companies, evaluated for fit as you grow:

| Model | Description |
|-------|-------------|
| **Functional Specialization** | Deep expertise by department; clear accountability |
| **Portfolio Segmentation** | Each PM owns a full unit portfolio end-to-end |
| **Pod System** | Small cross-functional squads; high flexibility |
| **Hybrid Core + Flex** ⭐ | Stable core team with a flex support layer |

Each model includes a team structure breakdown, pros and cons, and a real-world company example. Six industry case studies cover centralized leasing, AI automation adoption, virtual team cost savings, and restructuring outcomes.

---

### Live Stats Bar

A persistent stats bar at the bottom of every view shows:

- **Total Tasks** — complete count across all departments
- **Assigned** — tasks with a named owner
- **⚠ Unowned** — tasks with no assigned owner (highlighted in red)
- **Departments** — total department count

These update automatically when ownership is reassigned in the Tracking View.

---

## Adapting It to Your Company

All departments, tasks, and team members are defined in `js/data.js` as plain JavaScript objects. No build step required — just edit the file and reload.

### Rename or replace team members

In `js/data.js`, update the `ownerColors` object:

```js
const ownerColors = {
  "Alex":    { class: "owner-alex",    hex: "#ff6f00" },
  "Jordan":  { class: "owner-jordan",  hex: "#1976d2" },
  "UNOWNED": { class: "owner-unowned", hex: "#d32f2f" },
  // add as many as you need
};
```

Add a matching CSS class in `css/style.css`:

```css
.owner-alex   { background: #ff6f00; }
.owner-jordan { background: #1976d2; }
```

### Add or remove tasks

```js
// Add a task to an existing department
orgData.departments
  .find(d => d.id === 'leasing')
  .tasks.push({ name: "Follow up on application", owner: "Alex" });
```

### Add a new department

```js
orgData.departments.push({
  id:    "hr",
  name:  "Human Resources",
  color: "#5e35b1",
  tasks: [
    { name: "Post job listings",     owner: "Jordan" },
    { name: "Run onboarding process", owner: "UNOWNED" },
  ]
});
```

### Update the company name

In `index.html`, update the header and hero text. In `js/app.js`, update the company label rendered in the SVG map (`PARAGON`, `PROPERTY`, `MANAGEMENT`).

---

## Project Structure

```
pm-ops-map/
├── index.html              Main HTML — layout, view containers, navigation
├── css/
│   └── style.css           All application styles, responsive breakpoints
├── js/
│   ├── data.js             Data model — departments, tasks, owners, strategic content
│   └── app.js              Rendering engine — views, SVG map, editing, filters, persistence
├── webpack.common.js       Shared webpack configuration
├── webpack.config.dev.js   Development server config (hot reload)
└── webpack.config.prod.js  Production build config
```

**Key design principle:** All data lives in `data.js` as a plain JavaScript object. All rendering reads from that object. Edits made in the UI mutate the in-memory object, keeping every view in sync without a backend.

---

## Getting Started

**Quickest option:** fork the repo, edit `js/data.js` with your team and tasks, and deploy to GitHub Pages for free.

**Run locally:** open `index.html` directly in any modern browser — fully functional with no server needed.

**Development with live reload:**

```bash
npm install
npm start          # webpack-dev-server at localhost:8080
npm run build      # production bundle → dist/
```

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Structure** | HTML5 | Semantic, no framework overhead |
| **Styles** | CSS3 (Flexbox, Grid, custom properties) | Responsive without a CSS framework |
| **Logic** | Vanilla JavaScript ES6 | No bundle size, no dependencies to maintain |
| **Visualization** | Custom SVG engine | Full control over layout and interactivity |
| **Persistence** | localStorage | Edits survive page refresh, no backend needed |
| **Build** | Webpack 5 (optional) | Bundling only — not required to run the app |

Zero runtime dependencies. Everything ships as static files.

---

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge). The `switchView()` function explicitly passes the clicked element as a parameter rather than relying on `window.event`, which ensures correct behavior in Firefox.

---

## Contributing

Pull requests are welcome. If you adapt this for your company and build something useful — a new department template, a data import/export feature, a different visualization — consider opening a PR so other PMCs can benefit.

---

## License

MIT — free to use, adapt, and deploy for any property management company.
