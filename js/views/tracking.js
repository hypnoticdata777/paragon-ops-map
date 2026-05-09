// Tracking view: department cards, task editing, owner picker, filter bar,
// status/priority cycling, due dates, and task dependencies.
import {
  orgData, currentView, mapState,
  STATUS_LABELS, PRIORITY_LABELS, STATUS_CYCLE, PRIORITY_CYCLE,
  getEmployeeHex, getEmployeeNames,
} from '../state.js';
import { saveToStorage, logAudit } from '../storage.js';
import {
  escapeHtml, jsonAttr, isTaskOverdue, isValidISODate,
  formatDueChip, buildDeptCompletionText,
} from '../utils.js';
import { updateStats } from '../ui.js';
// Imported lazily via dynamic references; map.js does not import tracking.js.
import { renderFlowMap, renderMapControls } from './map.js';

// ── Tracking view renderer ────────────────────────────────────────────────────
export function renderTrackingView() {
  const container = document.getElementById('departments');
  container.innerHTML = '';

  orgData.departments.forEach(dept => {
    const deptDiv = document.createElement('div');
    deptDiv.className = 'department';
    deptDiv.style.borderTop = `4px solid ${dept.color}`;
    deptDiv.dataset.id = dept.id;

    const doneCount    = dept.tasks.filter(t => (t.status || 'todo') === 'done').length;
    const blockedCount = dept.tasks.filter(t => (t.status || 'todo') === 'blocked').length;
    const progressPct  = dept.tasks.length > 0
      ? Math.round((doneCount / dept.tasks.length) * 100) : 0;

    deptDiv.innerHTML = `
      <div class="department-header" style="background: ${dept.color}" onclick="toggleDepartment('${dept.id}')">
        <div class="dept-header-top">
          <span>
            ${dept.name}
            (<span class="dept-task-count">${dept.tasks.length}</span> tasks
            <span class="dept-completion">${buildDeptCompletionText(doneCount, blockedCount)}</span>)
          </span>
          <span>&#9660;</span>
        </div>
        <div class="dept-progress-track" title="${progressPct}% of tasks done">
          <div class="dept-progress-fill" style="width:${progressPct}%"></div>
        </div>
      </div>
      <div class="department-body">
        ${dept.tasks.map((task, taskIdx) => {
          const safeName  = task.name.replace(/"/g, '&quot;');
          const isUnowned = task.owner === 'UNOWNED';
          const status    = task.status   || 'todo';
          const priority  = task.priority || 'medium';
          const isDone    = status === 'done';
          return `
          <div class="task-item ${isUnowned ? 'unowned' : ''} ${isDone ? 'task-done' : ''} ${isTaskOverdue(task) ? 'task-overdue' : ''}"
               data-dept-id="${dept.id}"
               data-task-idx="${taskIdx}"
               data-owner="${task.owner}"
               data-name="${safeName.toLowerCase()}"
               data-status="${status}"
               data-priority="${priority}">
            <div class="task-left">
              <span class="priority-dot priority-${priority}"
                    onclick="cycleTaskPriority('${dept.id}', ${taskIdx})"
                    title="Priority: ${PRIORITY_LABELS[priority]} — click to change"></span>
              ${task.dueDate
                ? `<span class="due-date-chip${isTaskOverdue(task) ? ' due-date-overdue' : ''}"
                         title="Due: ${task.dueDate}"
                         onclick="openDueDatePicker('${dept.id}', ${taskIdx}, this)">${formatDueChip(task.dueDate)}</span>`
                : `<span class="due-date-empty"
                         onclick="openDueDatePicker('${dept.id}', ${taskIdx}, this)">+ date</span>`
              }
              ${task.blockedBy
                ? `<span class="dep-chip${isDependencyBlocking(task) ? ' dep-chip--blocking' : ' dep-chip--resolved'}"
                         title="Blocked by: ${escapeHtml(task.blockedBy.name)}"
                         onclick="openDependencyPicker('${dept.id}', ${taskIdx}, this)">&#128279; ${escapeHtml(task.blockedBy.name.slice(0, 16))}${task.blockedBy.name.length > 16 ? '…' : ''}</span>`
                : `<span class="dep-add-btn" title="Add dependency" onclick="openDependencyPicker('${dept.id}', ${taskIdx}, this)">&#128279;</span>`
              }
              <div class="task-name"
                   ondblclick="startTaskEdit('${dept.id}', ${taskIdx})"
                   title="Double-click to rename">${escapeHtml(task.name)}</div>
            </div>
            <div class="task-right">
              <span class="status-pill status-${status}"
                    onclick="cycleTaskStatus('${dept.id}', ${taskIdx})"
                    title="Status: ${STATUS_LABELS[status]} — click to change">
                ${STATUS_LABELS[status]}
              </span>
              <div class="task-owner${isUnowned ? ' owner-unowned' : ''}"
                   style="${!isUnowned ? `background:${getEmployeeHex(task.owner)}` : ''}"
                   onclick="showOwnerPicker('${dept.id}', ${taskIdx}, this)"
                   title="Click to reassign">
                ${task.owner}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    container.appendChild(deptDiv);
  });
}

