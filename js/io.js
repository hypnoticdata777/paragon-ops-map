// Export / Import / Clipboard sync / Undo stack.
import {
  orgData, teamData, setTeamData, workOrders, setWorkOrders,
  portfolio, setPortfolio, _undoSnapshot, setUndoSnapshot, currentView,
} from './state.js';
import {
  saveToStorage, saveTeamData, saveWorkOrders, savePortfolio, logAudit,
  getCompanyName, applyCompanyName, COMPANY_KEY,
  _showActionToast, _fileSlug,
} from './storage.js';
import { isValidISODate, _downloadBlob, _slugify } from './utils.js';
import { updateStats } from './ui.js';
import { renderTrackingView, populateOwnerFilter } from './views/tracking.js';
import { renderMapControls, renderFlowMap } from './views/map.js';
import { renderTeamView, renderLegend } from './views/team.js';
import { renderPortfolioView } from './views/portfolio.js';

// ── Undo stack (single-level, before bulk ops) ────────────────────────────────
export function _saveUndoSnapshot() {
  setUndoSnapshot(orgData.departments.map(dept => ({
    id: dept.id,
    tasks: dept.tasks.map(t => ({
      _configName: t._configName,
      name:        t.name,
      owner:       t.owner,
      status:      t.status   || 'todo',
      priority:    t.priority || 'medium',
      dueDate:     t.dueDate  || null
    }))
  })));
}

export function undoLastAction() {
  if (!_undoSnapshot) return;
  _undoSnapshot.forEach(snap => {
    const dept = orgData.departments.find(d => d.id === snap.id);
    if (!dept) return;
    snap.tasks.forEach(snapTask => {
      const task = dept.tasks.find(t => t._configName === snapTask._configName);
      if (!task) return;
      task.name     = snapTask.name;
      task.owner    = snapTask.owner;
      task.status   = snapTask.status;
      task.priority = snapTask.priority;
      task.dueDate  = snapTask.dueDate;
    });
  });
  setUndoSnapshot(null);
  saveToStorage();
  renderTrackingView();
  updateStats();
  populateOwnerFilter();
  renderLegend();
  if (currentView === 'map') { renderMapControls(); renderFlowMap(); }
  if (currentView === 'team') renderTeamView();
}

// ── Shared import logic ───────────────────────────────────────────────────────
function _applyImportedState(data) {
  data.departments.forEach(savedDept => {
    const dept = orgData.departments.find(d => d.id === savedDept.id);
    if (!dept) return;
    if (!Array.isArray(savedDept.tasks)) return;
    savedDept.tasks.forEach((savedTask) => {
      if (!savedTask.name || !savedTask.owner) return;
      const key  = savedTask._configName || savedTask.name;
      const task = dept.tasks.find(t => t._configName === key);
      if (!task) return;
      task.name  = savedTask.name;
      task.owner = savedTask.owner;
      if (savedTask.status)   task.status   = savedTask.status;
      if (savedTask.priority) task.priority = savedTask.priority;
      if (savedTask.dueDate !== undefined) task.dueDate = isValidISODate(savedTask.dueDate) ? savedTask.dueDate : undefined;
      if (savedTask.blockedBy !== undefined) task.blockedBy = savedTask.blockedBy || null;
    });
  });

  if (data.company) {
    try { localStorage.setItem(COMPANY_KEY, data.company); } catch (_) {}
    applyCompanyName(data.company);
  }

  if (data.team && Array.isArray(data.team.employees)) {
    setTeamData(data.team);
    saveTeamData();
  }

  if (Array.isArray(data.workOrders)) {
    setWorkOrders(data.workOrders);
    saveWorkOrders();
  }

  if (data.portfolio) {
    setPortfolio({
      properties: Array.isArray(data.portfolio.properties) ? data.portfolio.properties : [],
      vendors:    Array.isArray(data.portfolio.vendors)    ? data.portfolio.vendors    : [],
      tenants:    Array.isArray(data.portfolio.tenants)    ? data.portfolio.tenants    : [],
    });
    savePortfolio();
  }

  saveToStorage();
  renderTrackingView();
  updateStats();
  document.querySelectorAll('.department').forEach(d => d.classList.add('expanded'));
  populateOwnerFilter();
  renderLegend();
  renderPortfolioView();
}

// ── Export ────────────────────────────────────────────────────────────────────
export function exportJSON() {
  const payload = {
    company:    getCompanyName(),
    exported:   new Date().toISOString(),
    departments: orgData.departments.map(dept => ({
      id:    dept.id,
      name:  dept.name,
      tasks: dept.tasks.map(t => ({
        name:     t.name,
        owner:    t.owner,
        status:   t.status   || 'todo',
        priority: t.priority || 'medium',
        dueDate:  t.dueDate  || null
      }))
    })),
    team:       teamData,
    workOrders: workOrders,
    portfolio:  portfolio
  };
  _downloadBlob(
    JSON.stringify(payload, null, 2),
    'application/json',
    `pm-ops-${_fileSlug()}.json`
  );
}

export function exportCSV() {
  const rows = [['Department', 'Task', 'Owner', 'Status', 'Priority', 'Due Date']];
  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      rows.push([
        dept.name,
        task.name,
        task.owner,
        task.status   || 'todo',
        task.priority || 'medium',
        task.dueDate  || ''
      ]);
    });
  });
  downloadCSV(rows, `pm-ops-${_fileSlug()}.csv`);
}

