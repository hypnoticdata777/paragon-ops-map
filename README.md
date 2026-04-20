# PM Ops Map

> An open-source task ownership map for property management companies — see every department, every task, and exactly who owns what.

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

### Option C — Fork and Host on GitHub Pages (Free)

1. Fork this repo
2. Go to **Settings → Pages → Source → main branch**
3. Your tool is live at `https://yourusername.github.io/paragon-ops-map/`

---

## What It Does

PM Ops Map gives your property management team a single source of truth for all operational responsibilities. It comes pre-loaded with **17 common PM departments and 350+ standard tasks** — all fully editable to match your company.

It answers three questions at a glance:

1. **What work exists?** — Every task across every department, organized and documented
2. **Who owns it?** — Every task assigned to a named team member or flagged UNOWNED
3. **Where are the gaps?** — Unowned tasks surface automatically, highlighted in red

---

## Who It's For

| Role | How They Use It |
|------|----------------|
| **Operations Manager** | Audit ownership, find gaps, plan role coverage |
| **CEO / Leadership** | Evaluate team structure, guide scaling decisions |
| **New Hires** | Understand their role and how it connects to the org |
| **Department Leads** | Review responsibilities and handoffs |

---

## Features

### Tracking View — Task-Level Accountability

Every department displayed as a collapsible card. Every task shows its assigned owner color-coded.

| Action | How |
|--------|-----|
| Rename a task | Double-click the task name → type → Enter to save |
| Reassign an owner | Click the owner badge → pick from dropdown |
| Spot gaps instantly | Unowned tasks pulse red — impossible to miss |
| Search tasks | Filter by keyword across all departments in real time |
| Filter by person | Show only one team member's tasks |

All edits auto-save to the browser. No data leaves your machine.

---

### Map View — Org Flow Visualization

A custom SVG diagram showing **Company → Departments → Owners**. Line thickness scales with task count, making workload distribution immediately visible.

| Action | How |
|--------|-----|
| Focus on one person | Click their owner circle — their connections highlight, everything else dims |
| See a department's tasks | Click any department box — panel slides in |
| Hover for counts | Tooltip on any department, owner, or connection line |
| Reset filters | Click Reset in the filter bar |

---

### Strategic Models View — Scaling Playbook

Four organizational models for property management companies:

| Model | Best For |
|-------|----------|
| Functional Specialization | Deep expertise by department |
| Portfolio Segmentation | Each PM owns a full unit portfolio end-to-end |
| Pod System | Cross-functional squads, high flexibility |
| **Hybrid Core + Flex** ⭐ | Growing companies (150 → 500+ units) |

Includes pros/cons and a real-world company example for each model. Six industry case studies covering AI adoption, centralized leasing, virtual teams, and restructuring outcomes.

---

### Live Stats Bar

Persistent across all views:
- Total tasks / Assigned / Unowned
- Department count
- Export to JSON or CSV
- Import a previously saved config
- Reset to defaults

---

## Customizing It for Your Company

All data lives in `js/data.js` as plain JavaScript objects. Edit it directly — no build step needed.

### Replace team member names

In `js/data.js`, update `ownerColors`:

```js
const ownerColors = {
  "Alex":    { class: "owner-alex",    hex: "#ff6f00" },
  "Jordan":  { class: "owner-jordan",  hex: "#1976d2" },
  "UNOWNED": { class: "owner-unowned", hex: "#d32f2f" },
};
```

Add a matching CSS class in `css/style.css`:

```css
.owner-alex   { background: #ff6f00; }
.owner-jordan { background: #1976d2; }
```

### Add a task to an existing department

```js
orgData.departments
  .find(d => d.id === 'leasing')
  .tasks.push({ name: "Follow up on expired listings", owner: "Alex" });
```

### Add a new department

```js
orgData.departments.push({
  id:    "hr",
  name:  "Human Resources",
  color: "#5e35b1",
  tasks: [
    { name: "Post job listings",      owner: "Jordan" },
    { name: "Run onboarding process", owner: "UNOWNED" },
  ]
});
```

### Update your company name

On first load, a prompt asks for your company name. It saves to `localStorage` and appears in the header and SVG map on every page load. To reset it, clear `localStorage` key `pm-ops-company-name` and reload.

---

## Project Structure

```
pm-ops-map/
├── index.html              Main layout, navigation, modals
├── css/
│   └── style.css           All styles, responsive breakpoints, animations
├── js/
│   ├── data.js             All data — departments, tasks, owners, strategic content
│   └── app.js              All rendering — views, SVG map, editing, filters, persistence
├── CONTRIBUTING.md         How to contribute
├── LICENSE.txt             MIT License
└── webpack.config.*.js     Optional build configs (not needed to run the app)
```

**Design principle:** All data lives in `data.js`. All rendering reads from that object. Edits in the UI mutate the in-memory object, keeping every view in sync. Nothing goes to a server.

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Structure | HTML5 | Semantic, no framework overhead |
| Styles | CSS3 (Flexbox, Grid) | Responsive without a CSS library |
| Logic | Vanilla JavaScript ES6 | No bundle size, zero dependencies to maintain |
| Visualization | Custom SVG engine | Full control over layout and interactivity |
| Persistence | localStorage | Edits survive page refresh without a backend |
| Build | Webpack 5 (optional) | Not required to run the app |

**Zero runtime dependencies.** Everything ships as static files.

---

## Browser Compatibility

Works in all modern browsers: Chrome, Firefox, Safari, Edge. No polyfills required.

---

## Development

```bash
npm install
npm start          # webpack-dev-server with hot reload at localhost:8080
npm test           # Jest test suite
npm run build      # Production bundle → dist/
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — especially department templates, mobile UX improvements, and new visualization options.

---

## License

MIT — free to use, modify, and deploy for any property management company. See [LICENSE.txt](LICENSE.txt).