export function toggleDepartment(deptId) {
  const dept = document.querySelector(`.department[data-id="${deptId}"]`);
  if (dept) dept.classList.toggle('expanded');
}

// ── Inline task name editing ───────────────────────────────────────────────────
export function startTaskEdit(deptId, taskIdx) {
  document.querySelectorAll('.task-name-input').forEach(inp => inp.blur());

  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (!taskEl) return;

  const nameEl = taskEl.querySelector('.task-name');
  const originalName = dept.tasks[taskIdx].name;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-name-input';
  input.value = originalName;

  let saved = false;

  input.addEventListener('blur', () => {
    if (!saved) {
      saved = true;
      _commitTaskName(deptId, taskIdx, input.value, originalName, nameEl, taskEl);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saved = true;
      input.blur();
    } else if (e.key === 'Escape') {
      saved = true;
      nameEl.textContent = originalName;
      nameEl.ondblclick = () => startTaskEdit(deptId, taskIdx);
    }
  });

  nameEl.textContent = '';
  nameEl.appendChild(input);
  input.focus();
  input.select();
}

function _commitTaskName(deptId, taskIdx, newValue, originalName, nameEl, taskEl) {
  const trimmed = (newValue || '').trim();
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  if (!trimmed) {
    nameEl.textContent = originalName;
  } else {
    if (trimmed !== originalName) {
      logAudit('name_changed', { dept: dept.name, task: originalName, from: originalName, to: trimmed });
    }
    dept.tasks[taskIdx].name = trimmed;
    taskEl.dataset.name = trimmed.toLowerCase();
    nameEl.textContent = trimmed;
  }
  nameEl.title = 'Double-click to rename';
  nameEl.ondblclick = () => startTaskEdit(deptId, taskIdx);

  saveToStorage();
  if (currentView === 'map') renderFlowMap();
}

// ── Owner picker ──────────────────────────────────────────────────────────────
let _ownerPickerCloseHandler = null;

export function showOwnerPicker(deptId, taskIdx, badgeEl) {
  closeOwnerPicker();

  const picker = document.createElement('div');
  picker.id = 'owner-picker';
  picker.className = 'owner-picker';

  const allOwners = [...getEmployeeNames(), 'UNOWNED'];
  allOwners.forEach(owner => {
    const btn = document.createElement('button');
    btn.className = 'owner-picker-btn' + (owner === 'UNOWNED' ? ' owner-unowned' : '');
    if (owner !== 'UNOWNED') btn.style.background = getEmployeeHex(owner);
    btn.textContent = owner;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setTaskOwner(deptId, taskIdx, owner);
      closeOwnerPicker();
    });
    picker.appendChild(btn);
  });

  document.body.appendChild(picker);

  const rect = badgeEl.getBoundingClientRect();
  picker.style.top  = (rect.bottom + 4) + 'px';
  picker.style.left = Math.min(rect.left, window.innerWidth - 160) + 'px';

  _ownerPickerCloseHandler = (e) => {
    if (!e.target.closest('#owner-picker')) closeOwnerPicker();
  };
  setTimeout(() => document.addEventListener('click', _ownerPickerCloseHandler), 0);
}