export function exportPropertiesCSV() {
  const rows = [['Property', 'Units', 'Owner / Client', 'Notes', 'Created At']];
  portfolio.properties.forEach(property => {
    rows.push([
      property.name,
      Number(property.units || 0),
      property.owner || '',
      property.notes || '',
      property.createdAt || '',
    ]);
  });
  downloadCSV(rows, `pm-ops-${_fileSlug()}-properties.csv`);
}

export function exportTenantsCSV() {
  const rows = [['Tenant', 'Property', 'Unit', 'Status', 'Phone', 'Email', 'Created At']];
  portfolio.tenants.forEach(tenant => {
    rows.push([
      tenant.name,
      getPortfolioPropertyName(tenant.propertyId),
      tenant.unit || '',
      tenant.status || 'active',
      tenant.phone || '',
      tenant.email || '',
      tenant.createdAt || '',
    ]);
  });
  downloadCSV(rows, `pm-ops-${_fileSlug()}-tenants.csv`);
}

export function exportVendorsCSV() {
  const rows = [['Vendor', 'Trade', 'Phone', 'Email', 'Created At']];
  portfolio.vendors.forEach(vendor => {
    rows.push([
      vendor.name,
      vendor.trade || '',
      vendor.phone || '',
      vendor.email || '',
      vendor.createdAt || '',
    ]);
  });
  downloadCSV(rows, `pm-ops-${_fileSlug()}-vendors.csv`);
}

export function exportWorkOrdersCSV() {
  const rows = [[
    'Property', 'Unit', 'Tenant', 'Issue', 'Status', 'Priority', 'Assignee',
    'Vendor', 'Target Date', 'Estimated Cost', 'Notes', 'Created At', 'Updated At'
  ]];
  workOrders.forEach(wo => {
    rows.push([
      wo.property || '',
      wo.unit || '',
      wo.tenant || '',
      wo.title || '',
      wo.status || 'submitted',
      wo.priority || 'medium',
      wo.assignee || 'UNASSIGNED',
      wo.vendor || '',
      wo.dueDate || '',
      Number(wo.cost || 0),
      wo.notes || '',
      wo.createdAt || '',
      wo.updatedAt || '',
    ]);
  });
  downloadCSV(rows, `pm-ops-${_fileSlug()}-work-orders.csv`);
}

function getPortfolioPropertyName(propertyId) {
  if (!propertyId) return '';
  return portfolio.properties.find(property => property.id === propertyId)?.name || '';
}

function downloadCSV(rows, filename) {
  const csv = rows.map(row =>
    row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
  _downloadBlob(csv, 'text/csv', filename);
}

// ── Import ────────────────────────────────────────────────────────────────────
export function importJSON(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data.departments)) throw new Error('Missing departments');

      const hasExistingData = orgData.departments.some(dept =>
        dept.tasks.some(t => t.owner !== 'UNOWNED' || (t.status && t.status !== 'todo') || t.dueDate)
      );
      if (hasExistingData) {
        const fromLabel = data.company ? ` from "${data.company}"` : '';
        if (!confirm(`Importing${fromLabel} will overwrite your current task assignments, statuses, and due dates.\n\nContinue?`)) {
          inputEl.value = '';
          return;
        }
      }

      _saveUndoSnapshot();
      _applyImportedState(data);
      logAudit('import_file');
    } catch (e) {
      alert('Import failed: invalid or incompatible file.');
    } finally {
      inputEl.value = '';
    }
  };
  reader.readAsText(file);
}

// ── Clipboard sync ────────────────────────────────────────────────────────────
export function copyStateToClipboard() {
  const payload = JSON.stringify({
    company:    getCompanyName(),
    exported:   new Date().toISOString(),
    departments: orgData.departments.map(dept => ({
      id: dept.id,
      tasks: dept.tasks.map(t => ({
        _configName: t._configName,
        name:        t.name,
        owner:       t.owner,
        status:      t.status   || 'todo',
        priority:    t.priority || 'medium',
        dueDate:     t.dueDate  || null,
        blockedBy:   t.blockedBy || null
      }))
    })),
    team:       teamData,
    workOrders: workOrders,
    portfolio:  portfolio
  }, null, 2);

  if (!navigator.clipboard) {
    alert('Clipboard API not available. Use Export JSON instead.');
    return;
  }
  navigator.clipboard.writeText(payload)
    .then(() => _showActionToast('✓ State copied — paste on another device', 'save-toast--success'))
    .catch(() => _showActionToast('⚠ Clipboard access denied', 'save-toast--error'));
}

export async function pasteStateFromClipboard() {
  if (!navigator.clipboard) {
    alert('Clipboard API not available in this context.');
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);
    if (!Array.isArray(data.departments)) throw new Error('not a PM Ops state');
    const fromLabel = data.company ? ` from "${data.company}"` : '';
    if (!confirm(`Paste state${fromLabel} and replace current data on this device?`)) return;
    _saveUndoSnapshot();
    _applyImportedState(data);
    logAudit('import_clipboard');
    _showActionToast('✓ State pasted from clipboard', 'save-toast--success');
  } catch (e) {
    alert('Could not read PM Ops state from clipboard.\nMake sure you copied a valid export first.');
  }
}
