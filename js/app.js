// Entry point — imports all modules, wires globals for inline HTML handlers, and boots the app.
import {
  setOrgData, setDefaultAffinities, setOwnerColors, setCurrentView,
} from './state.js';
// Maintainer note:
// index.html calls many functions through inline onclick/onchange/oninput
// attributes. ES modules do not expose imports to window automatically, so
// every HTML-called handler must be imported here and added to
// Object.assign(window, ...) below. If you rename, remove, or move a handler,
// update index.html and this window binding together or the GitHub Pages app
// can render while clicks silently fail.
import {
  loadFromStorage, loadTeamData, loadWorkOrders, loadAuditLog,
  applyOpsProfile, applyNavCompactState, applyCompanyName,
  resetStorage, toggleNavCompact, COMPANY_KEY,
} from './storage.js';
import {
  updateStats, updateBeacons,
  showOnboardingModal, submitCompanyName,
  initWelcomeGuide, dismissWelcomeGuide,
  requestNotificationPermission, initNotifications,
} from './ui.js';
import {
  renderTrackingView, toggleDepartment,
  startTaskEdit, showOwnerPicker, closeOwnerPicker, setTaskOwner,
  populateOwnerFilter, applyFilter, clearFilter,
  cycleTaskStatus, cycleTaskPriority,
  openDueDatePicker, setTaskDueDate,
  openDependencyPicker, setTaskDependency, clearTaskDependency,
} from './views/tracking.js';
import {
  renderMapControls, renderFlowMap,
  showDeptPanel, closeDeptPanel,
} from './views/map.js';
import {
  renderTeamView, selectPaletteColor,
  commitAddEmployee, removeEmployee, toggleAffinity,
  runAutoAssign, renderLegend,
  openRolePlaybook, closeRolePlaybook, downloadOpenRolePlaybook,
  openAuditLog, closeAuditLog, clearAuditLog,
} from './views/team.js';
import {
  renderWorkOrdersView,
  showNewWorkOrderModal, closeWorkOrderModal, commitNewWorkOrder,
  advanceWorkOrder, deleteWorkOrder,
} from './views/workorders.js';
import {
  exportJSON, exportCSV, importJSON,
  copyStateToClipboard, pasteStateFromClipboard,
  _saveUndoSnapshot, undoLastAction,
} from './io.js';
import {
  renderLaunchPlan, toggleLaunchChecklistItem, resetLaunchChecklist,
  focusLaunchDepartment, downloadLaunchPlan,
  startTeamSetup, showUnownedTasks, startWorkOrderSetup, downloadLaunchHandbook,
} from './launchPlan.js';
import { downloadOperationsHandbook } from './handbook.js';

// ── View switcher ─────────────────────────────────────────────────────────────
function switchView(view, tabEl) {
  setCurrentView(view);

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`${view}-view`).classList.add('active');

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  tabEl.classList.add('active');

  const filterBar = document.getElementById('filter-bar');
  if (view === 'tracking') {
    filterBar.style.display = 'flex';
  } else {
    filterBar.style.display = 'none';
    clearFilter();
  }

  closeOwnerPicker();

  if (view === 'map') {
    renderMapControls();
    renderFlowMap();
  } else if (view === 'team') {
    renderTeamView();
  } else if (view === 'workorders') {
    renderWorkOrdersView();
  }
}

// ── App init ──────────────────────────────────────────────────────────────────
function initApp() {
  // Order matters:
  // 1. Load team/work order/audit/task state from localStorage.
  // 2. Render Tracking, Launch Plan, stats, filters, and legend from that state.
  // 3. Apply company/profile UI after the data-backed panels exist.
  // launchPlan.js, ui.js, tracking.js, and team.js all depend on this sequence.
  loadTeamData();
  loadWorkOrders();
  loadAuditLog();
  loadFromStorage();
  renderTrackingView();
  renderLaunchPlan();
  updateStats();
  populateOwnerFilter();
  renderLegend();
  initWelcomeGuide();
  applyOpsProfile();
  renderLaunchPlan();
  applyNavCompactState();

  document.querySelectorAll('.department').forEach(dept => {
    dept.classList.add('expanded');
  });

  const savedName = localStorage.getItem(COMPANY_KEY);
  if (savedName) {
    applyCompanyName(savedName);
  } else {
    showOnboardingModal();
  }

  initNotifications();
}

