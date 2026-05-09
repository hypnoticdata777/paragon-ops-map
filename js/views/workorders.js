// Work Orders kanban: 4-column pipeline (Submitted → Scheduled → In Progress → Completed).
import {
  workOrders, setWorkOrders,
  WO_STATUS_CYCLE, WO_STATUS_LABELS, WO_STATUS_COLORS,
  PRIORITY_LABELS, getEmployeeHex, getEmployeeNames,
} from '../state.js';
import { saveWorkOrders, logAudit } from '../storage.js';
import { escapeHtml, formatDueChip, formatWODate } from '../utils.js';
import { updateWorkOrderBeacon } from '../ui.js';

// ── Beacon ────────────────────────────────────────────────────────────────────
export { updateWorkOrderBeacon };

// ── Card builder ──────────────────────────────────────────────────────────────
function buildWorkOrderCard(wo) {
  const isUnassigned = wo.assignee === 'UNASSIGNED';
  const statusIdx    = WO_STATUS_CYCLE.indexOf(wo.status);
  const canAdvance   = statusIdx < WO_STATUS_CYCLE.length - 1;
  const nextLabel    = canAdvance ? WO_STATUS_LABELS[WO_STATUS_CYCLE[statusIdx + 1]] : '';
  const assigneeBg   = isUnassigned ? '#d32f2f' : getEmployeeHex(wo.assignee);
  const todayISO     = new Date().toISOString().slice(0, 10);
  const woOverdue    = wo.dueDate && wo.dueDate < todayISO && wo.status !== 'completed';

  return `
    <div class="wo-card priority-border-${wo.priority}${woOverdue ? ' wo-card--overdue' : ''}">
      <div class="wo-card-top">
        <div class="wo-card-location">
          <span class="wo-property">${escapeHtml(wo.property)}</span>
          ${wo.unit ? `<span class="wo-unit">Unit ${escapeHtml(wo.unit)}</span>` : ''}
        </div>
        <span class="priority-dot priority-${wo.priority}"
              title="Priority: ${PRIORITY_LABELS[wo.priority]}"></span>
      </div>
      <div class="wo-card-title">${escapeHtml(wo.title)}</div>
      ${wo.notes  ? `<div class="wo-card-notes">${escapeHtml(wo.notes)}</div>` : ''}
      ${wo.vendor ? `<div class="wo-vendor-label">&#128295; <strong>${escapeHtml(wo.vendor)}</strong></div>` : ''}
      <div class="wo-card-footer">
        <span class="wo-assignee-badge${isUnassigned ? ' owner-unowned' : ''}"
              style="${isUnassigned ? '' : `background:${assigneeBg}`}">
          ${isUnassigned ? '&#9888; Unassigned' : escapeHtml(wo.assignee)}
        </span>
        ${wo.cost > 0 ? `<span class="wo-cost">$${Number(wo.cost).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>` : ''}
        <div class="wo-card-actions">
          ${canAdvance
            ? `<button class="wo-advance-btn"
                       onclick="advanceWorkOrder('${wo.id}')"
                       title="Advance to ${nextLabel}">&#8594; ${nextLabel}</button>`
            : ''}
          <button class="wo-delete-btn"
                  onclick="deleteWorkOrder('${wo.id}')"
                  title="Delete work order">&#x2715;</button>
        </div>
      </div>
      <div class="wo-card-date">
        ${wo.dueDate ? `<span class="due-date-chip${woOverdue ? ' due-date-overdue' : ''}"
          title="Target: ${wo.dueDate}">${woOverdue ? '⚠ ' : '📅 '}${formatDueChip(wo.dueDate)}</span>` : ''}
        ${formatWODate(wo.createdAt)}
      </div>
    </div>`;
}

// ── Main render ───────────────────────────────────────────────────────────────
export function renderWorkOrdersView() {
  const inner = document.getElementById('workorders-view-inner');
  if (!inner) return;

  const openCount       = workOrders.filter(w => w.status !== 'completed').length;
  const unassignedCount = workOrders.filter(w => w.assignee === 'UNASSIGNED' && w.status !== 'completed').length;
  const completedCount  = workOrders.filter(w => w.status === 'completed').length;

  inner.innerHTML = `
    <div class="wo-toolbar">
      <div class="wo-toolbar-left">
        <h2 class="wo-heading">&#128295; Work Orders</h2>
        <div class="wo-stats-pills">
          <span class="wo-stat-pill wo-stat-open">${openCount} open</span>
          ${unassignedCount > 0
            ? `<span class="wo-stat-pill wo-stat-warn">${unassignedCount} unassigned</span>`
            : ''}
          <span class="wo-stat-pill wo-stat-done">${completedCount} completed</span>
        </div>
      </div>
      <button class="btn btn-primary" onclick="showNewWorkOrderModal()">+ New Work Order</button>
    </div>

    <div class="wo-board">
      ${WO_STATUS_CYCLE.map(status => {
        const cards = workOrders.filter(w => w.status === status);
        return `
          <div class="wo-column">
            <div class="wo-col-header" style="border-top-color:${WO_STATUS_COLORS[status]}">
              <span class="wo-col-title">${WO_STATUS_LABELS[status]}</span>
              <span class="wo-col-count">${cards.length}</span>
            </div>
            <div class="wo-col-body">
              ${cards.length === 0
                ? '<div class="wo-col-empty">No work orders</div>'
                : cards.map(wo => buildWorkOrderCard(wo)).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ── Modal — open / close / submit ─────────────────────────────────────────────
export function showNewWorkOrderModal() {
  const modal = document.getElementById('wo-modal');
  if (!modal) return;

  const sel = document.getElementById('wo-assignee');
  sel.innerHTML = '<option value="UNASSIGNED">&#8212; Unassigned &#8212;</option>';
  getEmployeeNames().forEach(name => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = name;
    sel.appendChild(opt);
  });

  ['wo-property','wo-unit','wo-title','wo-notes','wo-duedate','wo-vendor','wo-cost'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    if (el.tagName !== 'TEXTAREA') {
      el.onkeydown = e => {
        if (e.key === 'Enter')  commitNewWorkOrder();
        if (e.key === 'Escape') closeWorkOrderModal();
      };
    }
  });
  document.getElementById('wo-priority').value = 'medium';
  document.getElementById('wo-assignee').value = 'UNASSIGNED';

  modal.classList.add('visible');
  setTimeout(() => document.getElementById('wo-property').focus(), 50);
}

export function closeWorkOrderModal() {
  const modal = document.getElementById('wo-modal');
  if (modal) modal.classList.remove('visible');
}

export function commitNewWorkOrder() {
  const property = document.getElementById('wo-property').value.trim();
  const title    = document.getElementById('wo-title').value.trim();

  if (!property) {
    const el = document.getElementById('wo-property');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 400);
    el.focus();
    return;
  }
  if (!title) {
    const el = document.getElementById('wo-title');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 400);
    el.focus();
    return;
  }

  const rawCost = parseFloat(document.getElementById('wo-cost').value);
  const wo = {
    id:        `wo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    property,
    unit:      document.getElementById('wo-unit').value.trim(),
    title,
    notes:     document.getElementById('wo-notes').value.trim(),
    priority:  document.getElementById('wo-priority').value,
    status:    'submitted',
    assignee:  document.getElementById('wo-assignee').value,
    vendor:    document.getElementById('wo-vendor').value.trim(),
    dueDate:   document.getElementById('wo-duedate')?.value || null,
    cost:      isNaN(rawCost) || rawCost < 0 ? 0 : rawCost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  workOrders.push(wo);
  saveWorkOrders();
  closeWorkOrderModal();
  renderWorkOrdersView();
  updateWorkOrderBeacon();
}

// ── CRUD helpers ──────────────────────────────────────────────────────────────
export function advanceWorkOrder(id) {
  const wo = workOrders.find(w => w.id === id);
  if (!wo) return;
  const idx = WO_STATUS_CYCLE.indexOf(wo.status);
  if (idx < WO_STATUS_CYCLE.length - 1) {
    logAudit('wo_advanced', { title: wo.title, from: WO_STATUS_LABELS[wo.status], to: WO_STATUS_LABELS[WO_STATUS_CYCLE[idx + 1]] });
    wo.status    = WO_STATUS_CYCLE[idx + 1];
    wo.updatedAt = new Date().toISOString();
    saveWorkOrders();
    renderWorkOrdersView();
    updateWorkOrderBeacon();
  }
}

export function deleteWorkOrder(id) {
  const wo = workOrders.find(w => w.id === id);
  if (!wo) return;
  if (!confirm(`Delete this work order?\n\n"${wo.title}"\n${wo.property}${wo.unit ? ` · Unit ${wo.unit}` : ''}`)) return;
  logAudit('wo_deleted', { title: wo.title });
  setWorkOrders(workOrders.filter(w => w.id !== id));
  saveWorkOrders();
  renderWorkOrdersView();
  updateWorkOrderBeacon();
}
