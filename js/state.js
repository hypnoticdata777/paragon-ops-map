// Shared mutable application state and constants.
// All modules import state variables from here.
// Use the setter functions to reassign top-level lets — ES module importers
// get live bindings for reading but cannot reassign across module boundaries.

// ── Config (populated once from config.json fetch in app.js) ─────────────────
export let orgData           = null;
export let defaultAffinities = null;
export let ownerColors       = null;

export function setOrgData(v)           { orgData           = v; }
export function setDefaultAffinities(v) { defaultAffinities = v; }
export function setOwnerColors(v)       { ownerColors       = v; }

// ── View state ────────────────────────────────────────────────────────────────
export let currentView = 'tracking';
export function setCurrentView(v) { currentView = v; }

// ── Team & task state ─────────────────────────────────────────────────────────
export let teamData   = { employees: [] };
export let workOrders = [];
export let auditLog   = [];

export function setTeamData(v)   { teamData   = v; }
export function setWorkOrders(v) { workOrders = v; }
export function setAuditLog(v)   { auditLog   = v; }

// ── Map interaction state ─────────────────────────────────────────────────────
export const mapState = {
  hiddenOwners: new Set(),
  focusedOwner: null,
  focusedDept:  null,
};

// ── Undo & UI transient state ─────────────────────────────────────────────────
export let _undoSnapshot  = null;
export let _selectedColor = '#e53935'; // default to first palette entry

export function setUndoSnapshot(v)  { _undoSnapshot  = v; }
export function setSelectedColor(v) { _selectedColor = v; }

// ── Constants ─────────────────────────────────────────────────────────────────
export const COLOR_PALETTE = [
  '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab',
  '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047',
  '#7cb342', '#fb8c00', '#f4511e', '#ff6f00', '#1976d2',
  '#c62828', '#263238', '#6d4c41', '#546e7a', '#00695c'
];

export const STATUS_LABELS = {
  'todo':        'To Do',
  'in-progress': 'In Progress',
  'blocked':     '⚠ Blocked',
  'done':        '✓ Done'
};

export const PRIORITY_LABELS = {
  'high':   'High',
  'medium': 'Medium',
  'low':    'Low'
};

export const STATUS_CYCLE   = ['todo', 'in-progress', 'blocked', 'done'];
export const PRIORITY_CYCLE = ['high', 'medium', 'low'];

export const WO_STATUS_CYCLE  = ['submitted', 'scheduled', 'in-progress', 'completed'];
export const WO_STATUS_LABELS = {
  'submitted':   'Submitted',
  'scheduled':   'Scheduled',
  'in-progress': 'In Progress',
  'completed':   '✓ Completed',
};
export const WO_STATUS_COLORS = {
  'submitted':   '#ef6c00',
  'scheduled':   '#1976d2',
  'in-progress': '#7b1fa2',
  'completed':   '#2e7d32',
};

export const AUDIT_LABELS = {
  owner_changed:      'Owner Changed',
  status_changed:     'Status Changed',
  priority_changed:   'Priority Changed',
  name_changed:       'Task Renamed',
  auto_assign:        'Auto-Assign Run',
  import_file:        'Imported from File',
  import_clipboard:   'Imported from Clipboard',
  wo_advanced:        'Work Order Advanced',
  wo_deleted:         'Work Order Deleted',
  dependency_set:     'Dependency Set',
  dependency_cleared: 'Dependency Cleared',
};

// ── Employee helpers (read teamData + ownerColors) ────────────────────────────

// Returns the hex color for any owner name.
// Checks the live teamData roster first; falls back to ownerColors, then neutral gray.
export function getEmployeeHex(name) {
  if (name === 'UNOWNED') return '#d32f2f';
  const emp = teamData.employees.find(e => e.name === name);
  if (emp) return emp.hex;
  return ownerColors?.[name]?.hex || '#607d8b';
}

// Returns an array of all employee names in the current roster.
export function getEmployeeNames() {
  return teamData.employees.map(e => e.name);
}

// Tallies tasks per employee. Returns Map<name, taskCount>.
export function buildWorkloadMap() {
  const counts = new Map();
  getEmployeeNames().forEach(name => counts.set(name, 0));
  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      if (task.owner !== 'UNOWNED') {
        counts.set(task.owner, (counts.get(task.owner) || 0) + 1);
      }
    });
  });
  return counts;
}

// Returns the total number of UNOWNED tasks across all departments.
export function countUnowned() {
  return orgData.departments.reduce(
    (sum, dept) => sum + dept.tasks.filter(t => t.owner === 'UNOWNED').length,
    0
  );
}
