import {
  orgData, teamData, workOrders, countUnowned,
} from './state.js';
import { getOpsProfile, getCompanyName, _showActionToast } from './storage.js';
import { escapeHtml, _slugify } from './utils.js';

const LAUNCH_CHECKLIST_KEY = 'pm-ops-launch-checklist-v1';

const PROFILE_LABELS = {
  small: 'Under 100 doors',
  mid: '100-500 doors',
  large: '500+ doors',
  stability: 'Stabilize ownership',
  maintenance: 'Tighten maintenance flow',
  growth: 'Scale team capacity',
  compliance: 'Reduce compliance risk',
};

const FOCUS_BLUEPRINTS = {
  stability: {
    title: 'Ownership Stabilization',
    summary: 'Get every recurring responsibility named, backed up, and visible before the week gets noisy.',
    departments: ['tenant-comms', 'maintenance', 'delinquency', 'owner-relations'],
  },
  maintenance: {
    title: 'Maintenance Command Center',
    summary: 'Stand up intake, vendor routing, emergency escalation, and closeout discipline from day one.',
    departments: ['maintenance', 'vendors', 'unit-turns', 'tenant-comms'],
  },
  growth: {
    title: 'Scalable Team Capacity',
    summary: 'Separate daily operating work from growth work so new doors do not bury the team.',
    departments: ['leasing', 'applications', 'move-ins', 'accounting'],
  },
  compliance: {
    title: 'Compliance-Safe Operations',
    summary: 'Make the highest-risk duties explicit, documented, and reviewed on a reliable cadence.',
    departments: ['compliance', 'delinquency', 'accounting', 'reporting'],
  },
};

const BASE_CHECKLIST = [
  {
    id: 'owners',
    label: 'Assign every red UNOWNED responsibility',
    detail: 'Start with daily tenant, maintenance, rent, and owner communication work.',
    metric: () => countUnowned() === 0,
  },
  {
    id: 'maintenance',
    label: 'Define maintenance intake and escalation',
    detail: 'Name who monitors the queue, who dispatches vendors, and who handles after-hours emergencies.',
    metric: () => hasAssignedDepartment('maintenance') && hasAnyWorkOrderSignal(),
  },
  {
    id: 'rent',
    label: 'Lock the rent collection routine',
    detail: 'Confirm who reviews delinquencies, sends notices, answers ledger questions, and escalates legal handoff.',
    metric: () => hasAssignedDepartment('delinquency') && hasAssignedDepartment('accounting'),
  },
  {
    id: 'vendors',
    label: 'Create the starter vendor bench',
    detail: 'Add at least one work order with a vendor or document the preferred vendor owner.',
    metric: () => workOrders.some(w => (w.vendor || '').trim()),
  },
  {
    id: 'owner-reporting',
    label: 'Set owner reporting expectations',
    detail: 'Pick the owner communication lead and define the weekly update rhythm.',
    metric: () => hasAssignedDepartment('owner-relations'),
  },
];

const FOCUS_CHECKLIST = {
  maintenance: [
    {
      id: 'maintenance-aging',
      label: 'Review open repair aging every morning',
      detail: 'Use Work Orders to keep submitted and in-progress jobs from going stale.',
      metric: () => workOrders.some(w => w.status !== 'completed'),
    },
  ],
  growth: [
    {
      id: 'leasing-capacity',
      label: 'Separate leasing growth work from operations work',
      detail: 'Make sure showings, applications, and move-ins have named owners before adding doors.',
      metric: () => hasAssignedDepartment('leasing') && hasAssignedDepartment('applications') && hasAssignedDepartment('move-ins'),
    },
  ],
  compliance: [
    {
      id: 'inspection-cadence',
      label: 'Document inspection and compliance cadence',
      detail: 'Assign inspections, notices, and recordkeeping before exceptions start piling up.',
      metric: () => hasAssignedDepartment('unit-turns') && hasAssignedDepartment('compliance'),
    },
  ],
  stability: [
    {
      id: 'backup-coverage',
      label: 'Check backup coverage for overloaded roles',
      detail: 'Use Team Manager to rebalance any person carrying a large share of the operating map.',
      metric: () => getOverloadedOwners().length === 0,
    },
  ],
};