export function closeOwnerPicker() {
  const picker = document.getElementById('owner-picker');
  if (picker) picker.remove();
  if (_ownerPickerCloseHandler) {
    document.removeEventListener('click', _ownerPickerCloseHandler);
    _ownerPickerCloseHandler = null;
  }
}

export function setTaskOwner(deptId, taskIdx, newOwner) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  logAudit('owner_changed', { dept: dept.name, task: dept.tasks[taskIdx].name, from: dept.tasks[taskIdx].owner, to: newOwner });
  dept.tasks[taskIdx].owner = newOwner;

  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    const isUnowned = newOwner === 'UNOWNED';
    taskEl.dataset.owner = newOwner;
    taskEl.classList.toggle('unowned', isUnowned);

    const badge = taskEl.querySelector('.task-owner');
    badge.className = 'task-owner' + (newOwner === 'UNOWNED' ? ' owner-unowned' : '');
    badge.style.background = newOwner !== 'UNOWNED' ? getEmployeeHex(newOwner) : '';
    badge.textContent = newOwner;
    badge.title = 'Click to reassign';
  }

  updateStats();
  saveToStorage();
  if (currentView === 'map') {
    renderMapControls();
    renderFlowMap();
  }
}

// ── Search & filter ───────────────────────────────────────────────────────────
export function populateOwnerFilter() {
  const select = document.getElementById('owner-filter');
  while (select.options.length > 1) select.remove(1);
  const owners = [...new Set(
    orgData.departments.flatMap(d => d.tasks.map(t => t.owner))
  )].sort((a, b) => {
    if (a === 'UNOWNED') return 1;
    if (b === 'UNOWNED') return -1;
    return a.localeCompare(b);
  });

  owners.forEach(owner => {
    const opt = document.createElement('option');
    opt.value = owner;
    opt.textContent = owner === 'UNOWNED' ? '⚠️ UNOWNED' : owner;
    select.appendChild(opt);
  });
}

export function applyFilter() {
  const keyword          = document.getElementById('search-input').value.toLowerCase().trim();
  const selectedOwner    = document.getElementById('owner-filter').value;
  const selectedStatus   = document.getElementById('status-filter')?.value  || '';
  const selectedPriority = document.getElementById('priority-filter')?.value || '';
  const isFiltering = keyword !== '' || selectedOwner !== '' || selectedStatus !== '' || selectedPriority !== '';

  let visibleTaskTotal = 0;
  let visibleDeptCount = 0;

  document.querySelectorAll('.department').forEach(deptEl => {
    const taskItems = deptEl.querySelectorAll('.task-item');
    let deptVisibleCount = 0;

    taskItems.forEach(item => {
      const name     = item.dataset.name;
      const owner    = item.dataset.owner;
      const status   = item.dataset.status   || 'todo';
      const priority = item.dataset.priority || 'medium';

      const matchesKeyword  = !keyword       || name.includes(keyword);
      const matchesOwner    = !selectedOwner || owner === selectedOwner;
      let matchesStatus;
      if (selectedStatus === 'overdue') {
        const deptId  = item.dataset.deptId;
        const taskIdx = parseInt(item.dataset.taskIdx, 10);
        const deptObj = orgData.departments.find(d => d.id === deptId);
        const taskObj = deptObj ? deptObj.tasks[taskIdx] : null;
        matchesStatus = taskObj ? isTaskOverdue(taskObj) : false;
      } else {
        matchesStatus = !selectedStatus || status === selectedStatus;
      }
      const matchesPriority = !selectedPriority || priority === selectedPriority;

      if (matchesKeyword && matchesOwner && matchesStatus && matchesPriority) {
        item.style.display = '';
        deptVisibleCount++;
        visibleTaskTotal++;
      } else {
        item.style.display = 'none';
      }
    });

    if (deptVisibleCount === 0) {
      deptEl.style.display = 'none';
    } else {
      deptEl.style.display = '';
      deptEl.classList.add('expanded');
      const countSpan = deptEl.querySelector('.dept-task-count');
      if (countSpan) {
        countSpan.textContent = isFiltering
          ? `${deptVisibleCount}/${deptEl.querySelectorAll('.task-item').length}`
          : deptEl.querySelectorAll('.task-item').length;
      }
      visibleDeptCount++;
    }
  });

  const noResults = document.getElementById('no-results');
  noResults.style.display = visibleDeptCount === 0 ? 'block' : 'none';

  const countEl = document.getElementById('filter-count');
  if (isFiltering) {
    countEl.textContent = `${visibleTaskTotal} task${visibleTaskTotal !== 1 ? 's' : ''} found`;
    countEl.style.display = 'inline-flex';
  } else {
    countEl.style.display = 'none';
  }
}

