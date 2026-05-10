// Entry point — imports all modules, wires globals for inline HTML handlers, and boots the app.
import {
  setOrgData, setDefaultAffinities, setOwnerColors, setCurrentView,
} from './state.js';
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
// Webpack bundles ES modules into a closure, so functions are not automatically
// global. We assign them to window so that onclick="fn()" in index.html works.
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
  downloadOperationsHandbook,
});
