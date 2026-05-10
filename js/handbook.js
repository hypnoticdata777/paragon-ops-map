import {
  orgData, teamData, workOrders,
  STATUS_LABELS, PRIORITY_LABELS, WO_STATUS_LABELS,
  buildWorkloadMap, countUnowned,
} from './state.js';
import {
  getCompanyName, getOpsProfile, _fileSlug, _showActionToast,
} from './storage.js';
import { _downloadBlob, isTaskOverdue } from './utils.js';

// Maintainer note:
// This module is read-only against app state. It generates the Markdown
// Operations Handbook from state.js and storage.js, then downloads it through
// utils._downloadBlob. The stats button in index.html calls
// downloadOperationsHandbook through app.js -> window, so keep that export name
// stable or update app.js and index.html together.

const PROFILE_LABELS = {
  small: 'Under 100 doors',
  mid: '100-500 doors',
  large: '500+ doors',
  stability: 'Stabilize ownership',
  maintenance: 'Tighten maintenance flow',
  growth: 'Scale team capacity',
  compliance: 'Reduce compliance risk',
};

export function downloadOperationsHandbook() {
  _downloadBlob(
    buildOperationsHandbookMarkdown(),
    'text/markdown',
    `pm-ops-${_fileSlug()}-operations-handbook.md`
  );
  _showActionToast('Operations handbook downloaded', 'save-toast--success');
}

export function buildOperationsHandbookMarkdown() {
  const company = getCompanyName();
  const profile = getOpsProfile();
  const generatedAt = new Date();
  const summary = getOperatingSummary();
  const launchGaps = getHandbookGaps();

  const lines = [
    `# ${company} Operations Handbook`,
    '',
    `Generated: ${generatedAt.toLocaleString()}`,
    `Portfolio: ${PROFILE_LABELS[profile.portfolioSize] || PROFILE_LABELS.mid}`,
    `Operating focus: ${PROFILE_LABELS[profile.focus] || PROFILE_LABELS.stability}`,
    '',
    '## Operating Snapshot',
    '',
    `- Total responsibilities: ${summary.totalTasks}`,
    `- Assigned responsibilities: ${summary.assignedTasks}`,
    `- Unowned responsibilities: ${summary.unownedTasks}`,
    `- Blocked responsibilities: ${summary.blockedTasks}`,
    `- Overdue responsibilities: ${summary.overdueTasks}`,
    `- Team members: ${teamData.employees.length}`,
    `- Open work orders: ${summary.openWorkOrders}`,
    '',
    '## First-Week Operating Rhythm',
    '',
    '- Daily: review unowned, blocked, overdue, and open maintenance work.',
    '- Weekly: review workload balance, owner communications, delinquency, and compliance tasks.',
    '- Monthly: update department owners, remove stale tasks, and export a fresh handbook.',
    '',
    '## Setup Gaps To Close',
    '',
    launchGaps.length ? launchGaps.map(gap => `- ${gap}`).join('\n') : '- No major setup gaps detected.',
    '',
    '## Team Roster And Workload',
    '',
    buildTeamSection(),
    '',
    '## Department SOPs',
    '',
    orgData.departments.map(buildDepartmentSection).join('\n\n'),
    '',
    '## Maintenance Work Orders',
    '',
    buildWorkOrderSection(),
    '',
    '## Handoff Notes',
    '',
    '- Every UNOWNED responsibility needs a named owner before this handbook is complete.',
    '- Treat blocked and overdue items as the first agenda for the next operating meeting.',
    '- Re-export this handbook after any major team, portfolio, or workflow change.',
    '',
  ];

  return lines.join('\n');
}

function getOperatingSummary() {
  const tasks = orgData.departments.flatMap(dept => dept.tasks);
  return {
    totalTasks: tasks.length,
    assignedTasks: tasks.filter(task => task.owner !== 'UNOWNED').length,
    unownedTasks: countUnowned(),
    blockedTasks: tasks.filter(task => (task.status || 'todo') === 'blocked').length,
    overdueTasks: tasks.filter(isTaskOverdue).length,
    openWorkOrders: workOrders.filter(wo => wo.status !== 'completed').length,
  };
}