export function clearFilter() {
  const searchInput    = document.getElementById('search-input');
  const ownerFilter    = document.getElementById('owner-filter');
  const statusFilter   = document.getElementById('status-filter');
  const priorityFilter = document.getElementById('priority-filter');
  if (searchInput)    searchInput.value    = '';
  if (ownerFilter)    ownerFilter.value    = '';
  if (statusFilter)   statusFilter.value   = '';
  if (priorityFilter) priorityFilter.value = '';

  document.querySelectorAll('.department').forEach(deptEl => {
    deptEl.style.display = '';
    deptEl.classList.remove('expanded');
    deptEl.querySelectorAll('.task-item').forEach(item => { item.style.display = ''; });
    const countSpan = deptEl.querySelector('.dept-task-count');
    if (countSpan) countSpan.textContent = deptEl.querySelectorAll('.task-item').length;
  });

  const noResults = document.getElementById('no-results');
  if (noResults) noResults.style.display = 'none';

  const countEl = document.getElementById('filter-count');
  if (countEl) countEl.style.display = 'none';
}

// ── Status & priority cycling ─────────────────────────────────────────────────
export function cycleTaskStatus(deptId, taskIdx) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  const task    = dept.tasks[taskIdx];
  const current = task.status || 'todo';
  task.status   = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
  logAudit('status_changed', { dept: dept.name, task: task.name, from: current, to: task.status });

  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    const newStatus = task.status;
    taskEl.dataset.status = newStatus;
    taskEl.classList.toggle('task-done', newStatus === 'done');
    taskEl.classList.toggle('task-overdue', isTaskOverdue(task));

    const pill = taskEl.querySelector('.status-pill');
    if (pill) {
      pill.className = `status-pill status-${newStatus}`;
      pill.textContent = STATUS_LABELS[newStatus];
      pill.title = `Status: ${STATUS_LABELS[newStatus]} — click to change`;
    }
  }

  updateDeptProgress(deptId);
  saveToStorage();
  updateStats();
}

export function cycleTaskPriority(deptId, taskIdx) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  const task    = dept.tasks[taskIdx];
  const current = task.priority || 'medium';
  task.priority = PRIORITY_CYCLE[(PRIORITY_CYCLE.indexOf(current) + 1) % PRIORITY_CYCLE.length];
  logAudit('priority_changed', { dept: dept.name, task: task.name, from: current, to: task.priority });

  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    taskEl.dataset.priority = task.priority;
    const dot = taskEl.querySelector('.priority-dot');
    if (dot) {
      PRIORITY_CYCLE.forEach(p => dot.classList.remove(`priority-${p}`));
      dot.classList.add(`priority-${task.priority}`);
      dot.title = `Priority: ${PRIORITY_LABELS[task.priority]} — click to change`;
    }
  }

  saveToStorage();
}

export function updateDeptProgress(deptId) {
  const dept   = orgData.departments.find(d => d.id === deptId);
  const deptEl = document.querySelector(`.department[data-id="${deptId}"]`);
  if (!dept || !deptEl) return;

  const total   = dept.tasks.length;
  const done    = dept.tasks.filter(t => (t.status || 'todo') === 'done').length;
  const blocked = dept.tasks.filter(t => (t.status || 'todo') === 'blocked').length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  const fill = deptEl.querySelector('.dept-progress-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.closest('.dept-progress-track').title = `${pct}% of tasks done`;
  }

  const completionEl = deptEl.querySelector('.dept-completion');
  if (completionEl) completionEl.innerHTML = buildDeptCompletionText(done, blocked);
}

