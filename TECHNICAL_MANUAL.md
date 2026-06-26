# PM Ops Map — Technical Manual

> Written for the high-context learner: big picture first, code last, analogies everywhere.

---

## How to Read This Manual

Every chapter follows the same 10-step sequence:

1. **Big Picture** — what problem does this exist to solve?
2. **System Context** — where does it fit?
3. **Architecture** — what are the pieces and how do they talk?
4. **Constants vs Variables** — what never changes vs what does?
5. **Mental Model** — one analogy that nails the mechanism
6. **Visualize the Flow** — step-by-step input → process → output
7. **Technical Details** — code, syntax, and exact definitions
8. **WHY** — why this rule exists and what breaks without it
9. **Check Your Understanding** — conceptual questions before memorizing
10. **Practice** — progressively harder examples

Read chapters 1 and 2 completely before skipping to any specific module chapter. They explain the foundations everything else builds on.

---

---

# Chapter 1 — The Big Picture

## 1.1 What Problem Does This Solve?

A property management company on day one typically has zero documented operating structure. No record of who owns what. No maintenance tracking. No organized team responsibilities. They run on verbal agreements, group texts, and someone's personal spreadsheet.

That spreadsheet breaks the moment the company has a second employee.

PM Ops Map exists to solve the **zero-to-structure** problem. You open it, enter your company name, and you instantly have:

- A complete documented map of 17 standard PM departments and 260+ tasks
- A way to assign ownership of every task to a real team member
- A maintenance work order pipeline
- A property, tenant, and vendor registry
- An exportable operations handbook you can hand to a new hire on day 1

The entire thing runs in a browser. No accounts. No monthly fee. No server. No database.

---

## 1.2 System Context — Where Does It Live?

```
[GitHub Repository]
        ↓
[GitHub Pages — serves static files]
        ↓
[Your Browser — runs the entire app]
        ↓
[localStorage — saves all your data inside the browser]
```

The app is a **static website** — a folder of HTML, CSS, and JavaScript files. When you open it:

1. The browser downloads the files from GitHub Pages (or your hard drive)
2. JavaScript runs entirely inside your browser tab
3. Your data is saved to `localStorage` — a private key-value store built into every browser
4. Nothing goes to a server. No API calls. No database.

> **Analogy:** Think of it like a really smart form that saves itself inside the browser window. The form is smart enough to be a whole app, but it never phones home.

---

## 1.3 The Core Constraint (and Why It Matters)

Because there is no backend, **everything is the browser's responsibility**. This shapes every architectural decision in the codebase:

| Need | Solution |
|------|----------|
| Save user data | `localStorage` |
| Load default structure | `config.json` (fetched once on startup) |
| Export data | Generate a file in-browser and trigger a download |
| Share data between devices | Copy/paste a JSON blob via clipboard |
| Undo an action | Keep one "snapshot" in memory before the action |

Every feature in this app is ultimately a creative answer to "how do we do this without a server?"

---

## 1.4 Check Your Understanding

Before moving on, answer these without looking back:

1. Where is user data stored — on a server or in the browser?
2. What happens to your data if you open the app in a different browser on the same computer?
3. Why does the app need `config.json` at all if it uses `localStorage`?