// ── Undo keyboard shortcut (Ctrl+Z / Cmd+Z) ──────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    const active = document.activeElement;
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (!isTyping) {
      e.preventDefault();
      undoLastAction();
    }
  }
});

// ── Bootstrap: fetch config.json then start ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // GitHub Pages serves this repo directly from source. Keep index.html loading
  // this file as type="module", keep imports browser-compatible, and keep
  // config.json reachable at the repo root for this fetch.
  fetch('config.json')
    .then(r => {
      if (!r.ok) throw new Error(`config.json fetch failed: ${r.status}`);
      return r.json();
    })
    .then(config => {
      setOrgData(config.orgData);
      setDefaultAffinities(config.defaultAffinities);
      setOwnerColors(config.ownerColors);
      // Stamp each task with its original config name as a stable identity key.
      config.orgData.departments.forEach(dept => {
        dept.tasks.forEach(task => { task._configName = task.name; });
      });
      initApp();
    })
    .catch(err => {
      console.error('PM Ops Map: could not load config.json —', err);
      document.getElementById('departments').innerHTML =
        '<p style="padding:2rem;color:#d32f2f">⚠ Could not load config.json. ' +
        'Make sure you are serving this app over HTTP (e.g. <code>npm start</code>).</p>';
    });
});

// ── Expose globals for inline HTML onclick handlers ───────────────────────────
// Dependency map for editors:
// - index.html calls these names from onclick/onchange/oninput attributes.
// - launchPlan.js calls some through window.* for guided next-step buttons.
// - team.js calls window._saveUndoSnapshot before bulk auto-assign.
// Add new UI handlers here when adding inline HTML actions.
Object.assign(window, {
  // View
  switchView,
  // Tracking
  renderTrackingView,
  toggleDepartment,
  startTaskEdit,
  showOwnerPicker,
  closeOwnerPicker,
  setTaskOwner,
  applyFilter,
  clearFilter,
  cycleTaskStatus,
  cycleTaskPriority,
  openDueDatePicker,
  setTaskDueDate,
  openDependencyPicker,
  setTaskDependency,
  clearTaskDependency,
  // Map
  renderMapControls,
  renderFlowMap,
  showDeptPanel,
  closeDeptPanel,
  // Team
  renderTeamView,
  selectPaletteColor,
  commitAddEmployee,
  removeEmployee,
  toggleAffinity,
  runAutoAssign,
  renderLegend,
  openRolePlaybook,
  closeRolePlaybook,
  downloadOpenRolePlaybook,
  openAuditLog,
  closeAuditLog,
  clearAuditLog,
  // Work orders
  renderWorkOrdersView,
  showNewWorkOrderModal,
  closeWorkOrderModal,
  commitNewWorkOrder,
  advanceWorkOrder,
  deleteWorkOrder,
  // I/O
  exportJSON,
  exportCSV,
  importJSON,
  copyStateToClipboard,
  pasteStateFromClipboard,
  undoLastAction,
  // Undo snapshot (called from team.js runAutoAssign via window)
  _saveUndoSnapshot,
  // Storage
  resetStorage,
  toggleNavCompact,
  // UI
  showOnboardingModal,
  submitCompanyName,
  dismissWelcomeGuide,
  requestNotificationPermission,
  updateBeacons,
  updateStats,
  populateOwnerFilter,
  renderLaunchPlan,
  toggleLaunchChecklistItem,
  resetLaunchChecklist,
  focusLaunchDepartment,
  downloadLaunchPlan,
  startTeamSetup,
  showUnownedTasks,
  startWorkOrderSetup,
  downloadLaunchHandbook,
  downloadOperationsHandbook,
});