// ── Due date picker ───────────────────────────────────────────────────────────
export function openDueDatePicker(deptId, taskIdx, anchorEl) {
  const existing = document.getElementById('_due-date-picker');
  if (existing) existing.remove();

  const input = document.createElement('input');
  input.type  = 'date';
  input.id    = '_due-date-picker';
  input.style.cssText = 'position:fixed;opacity:0;pointer-events:none;z-index:99999;width:1px;height:1px;';

  const dept = orgData.departments.find(d => d.id === deptId);
  if (dept && dept.tasks[taskIdx] && dept.tasks[taskIdx].dueDate) {
    input.value = dept.tasks[taskIdx].dueDate;
  }

  const rect = anchorEl.getBoundingClientRect();
  input.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
  input.style.left = (rect.left  + window.scrollX) + 'px';

  let changed = false;
  let blurTimer = null;

  input.addEventListener('change', () => {
    changed = true;
    clearTimeout(blurTimer);
    setTaskDueDate(deptId, taskIdx, input.value);
    input.remove();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      changed = true;
      clearTimeout(blurTimer);
      input.remove();
    }
  });

  input.addEventListener('blur', () => {
    blurTimer = setTimeout(() => { if (!changed) input.remove(); }, 150);
  });

  document.body.appendChild(input);
  try { input.showPicker(); } catch (_) { input.focus(); }
}