export function renderLaunchPlan() {
  const container = document.getElementById('launch-plan');
  if (!container || !orgData) return;

  const profile = getOpsProfile();
  const focus = profile.focus || 'stability';
  const blueprint = FOCUS_BLUEPRINTS[focus] || FOCUS_BLUEPRINTS.stability;
  const checklist = getLaunchChecklist(focus);
  const saved = readChecklistState();
  const completeCount = checklist.filter(item => saved[item.id] || item.metric()).length;
  const gaps = getLaunchGaps();
  const blueprintDepts = blueprint.departments
    .map(id => orgData.departments.find(dept => dept.id === id))
    .filter(Boolean);

  container.innerHTML = `
    <div class="launch-plan-header">
      <div>
        <div class="launch-kicker">Launch Plan</div>
        <h3>${escapeHtml(blueprint.title)}</h3>
        <p>${escapeHtml(blueprint.summary)}</p>
      </div>
      <div class="launch-score" aria-label="${completeCount} of ${checklist.length} launch steps complete">
        <strong>${completeCount}/${checklist.length}</strong>
        <span>ready steps</span>
      </div>
    </div>
    <div class="launch-plan-grid">
      <div class="launch-panel">
        <div class="launch-panel-title">Recommended Blueprint</div>
        <div class="launch-profile-line">
          ${escapeHtml(PROFILE_LABELS[profile.portfolioSize] || PROFILE_LABELS.mid)} / ${escapeHtml(PROFILE_LABELS[focus] || PROFILE_LABELS.stability)}
        </div>
        <div class="launch-dept-list">
          ${blueprintDepts.map(dept => `
            <button class="launch-dept-pill" style="--dept-color:${dept.color}" onclick="focusLaunchDepartment('${dept.id}')">
              ${escapeHtml(dept.name)}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="launch-panel">
        <div class="launch-panel-title">First-Week Checklist</div>
        <div class="launch-checklist">
          ${checklist.map(item => renderChecklistItem(item, saved[item.id])).join('')}
        </div>
      </div>
      <div class="launch-panel launch-gap-panel">
        <div class="launch-panel-title">Setup Gaps</div>
        ${gaps.length
          ? `<div class="launch-gap-list">${gaps.map(gap => `
              <div class="launch-gap">
                <strong>${escapeHtml(gap.title)}</strong>
                <span>${escapeHtml(gap.detail)}</span>
              </div>
            `).join('')}</div>`
          : '<p class="launch-empty">Core launch signals look good. Keep tightening owners, dates, and playbooks as the company grows.</p>'
        }
      </div>
    </div>
    <div class="launch-actions">
      <button class="btn btn-secondary" onclick="downloadLaunchPlan()">Download Launch Plan</button>
      <button class="btn btn-secondary" onclick="resetLaunchChecklist()">Reset Checklist</button>
    </div>
  `;
}

export function toggleLaunchChecklistItem(id, checked) {
  const state = readChecklistState();
  state[id] = Boolean(checked);
  writeChecklistState(state);
  renderLaunchPlan();
}

export function resetLaunchChecklist() {
  try { localStorage.removeItem(LAUNCH_CHECKLIST_KEY); } catch (_) {}
  renderLaunchPlan();
}

export function focusLaunchDepartment(deptId) {
  const deptEl = document.querySelector(`.department[data-id="${deptId}"]`);
  if (!deptEl) return;
  deptEl.style.display = '';
  deptEl.classList.add('expanded');
  deptEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  deptEl.classList.add('launch-highlight');
  setTimeout(() => deptEl.classList.remove('launch-highlight'), 1600);
}

export function downloadLaunchPlan() {
  const profile = getOpsProfile();
  const focus = profile.focus || 'stability';
  const blueprint = FOCUS_BLUEPRINTS[focus] || FOCUS_BLUEPRINTS.stability;
  const saved = readChecklistState();
  const checklist = getLaunchChecklist(focus);
  const gaps = getLaunchGaps();
  const company = getCompanyName();
  const lines = [
    `# ${company} Launch Plan`,
    '',
    `Blueprint: ${blueprint.title}`,
    `Portfolio: ${PROFILE_LABELS[profile.portfolioSize] || PROFILE_LABELS.mid}`,
    `Focus: ${PROFILE_LABELS[focus] || PROFILE_LABELS.stability}`,
    '',
    '## First-Week Checklist',
    ...checklist.map(item => `- [${saved[item.id] || item.metric() ? 'x' : ' '}] ${item.label} - ${item.detail}`),
    '',
    '## Setup Gaps',
    ...(gaps.length ? gaps.map(gap => `- ${gap.title}: ${gap.detail}`) : ['- No major setup gaps detected.']),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${_slugify(company)}-launch-plan.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  _showActionToast('Launch plan downloaded', 'save-toast--success');
}