function buildTeamSection() {
  if (!teamData.employees.length) return '- No team members have been added yet.';

  const workload = buildWorkloadMap();
  return teamData.employees
    .map(emp => {
      const affinities = emp.affinities
        .map(id => orgData.departments.find(dept => dept.id === id)?.name)
        .filter(Boolean);
      return [
        `### ${emp.name}`,
        '',
        `- Owned responsibilities: ${workload.get(emp.name) || 0}`,
        `- Department affinities: ${affinities.length ? affinities.join(', ') : 'None selected yet'}`,
      ].join('\n');
    })
    .join('\n\n');
}

function buildDepartmentSection(dept) {
  const total = dept.tasks.length;
  const unowned = dept.tasks.filter(task => task.owner === 'UNOWNED').length;
  const blocked = dept.tasks.filter(task => (task.status || 'todo') === 'blocked').length;
  const done = dept.tasks.filter(task => (task.status || 'todo') === 'done').length;
  const primaryOwner = getPrimaryOwner(dept.tasks);

  return [
    `### ${dept.name}`,
    '',
    `Purpose: Own the recurring work for ${dept.name.toLowerCase()} and keep responsibilities visible.`,
    '',
    `- Primary owner: ${primaryOwner}`,
    `- Responsibilities: ${total}`,
    `- Done: ${done}`,
    `- Blocked: ${blocked}`,
    `- Unowned: ${unowned}`,
    '',
    'Standard operating checklist:',
    dept.tasks.map(task => `- ${formatTaskLine(task)}`).join('\n'),
  ].join('\n');
}

function buildWorkOrderSection() {
  if (!workOrders.length) {
    return '- No work orders have been created yet. Add one sample work order to document intake, assignment, vendor, and closeout.';
  }

  return workOrders.map(wo => {
    const status = WO_STATUS_LABELS[wo.status] || wo.status || 'Submitted';
    const priority = PRIORITY_LABELS[wo.priority || 'medium'] || wo.priority || 'Medium';
    const assignee = wo.assignee === 'UNASSIGNED' ? 'Unassigned' : wo.assignee;
    const vendor = wo.vendor ? ` | Vendor: ${wo.vendor}` : '';
    const target = wo.dueDate ? ` | Target: ${wo.dueDate}` : '';
    const unit = wo.unit ? `, Unit ${wo.unit}` : '';
    return `- ${wo.property}${unit}: ${wo.title} | ${status} | ${priority} | Owner: ${assignee}${vendor}${target}`;
  }).join('\n');
}

function formatTaskLine(task) {
  const status = STATUS_LABELS[task.status || 'todo'] || task.status || 'To Do';
  const priority = PRIORITY_LABELS[task.priority || 'medium'] || task.priority || 'Medium';
  const due = task.dueDate ? ` | Due: ${task.dueDate}` : '';
  const blocker = task.blockedBy ? ` | Blocked by: ${task.blockedBy.name}` : '';
  return `${task.name} | Owner: ${task.owner} | ${status} | ${priority}${due}${blocker}`;
}

function getPrimaryOwner(tasks) {
  const counts = new Map();
  tasks.forEach(task => {
    if (task.owner === 'UNOWNED') return;
    counts.set(task.owner, (counts.get(task.owner) || 0) + 1);
  });
  if (!counts.size) return 'Unassigned';
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function getHandbookGaps() {
  const summary = getOperatingSummary();
  const gaps = [];
  if (!teamData.employees.length) gaps.push('Add team members so the handbook can name real owners.');
  if (summary.unownedTasks > 0) gaps.push(`Assign ${summary.unownedTasks} unowned responsibilities.`);
  if (summary.blockedTasks > 0) gaps.push(`Resolve or document ${summary.blockedTasks} blocked responsibilities.`);
  if (summary.overdueTasks > 0) gaps.push(`Review ${summary.overdueTasks} overdue responsibilities.`);
  if (!workOrders.length) gaps.push('Create one starter work order to document maintenance flow.');
  return gaps;
}