*(Answers: 1. Browser localStorage. 2. It's gone — localStorage is per-browser, per-device. 3. localStorage holds your edits; config.json holds the original structure to start from on first load.)*

---

---

# Chapter 2 — Architecture

## 2.1 Big Picture

The app is organized as a set of **ES Modules** — JavaScript files that each handle one concern and share data by importing from each other.

> **Analogy:** Think of the app as an office building. Each floor (module) handles a specific department. To get something done, you go to the right floor. Floors can send messages to each other, but each floor manages its own work.

---

## 2.2 The Module Map

```
config.json            ← the master rulebook (not a JS module — just data)

state.js               ← the front desk (everyone comes here to read shared data)
utils.js               ← the toolbox room (pure functions, no side effects)
storage.js             ← the file room (reads and writes to localStorage)
ui.js                  ← the lobby (stats bar, notifications, onboarding)
io.js                  ← the loading dock (import/export/clipboard/undo)
handbook.js            ← the print room (generates the operations handbook)
launchPlan.js          ← the onboarding office (first-week setup guide)
templates.js           ← the forms cabinet (role templates, SOP text, demo data)
stateSchema.js         ← the customs inspector (validates imported data)

views/tracking.js      ← Floor 1: task tracker (the main view)
views/map.js           ← Floor 2: org flow diagram (SVG visualization)
views/team.js          ← Floor 3: team manager + auto-assign engine
views/workorders.js    ← Floor 4: maintenance pipeline (kanban board)
views/portfolio.js     ← Floor 5: property/tenant/vendor registry
views/recurring.js     ← Floor 6: recurring work order templates

app.js                 ← the building directory (imports everything, boots the app)
index.html             ← the physical building (HTML structure, all the panels/modals)
css/style.css          ← the interior design (fonts, colors, layout, animations)
```

---

## 2.3 The Dependency Rule (The Most Important Rule in the Codebase)

**No circular dependencies.** Module A can import from module B, but then B cannot import from A. The arrows in the module graph can only point downward.

```
app.js
  ↓ imports from
views/*.js, io.js, handbook.js, launchPlan.js, recurring.js
  ↓ import from
state.js, storage.js, utils.js, ui.js
  ↓ import from
state.js, utils.js       ← these two import nothing else
```

> **WHY:** Circular imports in JavaScript ES modules cause one of the modules to receive `undefined` for some of its imported values, because JavaScript tries to resolve the import before the other module has finished loading. It's like two people each waiting for the other to walk through the door first — nobody goes anywhere. You'd get a bug that's very hard to diagnose.

> **Analogy:** It's like a company org chart — your manager can give you work, you can ask your assistant for help, but your assistant can't also be your manager's manager. The hierarchy has to be a one-way tree.

---

## 2.4 The window Globals Pattern

HTML has inline event handlers like this:

```html
<button onclick="cycleTaskStatus('leasing', 0)">Click me</button>
```

For `cycleTaskStatus` to work here, it has to exist on the global `window` object. But ES modules are **private by default** — they don't automatically put their functions on `window`.

The solution: at the bottom of `app.js`, every function that an HTML button might call is explicitly registered:

```javascript
Object.assign(window, {
  cycleTaskStatus,
  renderTrackingView,
  // ... 60+ more
});
```

> **Analogy:** It's like the building PA system. Each office (module) has its own phone system, but only the functions registered with the front desk (window) can be paged building-wide. If you add a new function that a button calls, you must register it at the front desk or the button silently does nothing.

> **WHY this rule hurts when broken:** When a function isn't on `window`, clicking the button produces no error in the console — the browser just finds `undefined` and calls nothing. It's a silent failure, which makes it one of the most frustrating bugs to diagnose.

---

## 2.5 Constants vs Variables

**What never changes (constants):**

| Item | Where | Value |
|------|-------|-------|
| Storage key names | `storage.js` | `'pm-ops-data-v1'`, `'pm-ops-team-v1'`, etc. |
| Status cycle order | `state.js` | `['todo', 'in-progress', 'blocked', 'done']` |
| Priority cycle order | `state.js` | `['high', 'medium', 'low']` |
| Color palette | `state.js` | 20 hardcoded hex codes |
| Department structure | `config.json` | (loaded once, then editable in memory) |

**What changes constantly:**

| Item | Lives in | Changes when |
|------|----------|--------------|
| Task owners, statuses, due dates | `orgData.departments[].tasks[]` | User edits in Tracking view |
| Team roster | `teamData.employees[]` | User adds/removes employees |
| Work orders | `workOrders[]` | User creates/advances/deletes work orders |
| Portfolio | `portfolio.properties/tenants/vendors[]` | User edits portfolio |
| Audit log | `auditLog[]` | Any meaningful action |

---

## 2.6 Check Your Understanding

1. If you add a new function `openSpecialPanel()` to `views/tracking.js` and hook it to a button in `index.html`, what two things do you need to do in `app.js`?
2. Why can't `state.js` import from `storage.js`?
3. What happens to a circular dependency at runtime?

*(Answers: 1. Import it in app.js, then add it to Object.assign(window, {...}). 2. It would create a circular dependency since storage.js already imports from state.js. 3. One module receives undefined for its imported values, causing silent bugs.)*

---

---

# Chapter 3 — The Startup Sequence

## 3.1 Mental Model

> **Analogy:** Imagine a restaurant opening for the day. There's a strict order: unlock the doors, check the inventory (config.json), brief the staff (state.js), load yesterday's orders (localStorage), set the tables (render views), and only then let customers in. Skip any step and the whole service is off.

## 3.2 The Startup Flow

```
Browser loads index.html
        ↓
Browser parses <script type="module" src="js/app.js">
        ↓
app.js runs — DOMContentLoaded fires
        ↓
fetch('config.json')          ← get the master rulebook
        ↓
setOrgData(config.orgData)    ← store departments + tasks in state.js
setDefaultAffinities(...)     ← store who should cover which dept
setOwnerColors(...)           ← store badge colors
        ↓
Stamp each task with _configName  ← creates a stable identity key
        ↓
initApp() runs:
  loadTeamData()              ← restore team from localStorage (or seed defaults)
  loadWorkOrders()            ← restore work orders from localStorage
  loadPortfolio()             ← restore properties/tenants/vendors
  loadAuditLog()              ← restore audit log
  loadFromStorage()           ← merge saved task state into orgData
        ↓
  renderTrackingView()        ← draw the task list
  renderLaunchPlan()          ← draw the beginner setup guide
  updateStats()               ← update the numbers in the stats bar
  populateOwnerFilter()       ← fill the owner dropdown
  renderLegend()              ← draw the team color legend
  renderPortfolioView()       ← draw the portfolio tab
  initWelcomeGuide()          ← show/hide the beginner guide
  applyOpsProfile()           ← set CSS data attributes for focus/size
  applyNavCompactState()      ← show/hide the nav tabs
        ↓
  If company name saved → applyCompanyName(savedName)
  If not → showOnboardingModal()    ← "Welcome! What's your company name?"
        ↓
  initNotifications()         ← request or initialize overdue notifications
        ↓
App is live
```

**WHY the order matters:**

- `loadFromStorage()` must come after `loadTeamData()` — because loading saved task state merges owners by name, and those names need to exist.
- `renderTrackingView()` must come after `loadFromStorage()` — because it reads from `orgData` which loadFromStorage has just updated.
- `initWelcomeGuide()` must come after render — because it looks for DOM elements that render just created.

---

## 3.3 The _configName Identity Key — Why It Exists

When `config.json` is first loaded, a task might be called `"Process move-in paperwork"`. The user can later rename it to `"Handle tenant move-in docs"`. The renamed task is still the same task.

Without a stable identity key, reloading the page would fail to reconnect the localStorage data (which refers to the old name) to the in-memory task object (which now has the new name).

The solution: every task is stamped with `task._configName = task.name` **before any edits are applied**. This `_configName` is saved to localStorage alongside every other field. On reload, the matching logic uses `_configName` as the primary key:

```javascript
const key  = savedTask._configName || savedTask.name;
const task = dept.tasks.find(t => t._configName === key);
```

> **Analogy:** It's like an employee badge number vs their display name. You can change your name on the badge (rename the task), but your employee number (`_configName`) stays the same forever. Payroll always uses the number, not the name.

---

---

# Chapter 4 — state.js — The Front Desk

## 4.1 Big Picture

Every module in the app needs access to shared data: the list of departments, the team roster, the work orders. `state.js` is the single place where all of that data lives.

> **Analogy:** Think of `state.js` as the front desk receptionist in the office building. Everyone — team managers, work order clerks, portfolio admins — checks in with the front desk to get the latest information. Nobody keeps their own private copy of the org chart.

## 4.2 What Lives in state.js

```javascript
// Loaded once from config.json
let orgData           // departments[] with tasks[] inside them
let defaultAffinities // which employees cover which departments (defaults)
let ownerColors       // badge colors per employee name

// Changes as the user navigates
let currentView       // 'tracking' | 'map' | 'team' | 'workorders' | 'portfolio'

// Changes as the user edits data
let teamData          // { employees: [{ name, hex, affinities }] }
let workOrders        // [{ id, property, unit, title, status, ... }]
let auditLog          // [{ ts, action, ...details }]
let portfolio         // { properties[], tenants[], vendors[] }

// Constants (never change at runtime)
STATUS_CYCLE          // ['todo', 'in-progress', 'blocked', 'done']
PRIORITY_CYCLE        // ['high', 'medium', 'low']
COLOR_PALETTE         // 20 hex codes for badge colors
STATUS_LABELS         // { 'todo': 'To Do', ... }
AUDIT_LABELS          // { owner_changed: 'Owner Changed', ... }
// ... more
```

## 4.3 Why Setter Functions Exist

A key ES module quirk: other modules can **read** exported `let` variables from `state.js` as live bindings. But they **cannot reassign** them directly.

```javascript
// This would silently fail or throw in some environments:
import { teamData } from './state.js';
teamData = newData;  // ❌ — can't reassign an imported binding

// The correct way:
import { setTeamData } from './state.js';
setTeamData(newData);  // ✅ — calls the setter inside state.js
```

> **WHY:** ES module live bindings are read-only on the importing side. This is a JavaScript language rule, not an opinion. The setter functions (`setTeamData`, `setWorkOrders`, etc.) exist as the only valid way to update these values from outside `state.js`.

## 4.4 The Employee Helper Functions

`state.js` also provides three utility functions that read from `teamData` and `orgData` — calculations used in many different modules:

```javascript
getEmployeeHex(name)   // → hex color string for badge rendering
getEmployeeNames()     // → ['Alice', 'Bob', ...]
buildWorkloadMap()     // → Map<name, taskCount>
countUnowned()         // → number of tasks with owner === 'UNOWNED'
```

> **Analogy:** These are like a receptionist who knows how to look up "how many open tickets does Bob have?" — they read from the central filing system and give you a quick answer without making you dig through the files yourself.

---

---

# Chapter 5 — storage.js — The File Room

## 5.1 Big Picture

`storage.js` is responsible for everything that survives a page refresh: saving to `localStorage`, loading from `localStorage`, and showing the user visual feedback when a save succeeds or fails.

> **Analogy:** `storage.js` is the file room. When you finish editing a document, you hand it to the file clerk (`saveToStorage()`). When you come back tomorrow, the file clerk retrieves it (`loadFromStorage()`). If the file room is full, the clerk waves a warning flag (`showSaveToast()`).

## 5.2 The localStorage Keys

Each major data type has its own key in `localStorage`:

| Key | Data |
|-----|------|
| `pm-ops-data-v1` | Task state (owner, status, priority, due date, notes, custom fields) |
| `pm-ops-team-v1` | Team roster (employee names, colors, affinities) |
| `pm-ops-workorders-v1` | Work orders |
| `pm-ops-portfolio-v1` | Properties, tenants, vendors |
| `pm-ops-audit-v1` | Audit log |
| `pm-ops-company-name` | Company name string |
| `pm-ops-profile-v1` | Operations focus + portfolio size |
| `pm-ops-nav-compact` | Whether the nav tabs are hidden |
| `pm-ops-guide-dismissed` | Whether the welcome guide was closed |
| `pm-ops-notif-date` | Last date overdue notifications were sent |
| `pm-ops-launch-checklist-v1` | Which launch checklist items are checked |
| `pm-ops-backups-v1` | Last 5 auto-backup snapshots |

> **WHY separate keys?** If everything were one giant blob, resetting only "company preferences" would require parsing the entire blob, removing specific fields, re-serializing it, and writing it back — error-prone and slow. Separate keys let you `localStorage.removeItem(COMPANY_KEY)` in one line.

## 5.3 The Save Flow

```
User clicks status pill on a task
          ↓
cycleTaskStatus() in tracking.js
  mutates orgData.departments[i].tasks[j].status
          ↓
calls saveToStorage()
          ↓
saveToStorage() in storage.js:
  builds a serializable snapshot of orgData
  JSON.stringify it
  localStorage.setItem(STORAGE_KEY, ...)
  calls showSaveToast() → "✓ Saved" toast appears for 2 seconds
```

## 5.4 The Load Flow (with Defensive Guards)

```
loadFromStorage() reads pm-ops-data-v1
          ↓
JSON.parse the string → array of saved departments
          ↓
For each saved department:
  find the matching live department by dept.id
  if not found → skip (config.json may have changed)
          ↓
  For each saved task:
    validate: must have a string name, string owner
    if invalid → skip (corrupted data doesn't crash the app)
          ↓
    find the matching live task by _configName
    if not found → skip (task may have been removed from config.json)
          ↓
    merge: name, owner, status, priority, dueDate, blockedBy, notes, customFields
    all fields are validated and size-capped before merging
```

> **Analogy:** It's like a bank reconciliation. You have a saved statement (localStorage) and the live accounts (orgData). You go line by line: does this saved record match a live account? Is the data valid? If yes, merge. If no, skip. Never crash because one line is bad.

## 5.5 The Nuclear Catch — What We Fixed

The original `loadFromStorage()` had:

```javascript
} catch (e) {
  localStorage.removeItem(STORAGE_KEY); // ← DELETED ALL USER DATA on any parse error
}
```

This was a "nuclear catch" — any JSON error (even a minor one) silently deleted everything the user had ever entered. We replaced it with:

```javascript
} catch (e) {
  console.error('Failed to parse saved task data:', e);
  _showActionToast('⚠ Could not load saved data — try exporting a backup', 'save-toast--error', 6000);
}
```

Now the data is preserved in `localStorage`. The user sees a warning and has a chance to export before anything is lost.

> **WHY this matters:** Data loss is catastrophic for a PM company. Someone might have 6 months of ownership assignments and custom task names in there. A corrupt byte shouldn't erase it all.

## 5.6 Auto-Backup Snapshots (Feature 4)

The backup system takes a "polaroid photo" of the entire workspace before high-risk operations:

```
Before an import → saveBackupSnapshot('Before import')
Before auto-assign → saveBackupSnapshot('Before auto-assign')
```

Each snapshot is:
```javascript
{
  ts:      "2026-06-26T14:30:00.000Z",
  label:   "Before import",
  company: "Paragon Properties",
  state:   JSON.stringify({
    departments: orgData.departments,
    team: teamData,
    workOrders,
    portfolio,
  })
}
```

The last 5 snapshots are stored as an array at `pm-ops-backups-v1`. Oldest are dropped when the array exceeds 5.

Restoring a backup:
1. Confirms with the user
2. Parses the stored state JSON
3. Merges the data back (same validation logic as `loadFromStorage`)
4. Saves each data type to its localStorage key
5. `setTimeout(() => location.reload(), 800)` — reloads the page after 800ms so all views sync cleanly

> **Analogy:** It's like a Time Machine backup. Before you upgrade your OS (import new data), macOS makes a snapshot. If something goes wrong, you roll back to the last snapshot.

---

---

# Chapter 6 — views/tracking.js — The Main View

## 6.1 Big Picture

The Tracking view is what most users spend 90% of their time in. It renders every department as a collapsible card with every task inside it. Every interactive element on a task row — owner badge, status pill, priority dot, due date, notes button, custom fields button — is rendered here and its click handler is defined here.

> **Analogy:** The Tracking view is like a massive wall of Post-it notes organized by project. Each note (task) has a color (owner), a sticker (status), and a tag (priority). You can stick new stickers on, write on them, or swap them between people, all without moving from your desk.

## 6.2 How renderTrackingView() Works

`renderTrackingView()` is a full re-render function. Every time it's called, it rebuilds the entire `#departments` div from scratch using a template literal:

```
Call renderTrackingView()
          ↓
Read orgData.departments from state.js
Apply active filters (_filterOwner, _filterStatus, _filterPriority, _filterSearch)
          ↓
For each department:
  Build a div.department with the dept header (name, progress bar, done/blocked counts)
  For each task in the department:
    Apply filter — skip tasks that don't match
    Build a div.task-item with:
      - bulk checkbox (if bulk mode is on)
      - priority dot (colored dot, onclick cycleTaskPriority)
      - task name (ondblclick startTaskEdit)
      - due date chip (if set, red if overdue)
      - dependency chip (if set, red/green based on blocker status)
      - 📝 notes button (solid if notes exist)
      - 🏷️ custom fields button (filled if fields exist)
      - status pill (onclick cycleTaskStatus)
      - owner badge (onclick showOwnerPicker)
          ↓
Set #departments.innerHTML to the built string
          ↓
Re-attach the owner picker if it was open (so it doesn't disappear on re-render)
```

> **WHY full re-render instead of fine-grained updates?** Fine-grained updates (only update what changed) are faster but require careful bookkeeping to avoid stale DOM. For a tool with 260 tasks, full re-render from a string is fast enough (< 10ms) and dramatically simpler to reason about. If a task changes, you just call `renderTrackingView()` and the whole list is fresh.

## 6.3 The Filter System

Four filter variables live at the module level in `tracking.js`:

```javascript
let _filterOwner  = '';
let _filterStatus = '';
let _filterPriority = '';
let _filterSearch = '';
```

`applyFilter()` reads these and calls `renderTrackingView()`. The filter bar in `index.html` calls these via `onchange` and `oninput` handlers.

**Debounce (Feature 1):**

The search input fires on every keystroke. Without debounce, typing "leasing" triggers 7 full re-renders. With debounce:

```javascript
let _filterDebounceTimer = null;

export function debounceApplyFilter() {
  clearTimeout(_filterDebounceTimer);
  _filterDebounceTimer = setTimeout(applyFilter, 200);
}
```

> **Analogy:** It's like a patient receptionist. Every time a character is typed, the timer resets ("wait, hold on"). Only after 200ms of silence does the filter actually run. It turns 7 re-renders into 1.

## 6.4 Bulk Select Mode (Feature 3)

Two module-level variables track bulk state:

```javascript
let _bulkMode    = false;
let _bulkSelected = new Set(); // stores "deptId::taskIdx" strings
```

When bulk mode is on, `renderTrackingView()` adds a checkbox to each visible task row. Checking a box calls `toggleTaskCheck(deptId, taskIdx)` which adds/removes the task from `_bulkSelected`.

`_updateBulkBar()` creates (or updates) a fixed div at the bottom of the screen — the "bulk action bar" — with two dropdowns: new owner and new status. Clicking "Apply" calls `applyBulkAction()` which:

1. Loops through `_bulkSelected`
2. Finds each task in `orgData`
3. Applies the selected owner/status
4. Calls `saveToStorage()` once
5. Calls `renderTrackingView()` to refresh
6. Exits bulk mode

> **Analogy:** It's the "select all" + "mark as read" pattern from email. You check the boxes, pick an action from the dropdown, and apply it to everything at once instead of clicking one by one.

## 6.5 Per-Task Notes (Feature 6)

Each task in `orgData` gets a `notes` field (a string up to 1,000 characters or `null`).

The 📝 button calls `openTaskNotes(deptId, taskIdx)` which:
1. Finds the task in `orgData`
2. Opens `#task-notes-modal` (a sliding panel)
3. Sets the modal title to the task name
4. Puts `task.notes` into a `<textarea>`
5. Attaches an `oninput` handler that saves on every keystroke

`_updateNotesIcon(deptId, taskIdx, task)` updates the button's class and title without re-rendering the whole view — it directly queries the DOM for that specific task's button.

## 6.6 Custom Task Fields (Feature 8)

Each task in `orgData` gets a `customFields` object (`{ key: value }`) or `null`.

The 🏷️ button calls `openCustomFields(deptId, taskIdx)` which opens `#custom-fields-modal`. Inside the modal:

- Existing fields are shown as rows: `[Key] [Value] [✕ delete]`
- An "Add" form at the bottom takes a key and value
- `addCustomField(deptId, taskIdx)` validates input, checks the 10-field max, saves, and re-renders the modal body
- `deleteCustomField(deptId, taskIdx, key)` removes the key and re-renders

Validation in `loadFromStorage()` caps keys at 40 chars, values at 200 chars, and rejects non-string values — so imported or pasted data can't inject garbage.

> **Analogy:** Custom fields are like sticky notes on a file folder. The folder (task) has standard fields printed on it (owner, status, due date), but you can stick your own notes on the side for anything the standard form doesn't cover — billing codes, permit numbers, unit references.

---

---

# Chapter 7 — views/team.js — The Auto-Assign Engine

## 7.1 Big Picture

The Team Manager tab does two things: it manages the employee roster, and it auto-assigns every unowned task using an affinity + workload algorithm.

> **Analogy:** Imagine a hospital charge nurse assigning patients to nurses at the start of a shift. Each nurse has specialties (affinities). The charge nurse tries to match patients to nurses with the right specialty, and among those, picks the least-loaded nurse. If no one has the right specialty, the least-loaded nurse gets the patient anyway so nobody falls through the cracks.

## 7.2 The Auto-Assign Algorithm

```
runAutoAssign()
          ↓
Snapshot the current state for undo
          ↓
saveBackupSnapshot('Before auto-assign')  ← in case the user wants to roll back
          ↓
Build a workload map: Map<employeeName, currentTaskCount>
          ↓
For each department:
  For each task with owner === 'UNOWNED':
    
    Step 1: Find employees with affinity for this department
    affinity_candidates = employees.filter(e => e.affinities.includes(dept.id))
    
    Step 2: If affinity candidates exist, pick the one with the fewest tasks
    If no affinity candidates, use all employees instead
    
    Step 3: Pick the employee with min(taskCount) from the candidate list
    
    Step 4: Assign task.owner = winner.name
    Increment winner's count in the workload map
    Log to audit log: { action: 'auto_assign', task, from: 'UNOWNED', to: winner }
          ↓
saveToStorage()
renderTeamView()
renderTrackingView()
updateStats()
```

> **WHY the workload map is updated in the loop:** If you only read the initial workload counts, the algorithm might assign 10 tasks to the same person (because their count looked low). By updating the map after each assignment, the next task sees the updated counts and picks someone less loaded.

## 7.3 Employee Name Validation (Feature 2)

When adding a new employee:

```javascript
const name = input.trim().slice(0, 60);  // cap at 60 chars
if (!name) { shakeInput(el); return; }
if (name.toLowerCase() === 'unowned') {
  shakeInput(el);
  alert('"UNOWNED" is reserved. Please use a real name.');
  return;
}
```

> **WHY block "UNOWNED"?** The entire app uses `owner === 'UNOWNED'` as the sentinel value for "no one owns this". If someone named an employee "UNOWNED", every task would appear assigned (because it has a non-UNOWNED owner) but no real person would be responsible. The auto-assign engine would skip all those tasks thinking they're covered.

---

---

# Chapter 8 — views/workorders.js & recurring.js

## 8.1 The Work Order Data Model

Each work order is a plain object:

```javascript
{
  id:        "wo-1719403200000-42391",  // timestamp + random number for uniqueness
  property:  "Sunrise Apartments",
  unit:      "3B",
  tenant:    "Jordan Smith",
  title:     "HVAC not cooling",
  notes:     "Tenant says it's been 3 days",
  priority:  "high",
  status:    "submitted",              // submitted → scheduled → in-progress → completed
  assignee:  "Mike",
  vendor:    "Cool Air HVAC",
  dueDate:   "2026-07-01",
  cost:      250,
  createdAt: "2026-06-26T14:00:00.000Z",
  updatedAt: "2026-06-26T14:00:00.000Z",
}
```

`advanceWorkOrder(id)` finds the work order by id, looks up its current status in `WO_STATUS_CYCLE`, moves it to the next status, updates `updatedAt`, saves, logs, and re-renders.

## 8.2 Recurring Templates (Feature 5)

> **Analogy:** Recurring templates are like a stamp set. The stamp (template) always has the same shape — the same list of tasks — but every time you use it, you're stamping a fresh piece of paper (new work orders) with a new property name and due date.

The two-modal flow:

```
User clicks 📅 Recurring Templates
          ↓
openRecurringModal() → shows 5 template cards
          ↓
User clicks "Use this template →" on one card
          ↓
previewRecurringTemplate(id):
  stores the template id in _pendingTemplateId
  closes the first modal
  opens the confirm modal with:
    - property name input
    - due date input (defaults to 7 days from today)
          ↓
User fills in property + due date, clicks "Create Work Orders"
          ↓
applyPendingRecurringTemplate():
  reads property + dueDate from inputs
  maps each template task to a new work order object
  setWorkOrders([...workOrders, ...newOrders])
  saveWorkOrders()
  logAudit('wo_recurring', { label, count })
  renderWorkOrdersView()
  shows success toast
```

> **WHY a two-modal flow?** Directly applying a template the moment a card is clicked would create 7-9 work orders with no property name and today as the due date. The confirm modal lets the user set context that applies to all created work orders in one step, rather than editing each work order card individually afterward.

---

---

# Chapter 9 — io.js — The Loading Dock

## 9.1 Big Picture

`io.js` handles everything related to getting data in and out of the app: JSON export/import, CSV exports, clipboard sync, and the single-level undo stack.

> **Analogy:** The loading dock of a warehouse. Exports are outgoing shipments — the app packs a box (serializes state) and sends it out (triggers a download). Imports are incoming shipments — the dock inspector (stateSchema.js) checks the manifest (validates the data), shows a receiving report (import preview), and only then moves the goods into the warehouse (merges into state).

## 9.2 The Export Flow

```
exportJSON() or exportCSV()
          ↓
Read current state: orgData, teamData, workOrders, portfolio
Serialize to JSON or build CSV string
          ↓
_downloadBlob(content, mimeType, filename):
  new Blob([content], { type: mimeType })
  URL.createObjectURL(blob) → temporary URL
  create a hidden <a> element, set href + download attribute
  programmatically click it → browser triggers download dialog
  remove the <a> element
  URL.revokeObjectURL → free memory
```

## 9.3 The Import Flow (with Validation)

The import flow is careful because bad data could corrupt the entire workspace.

```
User picks a file → importJSON()
          ↓
FileReader reads the file as text
          ↓
JSON.parse the text
          ↓
stateSchema.validateImport(parsed):
  checks schema version
  counts matched departments, tasks, skipped records
  checks for invalid due dates
  returns a report object
          ↓
openImportReview(report, parsed):
  shows a preview modal with the report
  "X departments matched, Y tasks will be updated, Z skipped"
  user can Cancel or Confirm
          ↓
confirmPendingImport():
  saveBackupSnapshot('Before import')  ← polaroid photo before overwriting
  _saveUndoSnapshot()                  ← one-level undo
  merge the validated data into orgData, teamData, workOrders, portfolio
  save all data types to localStorage
  re-render all views
```

## 9.4 The Undo Stack

The undo system is deliberately simple: **one level only**.

```javascript
let _undoSnapshot = null;  // in state.js

function _saveUndoSnapshot() {
  _undoSnapshot = JSON.stringify({
    departments: orgData.departments,
    team: teamData,
    workOrders,
    portfolio,
  });
}

function undoLastAction() {
  if (!_undoSnapshot) return;
  // parse and restore the snapshot
  // save to localStorage
  // re-render
  _undoSnapshot = null;  // clear — can only undo once
}
```

Ctrl+Z / Cmd+Z triggers `undoLastAction()` — but only if the user isn't typing in a text field.

> **WHY only one level?** A multi-level undo stack requires storing multiple serialized states in memory. For a PM workspace with 260 tasks, team data, portfolio, and work orders, one snapshot can be 50-100 KB. Ten levels = 500 KB-1 MB just for undo history. The choice was: simpler, cheaper, sufficient for accidental bulk actions (which is the primary use case).

---

---

# Chapter 10 — handbook.js — The Print Room

## 10.1 Big Picture

`handbook.js` is a **read-only** module. It reads the current app state and generates a Markdown document (or HTML document) that serves as a starter Operations Manual.

> **Analogy:** The handbook module is like a report generator in an ERP system. It doesn't store anything. It doesn't modify anything. It just reads the current data and prints a formatted document. Like a snapshot of the scoreboard printed to a PDF.

## 10.2 What the Handbook Contains

1. Company name + portfolio size + operations focus
2. Operating snapshot (assigned count, done count, blocked count, unowned count, open work orders)
3. Portfolio registry (properties, tenants, vendors)
4. First-week operating rhythm (7-day plan)
5. Setup gaps (what's missing based on current state)
6. Critical coverage analysis (leasing, rent collection, maintenance, compliance, renewals, emergencies)
7. Team roster + workload table
8. Department-by-department SOP checklists
9. Work order summary
10. Starter SOP templates (daily huddle, maintenance intake, owner updates, move-in handoffs)
11. Handoff notes section

## 10.3 HTML Handbook (Feature 7)

The HTML version (`downloadOperationsHandbookHTML()`) calls `buildOperationsHandbookMarkdown()` to get the Markdown string, then converts it to a self-contained HTML page with `markdownToPrintHtml()`. That function wraps the content in a simple HTML document with embedded print-friendly CSS.

The resulting `.html` file opens directly in any browser and prints cleanly — no Markdown reader required.

---

---

# Chapter 11 — utils.js — The Toolbox Room

## 11.1 What Makes a Good Utility Function

A utility function is **pure** — it takes inputs, returns an output, and has zero side effects. It doesn't touch the DOM, doesn't read from `localStorage`, doesn't import from other modules. This makes it:

- Easy to test in isolation
- Safe to import anywhere without creating dependency problems
- Predictable: same input always gives same output

## 11.2 The Key Functions

### `escapeHtml(str)`

Converts dangerous characters to HTML entities before they can be rendered as markup:

```
"<script>evil()</script>"
          ↓
"&lt;script&gt;evil()&lt;/script&gt;"
```

> **WHY this is critical:** Every time user-provided text (task names, employee names, notes, company name) is inserted into an HTML template literal, it must be escaped. Without this, a user who types `<img src=x onerror="alert(1)">` as a task name could execute JavaScript in the browser — a classic XSS (Cross-Site Scripting) attack. Even though this is a single-user local app, the rule is important for when it's shared or hosted.

> **Analogy:** It's like the security guard at the door. Every piece of user input that wants to enter the HTML building must be checked: angle brackets get rewritten as harmless text (`&lt;`), quotation marks too (`&quot;`). Nothing sneaks in as executable markup.

### `isValidISODate(str)`

Returns `true` only for valid `YYYY-MM-DD` strings:

```javascript
isValidISODate('2026-06-26')  // true
isValidISODate('2026-13-01')  // false — month 13 doesn't exist
isValidISODate('tomorrow')    // false
isValidISODate(null)          // false
```

The implementation parses the date twice: once with a regex for format, and once by constructing a `Date` object and checking that `toISOString()` round-trips back to the same string. This catches edge cases like February 30 that pass the regex but aren't real dates.

### `_downloadBlob(content, mimeType, filename)`

The only way to trigger a file download from JavaScript in a browser without a server. Creates a temporary object URL, attaches it to a hidden anchor tag, clicks it, then immediately cleans up.

### `shakeInput(el)`

Adds the CSS class `shake` to an element for 400ms, triggering a CSS animation that shakes the element left-right. Used as the "validation failed" signal — instead of an alert box, the offending input shakes.

---

---

# Chapter 12 — The XSS Defense Layer

## 12.1 The Problem

The app renders user data into HTML constantly. Task names, employee names, company names, work order notes — all of these appear in template literals like:

```javascript
`<div class="task-name">${task.name}</div>`
```

If `task.name` were `<img src=x onerror="stealData()">`, that HTML would execute.

## 12.2 The Solution — escapeHtml() Everywhere

Every place user data enters an HTML template literal, `escapeHtml()` wraps it:

```javascript
`<div class="task-name">${escapeHtml(task.name)}</div>`
```

The `escapeHtml` function is imported at the top of every view file. It's a convention that every contributor must follow.

## 12.3 The jsonAttr() Function

There's a trickier case: function calls inside HTML attributes:

```javascript
// Dangerous — if task.name contains quotes, this breaks the attribute
`<button onclick="doThing('${task.name}')">Click</button>`

// Safe — jsonAttr() JSON-encodes the value and escapes quotes for HTML attribute context
`<button onclick="doThing(${jsonAttr(task.name)})">Click</button>`
```

`jsonAttr()` double-encodes: first `JSON.stringify` (adding surrounding quotes and escaping internal quotes), then replaces `"` with `&quot;` for the HTML attribute context.

---

---

# Chapter 13 — The CI Pipeline

## 13.1 What CI Does

CI (Continuous Integration) runs automatically on every push and pull request. It catches problems before they reach the live site.

```
git push to GitHub
          ↓
GitHub Actions triggers .github/workflows/ci.yml
          ↓
Step 1: npm ci         ← install exact dependency versions from package-lock.json
Step 2: npm test       ← run Jest unit tests
Step 3: npm audit --omit=dev --audit-level=moderate  ← check for known vulnerabilities
Step 4: npm run build  ← webpack production bundle (catches import errors)
```

## 13.2 Why --omit=dev

All packages in this project are `devDependencies` — webpack, jest, webpack-dev-server. The deployed app is just static HTML/CSS/JS with zero npm packages at runtime.

`npm audit` originally failed because `webpack-dev-server` (a dev tool) had vulnerabilities. Adding `--omit=dev` tells npm audit to only check runtime dependencies — of which there are none.

> **Analogy:** Auditing a restaurant for health code violations shouldn't include the chef's personal car — only the kitchen equipment matters. `--omit=dev` tells the auditor to check only the kitchen (runtime), not the parking lot (devDependencies).

## 13.3 The Jest Tests

Four test files cover the pure logic:

| File | What it tests |
|------|--------------|
| `utils.test.js` | `escapeHtml`, `isValidISODate`, `getTodayISO`, `formatDueChip`, etc. — 37 tests |
| `data.test.js` | `config.json` structure — every department has required fields, every task has name + owner |
| `stateSchema.test.js` | Import/export schema version and validation report |
| `templates.test.js` | Role template and SOP template structure |

The `.cjs` mirror files (`utils.cjs`, `stateSchema.cjs`, `templates.cjs`) exist because Jest runs in CommonJS mode and can't natively import ES module `export` syntax. The mirrors use `module.exports =` instead of `export`. When you change `utils.js`, you must mirror the change in `utils.cjs` or the tests will test old behavior.

---

---

# Chapter 14 — How to Add a New Feature

This chapter walks through a real extension example to cement all the concepts above.

## 14.1 Example: Add a "Star" Button to Tasks

**Goal:** Let users star important tasks. Starred tasks get a ⭐ icon. Stars persist.

**Step 1: Add the field to the data model**

No code change needed — `orgData` tasks are plain objects. You can add any field you want in JavaScript. The field just needs to be saved and loaded.

**Step 2: Save the field in storage.js**

In `saveToStorage()`, add `starred` to the task payload:

```javascript
tasks: dept.tasks.map(t => ({
  // ... existing fields
  starred: t.starred || false,
}))
```

In `loadFromStorage()`, merge it:

```javascript
if (typeof savedTask.starred === 'boolean') task.starred = savedTask.starred;
```

**Step 3: Render the button in tracking.js**

Inside the task row template in `renderTrackingView()`:

```javascript
<button class="task-star-btn${task.starred ? ' task-star-btn--starred' : ''}"
        onclick="toggleTaskStar('${dept.id}', ${taskIdx})"
        title="${task.starred ? 'Unstar' : 'Star this task'}"
        aria-label="Star task">⭐</button>
```

**Step 4: Add the handler function in tracking.js**

```javascript
export function toggleTaskStar(deptId, taskIdx) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;
  const task = dept.tasks[taskIdx];
  if (!task) return;
  task.starred = !task.starred;
  saveToStorage();
  _updateStarIcon(deptId, taskIdx, task); // update just the button, no full re-render
}
```

**Step 5: Register in app.js**

Add to the import:
```javascript
import { ..., toggleTaskStar } from './views/tracking.js';
```

Add to `Object.assign(window, {...})`:
```javascript
toggleTaskStar,
```

**Step 6: Style in style.css**

```css
.task-star-btn { opacity: 0.3; background: none; border: none; cursor: pointer; }
.task-star-btn--starred { opacity: 1; }
```

That's a complete feature addition. No backend. No schema migration. No build step required to test it.

---

## 14.2 Check Your Understanding (Final)

1. Why does `toggleTaskStar` need to be in `Object.assign(window, {...})`?
2. Why does `saveToStorage()` need to explicitly include `starred` in its payload?
3. If you forget to add `starred` to `loadFromStorage()`, what happens to the user's stars after a page refresh?
4. Why is it safe to add a new field to task objects in JavaScript without any "migration"?
5. What would happen if you called `renderTrackingView()` instead of `_updateStarIcon()` inside `toggleTaskStar()`?

*(Answers: 1. HTML onclick handlers can only call window-level functions. 2. saveToStorage builds a fresh serialized snapshot — anything not included gets lost. 3. They're lost — loadFromStorage doesn't know to restore the field. 4. JS objects are dynamic; adding a field to an in-memory object is instant. Old saved data without the field is handled by the `|| false` default in the load logic. 5. It would work but cause a full re-render of 260 tasks — much slower than updating one button's class. Both are correct; one is efficient.)*

---

---

# Quick Reference

## Storage Keys

| Key | Description |
|-----|-------------|
| `pm-ops-data-v1` | Task state |
| `pm-ops-team-v1` | Team roster |
| `pm-ops-workorders-v1` | Work orders |
| `pm-ops-portfolio-v1` | Properties, tenants, vendors |
| `pm-ops-audit-v1` | Audit log |
| `pm-ops-company-name` | Company name |
| `pm-ops-profile-v1` | Operations focus + portfolio size |
| `pm-ops-nav-compact` | Nav hide/show state |
| `pm-ops-guide-dismissed` | Welcome guide dismissed |
| `pm-ops-notif-date` | Last notification date |
| `pm-ops-launch-checklist-v1` | Launch checklist progress |
| `pm-ops-backups-v1` | Last 5 auto-backup snapshots |

## Status Values

`todo` → `in-progress` → `blocked` → `done`

## Priority Values

`high` → `medium` → `low`

## Work Order Status Values

`submitted` → `scheduled` → `in-progress` → `completed`

## Module Responsibility

| Module | Owns |
|--------|------|
| `state.js` | Shared data + constants |
| `storage.js` | localStorage read/write + toasts + backups |
| `utils.js` | Pure functions (escape, date, download, shake) |
| `ui.js` | Stats bar + notifications + onboarding modal |
| `io.js` | Export/import + clipboard + undo |
| `handbook.js` | Markdown + HTML handbook generator |
| `launchPlan.js` | Beginner setup guide + data quality checks |
| `templates.js` | Role templates + SOP text + demo data |
| `stateSchema.js` | Import validation |
| `views/tracking.js` | Task list + filters + bulk mode + notes + custom fields |
| `views/map.js` | SVG org flow diagram |
| `views/team.js` | Team roster + auto-assign engine |
| `views/workorders.js` | Work order kanban board |
| `views/portfolio.js` | Property/tenant/vendor registry |
| `views/recurring.js` | Recurring work order templates |
| `app.js` | Entry point + window globals + view switcher |

---

*End of Technical Manual — PM Ops Map*