function renderChecklistItem(item, manuallyChecked) {
  const complete = manuallyChecked || item.metric();
  return `
    <label class="launch-check-item ${complete ? 'is-complete' : ''}">
      <input type="checkbox" ${complete ? 'checked' : ''} onchange="toggleLaunchChecklistItem('${item.id}', this.checked)">
      <span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.detail)}</small>
      </span>
    </label>
  `;
}

function getLaunchChecklist(focus) {
  return [...BASE_CHECKLIST, ...(FOCUS_CHECKLIST[focus] || [])];
}

function readChecklistState() {
  try {
    return JSON.parse(localStorage.getItem(LAUNCH_CHECKLIST_KEY)) || {};
  } catch (_) {
    return {};
  }
}

function writeChecklistState(state) {
  try { localStorage.setItem(LAUNCH_CHECKLIST_KEY, JSON.stringify(state)); } catch (_) {}
}

function hasAssignedDepartment(deptId) {
  const dept = orgData.departments.find(d => d.id === deptId);
  return Boolean(dept && dept.tasks.some(task => task.owner !== 'UNOWNED'));
}

function hasAnyWorkOrderSignal() {
  return workOrders.length > 0 || hasAssignedDepartment('maintenance');
}

function getOverloadedOwners() {
  if (!teamData.employees.length || !orgData) return [];
  const counts = new Map(teamData.employees.map(emp => [emp.name, 0]));
  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      if (counts.has(task.owner)) counts.set(task.owner, counts.get(task.owner) + 1);
    });
  });
  const totalAssigned = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const average = totalAssigned / Math.max(counts.size, 1);
  return [...counts.entries()]
    .filter(([, count]) => count > Math.max(35, average * 1.8))
    .map(([name]) => name);
}

function getLaunchGaps() {
  const gaps = [];
  const unowned = countUnowned();
  const overloaded = getOverloadedOwners();
  const unassignedWorkOrders = workOrders.filter(w => w.assignee === 'UNASSIGNED' && w.status !== 'completed').length;

  if (unowned > 0) {
    gaps.push({
      title: `${unowned} unowned responsibilities`,
      detail: 'Assign these before using the map as the operating source of truth.',
    });
  }
  if (!teamData.employees.length) {
    gaps.push({
      title: 'No team roster',
      detail: 'Add the first employees in Team Manager so responsibilities have real owners.',
    });
  }
  if (unassignedWorkOrders > 0) {
    gaps.push({
      title: `${unassignedWorkOrders} unassigned open work order${unassignedWorkOrders === 1 ? '' : 's'}`,
      detail: 'Assign each open job so maintenance does not become invisible work.',
    });
  }
  if (!workOrders.length) {
    gaps.push({
      title: 'No sample maintenance workflow',
      detail: 'Create one starter work order to validate intake, assignment, vendor, and closeout steps.',
    });
  }
  if (overloaded.length > 0) {
    gaps.push({
      title: 'Potential role overload',
      detail: `${overloaded.slice(0, 3).join(', ')} may need backup coverage or reassignment.`,
    });
  }

  return gaps.slice(0, 5);
}