export function setTaskDueDate(deptId, taskIdx, dateStr) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;
  const task = dept.tasks[taskIdx];
  if (!task) return;

  task.dueDate = dateStr || null;

  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    taskEl.classList.toggle('task-overdue', isTaskOverdue(task));
    const taskLeft = taskEl.querySelector('.task-left');
    if (taskLeft) {
      const overdue  = isTaskOverdue(task);
      const priority = task.priority || 'medium';
      taskLeft.innerHTML = `
        <span class="priority-dot priority-${priority}"
              onclick="cycleTaskPriority('${deptId}', ${taskIdx})"
              title="Priority: ${PRIORITY_LABELS[priority]} — click to change"></span>
        ${task.dueDate
          ? `<span class="due-date-chip${overdue ? ' due-date-overdue' : ''}"
                   title="Due: ${task.dueDate}"
                   onclick="openDueDatePicker('${deptId}', ${taskIdx}, this)">${formatDueChip(task.dueDate)}</span>`
          : `<span class="due-date-empty"
                   onclick="openDueDatePicker('${deptId}', ${taskIdx}, this)">+ date</span>`
        }
        ${task.blockedBy
          ? `<span class="dep-chip${isDependencyBlocking(task) ? ' dep-chip--blocking' : ' dep-chip--resolved'}"
                   title="Blocked by: ${escapeHtml(task.blockedBy.name)}"
                   onclick="openDependencyPicker('${deptId}', ${taskIdx}, this)">&#128279; ${escapeHtml(task.blockedBy.name.slice(0, 16))}${task.blockedBy.name.length > 16 ? '…' : ''}</span>`
          : `<span class="dep-add-btn" title="Add dependency" onclick="openDependencyPicker('${deptId}', ${taskIdx}, this)">&#128279;</span>`
        }
        <div class="task-name"
             ondblclick="startTaskEdit('${deptId}', ${taskIdx})"
             title="Double-click to rename">${escapeHtml(task.name)}</div>
      `;
    }
  }

  saveToStorage();
  updateStats();
}

// ── Task dependencies ─────────────────────────────────────────────────────────
let _depPickerCloseHandler = null;

export function openDependencyPicker(deptId, taskIdx, anchorEl) {
  _closeDependencyPicker();

  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;
  const task = dept.tasks[taskIdx];
  if (!task) return;

  const picker = document.createElement('div');
  picker.id = 'dep-picker';
  picker.className = 'dep-picker';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'dep-picker-search';
  searchInput.placeholder = 'Search tasks…';
  picker.appendChild(searchInput);

  const list = document.createElement('div');
  list.className = 'dep-picker-list';
  picker.appendChild(list);

  if (task.blockedBy) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'dep-picker-clear';
    clearBtn.textContent = '✕ Clear dependency';
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTaskDependency(deptId, taskIdx, anchorEl);
      _closeDependencyPicker();
    });
    picker.appendChild(clearBtn);
  }

  function buildList(filter) {
    list.innerHTML = '';
    let anyVisible = false;
    orgData.departments.forEach(d => {
      const matchingTasks = d.tasks.filter((t, idx) => {
        if (d.id === deptId && idx === taskIdx) return false;
        const label = `${d.name}: ${t.name}`.toLowerCase();
        return !filter || label.includes(filter.toLowerCase());
      });
      if (!matchingTasks.length) return;
      anyVisible = true;

      const label = document.createElement('div');
      label.className = 'dep-dept-label';
      label.textContent = d.name;
      list.appendChild(label);

      matchingTasks.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'dep-picker-item' +
          (task.blockedBy && task.blockedBy.deptId === d.id && task.blockedBy.configName === t._configName
            ? ' dep-picker-item--active' : '');
        btn.textContent = t.name;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          setTaskDependency(deptId, taskIdx, d.id, t._configName, t.name, anchorEl);
          _closeDependencyPicker();
        });
        list.appendChild(btn);
      });
    });

    if (!anyVisible) {
      const empty = document.createElement('p');
      empty.className = 'dep-picker-empty';
      empty.textContent = 'No tasks found.';
      list.appendChild(empty);
    }
  }

  buildList('');
  searchInput.addEventListener('input', () => buildList(searchInput.value));

  document.body.appendChild(picker);

  const rect = anchorEl.getBoundingClientRect();
  picker.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
  picker.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 260) + 'px';

  searchInput.focus();

  _depPickerCloseHandler = (e) => {
    if (!e.target.closest('#dep-picker')) _closeDependencyPicker();
  };
  setTimeout(() => document.addEventListener('click', _depPickerCloseHandler), 0);
}

function _closeDependencyPicker() {
  const picker = document.getElementById('dep-picker');
  if (picker) picker.remove();
  if (_depPickerCloseHandler) {
    document.removeEventListener('click', _depPickerCloseHandler);
    _depPickerCloseHandler = null;
  }
}

export function setTaskDependency(deptId, taskIdx, depDeptId, depConfigName, depName, anchorEl) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;
  const task = dept.tasks[taskIdx];
  if (!task) return;

  task.blockedBy = { deptId: depDeptId, configName: depConfigName, name: depName };
  logAudit('dependency_set', { dept: dept.name, task: task.name, from: null, to: depName });
  _updateDepChip(deptId, taskIdx, task, anchorEl);
  saveToStorage();
}

export function clearTaskDependency(deptId, taskIdx, anchorEl) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;
  const task = dept.tasks[taskIdx];
  if (!task) return;

  const oldDep = task.blockedBy ? task.blockedBy.name : null;
  task.blockedBy = null;
  logAudit('dependency_cleared', { dept: dept.name, task: task.name, from: oldDep, to: null });
  _updateDepChip(deptId, taskIdx, task, anchorEl);
  saveToStorage();
}

function _updateDepChip(deptId, taskIdx, task, anchorEl) {
  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (!taskEl) return;
  const oldChip = taskEl.querySelector('.dep-chip, .dep-add-btn');
  if (!oldChip) return;

  const newChip = document.createElement('span');
  if (task.blockedBy) {
    newChip.className = 'dep-chip' + (isDependencyBlocking(task) ? ' dep-chip--blocking' : ' dep-chip--resolved');
    newChip.title     = `Blocked by: ${task.blockedBy.name}`;
    const short = task.blockedBy.name.slice(0, 16) + (task.blockedBy.name.length > 16 ? '…' : '');
    newChip.innerHTML = `&#128279; ${escapeHtml(short)}`;
    newChip.addEventListener('click', function() {
      openDependencyPicker(deptId, taskIdx, this);
    });
  } else {
    newChip.className = 'dep-add-btn';
    newChip.title     = 'Add dependency';
    newChip.innerHTML = '&#128279;';
    newChip.addEventListener('click', function() {
      openDependencyPicker(deptId, taskIdx, this);
    });
  }
  oldChip.replaceWith(newChip);
}

export function isDependencyBlocking(task) {
  if (!task.blockedBy) return false;
  const dep = task.blockedBy;
  const depDept = orgData.departments.find(d => d.id === dep.deptId);
  if (!depDept) return false;
  const depTask = depDept.tasks.find(t => t._configName === dep.configName);
  if (!depTask) return false;
  return (depTask.status || 'todo') !== 'done';
}
