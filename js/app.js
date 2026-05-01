// ====================
// VIEW MANAGEMENT
// ====================

// Like a TV remote's input button — remembers which channel you're on right now.
let currentView = 'tracking';

// The bouncer at the club: only ONE room can be "active" at a time.
// When you call this, every other room gets kicked out of the VIP list
// and the one you asked for gets the wristband.
function switchView(view, tabEl) {
  // Update our mental note of "where are we right now?"
  currentView = view;

  // Walk up to every view panel and rip off its "active" sticker —
  // like flipping all the light switches off before turning the right one on.
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  // Now flip ON just the panel the user asked for.
  document.getElementById(`${view}-view`).classList.add('active');

  // Same drill for the nav tabs — un-highlight them all first...
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  // ...then highlight the tab the user actually clicked.
  tabEl.classList.add('active');

  // The filter bar is like a toolbar that only makes sense in the tracking room.
  // If we're going back to tracking, roll out the welcome mat (display: flex).
  // If we're going anywhere else, fold it up and clear any leftover search dust.
  const filterBar = document.getElementById('filter-bar');
  if (view === 'tracking') {
    filterBar.style.display = 'flex';
  } else {
    filterBar.style.display = 'none';
    clearFilter(); // Wipe the whiteboard clean so old searches don't haunt us.
  }

  // If someone left the owner-picker dropdown open, slam it shut —
  // like closing a menu before switching apps.
  closeOwnerPicker();

  // Each view has its own "setup crew". Kick off the right one.
  // Map view needs its controls and the flow diagram drawn from scratch.
  // Models view needs the strategic cards and case studies rendered.
  // Team view renders the employee roster, affinity editor, and workload chart.
  if (view === 'map') {
    renderMapControls();
    renderFlowMap();
  } else if (view === 'team') {
    renderTeamView();
  }
}

// ====================
// TRACKING VIEW
// ====================

// This is the painter: it wipes the canvas blank and redraws every department
// card from the data, like refreshing a bulletin board by tearing everything
// down and re-pinning it in order.
function renderTrackingView() {
  // Grab the container div — the empty corkboard we're about to fill.
  const container = document.getElementById('departments');
  // Nuke whatever HTML was there before. Clean slate.
  container.innerHTML = '';

  // Loop through every department in our data — like going shelf by shelf
  // in a filing room.
  orgData.departments.forEach(dept => {
    // Build a fresh card (div) for this department.
    const deptDiv = document.createElement('div');
    deptDiv.className = 'department';
    // Slap a colored stripe on top — the department's unique "team jersey" color.
    deptDiv.style.borderTop = `4px solid ${dept.color}`;
    // Tag the card with the dept's ID so we can find it again later by name.
    deptDiv.dataset.id = dept.id;

    // Pre-compute dept-level progress so the header can show it immediately.
    const doneCount    = dept.tasks.filter(t => (t.status || 'todo') === 'done').length;
    const blockedCount = dept.tasks.filter(t => (t.status || 'todo') === 'blocked').length;
    const progressPct  = dept.tasks.length > 0
      ? Math.round((doneCount / dept.tasks.length) * 100) : 0;

    // Stamp the card's interior HTML all at once — header + every task row.
    deptDiv.innerHTML = `
      <div class="department-header" style="background: ${dept.color}" onclick="toggleDepartment('${dept.id}')">
        <!-- Text row: dept name + task count + done/blocked badges + chevron -->
        <div class="dept-header-top">
          <span>
            ${dept.name}
            (<span class="dept-task-count">${dept.tasks.length}</span> tasks
            <span class="dept-completion">${buildDeptCompletionText(doneCount, blockedCount)}</span>)
          </span>
          <span>&#9660;</span>
        </div>
        <!-- Thin white progress bar at the bottom of the header.
             Width = percentage of tasks marked Done. Animates on status change. -->
        <div class="dept-progress-track" title="${progressPct}% of tasks done">
          <div class="dept-progress-fill" style="width:${progressPct}%"></div>
        </div>
      </div>
      <div class="department-body">
        ${dept.tasks.map((task, taskIdx) => {
          // Escape quotes so they don't break data-name HTML attribute.
          const safeName  = task.name.replace(/"/g, '&quot;');
          const isUnowned = task.owner === 'UNOWNED';
          // Default to 'todo' / 'medium' for tasks that pre-date this feature.
          const status    = task.status   || 'todo';
          const priority  = task.priority || 'medium';
          const isDone    = status === 'done';
          return `
          <div class="task-item ${isUnowned ? 'unowned' : ''} ${isDone ? 'task-done' : ''}"
               data-dept-id="${dept.id}"
               data-task-idx="${taskIdx}"
               data-owner="${task.owner}"
               data-name="${safeName.toLowerCase()}"
               data-status="${status}"
               data-priority="${priority}">
            <!-- Left half: priority dot (click to cycle) + editable task name -->
            <div class="task-left">
              <span class="priority-dot priority-${priority}"
                    onclick="cycleTaskPriority('${dept.id}', ${taskIdx})"
                    title="Priority: ${PRIORITY_LABELS[priority]} — click to change"></span>
              <div class="task-name"
                   ondblclick="startTaskEdit('${dept.id}', ${taskIdx})"
                   title="Double-click to rename">${task.name}</div>
            </div>
            <!-- Right half: status pill (click to cycle) + owner badge -->
            <div class="task-right">
              <span class="status-pill status-${status}"
                    onclick="cycleTaskStatus('${dept.id}', ${taskIdx})"
                    title="Status: ${STATUS_LABELS[status]} — click to change">
                ${STATUS_LABELS[status]}
              </span>
              <!-- Inline background so dynamically-added employees get their color.
                   UNOWNED keeps its CSS class for the pulsing animation. -->
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

    // Stick the finished card onto the corkboard.
    container.appendChild(deptDiv);
  });
}

// Accordion toggle — like pulling on a window blind.
// If it's up, it comes down; if it's down, it rolls back up.
function toggleDepartment(deptId) {
  const dept = document.querySelector(`.department[data-id="${deptId}"]`);
  if (dept) dept.classList.toggle('expanded');
}

// ====================
// INLINE TASK NAME EDITING
// ====================

// Turns a task label into a live text field when you double-click it —
// like scratching out a sticky note and writing a new one in its place.
function startTaskEdit(deptId, taskIdx) {
  // If another task is already being edited, force it to save first.
  // You can't have two sticky notes half-scratched at the same time.
  document.querySelectorAll('.task-name-input').forEach(inp => inp.blur());

  // Look up the department in our data model.
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return; // Department doesn't exist — bail out, nothing to edit.

  // Find the actual DOM element for this specific task row.
  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (!taskEl) return; // Can't find the row on screen — bail.

  // Grab the name label element and save a backup of its current text —
  // like photographing the original sticky note before erasing it.
  const nameEl = taskEl.querySelector('.task-name');
  const originalName = dept.tasks[taskIdx].name;

  // Create a real <input> box to replace the label.
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-name-input';
  input.value = originalName; // Pre-fill it with the existing text.

  // Guard flag so we don't accidentally save twice
  // (blur fires right after Enter, which would double-commit).
  let saved = false;

  // When the input loses focus (user clicks away), auto-save —
  // like a word processor that saves when you click somewhere else.
  input.addEventListener('blur', () => {
    if (!saved) {
      saved = true;
      _commitTaskName(deptId, taskIdx, input.value, originalName, nameEl, taskEl);
    }
  });

  // Keyboard shortcuts: Enter = save, Escape = cancel like nothing happened.
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saved = true;
      input.blur(); // Triggers the blur handler above to do the actual save.
    } else if (e.key === 'Escape') {
      saved = true;
      // Restore the original text — like hitting Ctrl+Z before closing.
      nameEl.textContent = originalName;
      nameEl.ondblclick = () => startTaskEdit(deptId, taskIdx);
    }
  });

  // Swap the label text out and drop the input box in its place.
  nameEl.textContent = '';
  nameEl.appendChild(input);
  input.focus();    // Auto-focus so the user can start typing immediately.
  input.select();  // Pre-select all text so one keystroke replaces it entirely.
}

// The notary: officially records the new task name into both the data model
// and the visible DOM, then syncs everything downstream.
function _commitTaskName(deptId, taskIdx, newValue, originalName, nameEl, taskEl) {
  // Strip leading/trailing whitespace — nobody wants "  Fix bug   " as a task name.
  const trimmed = (newValue || '').trim();
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  if (!trimmed) {
    // If they deleted everything and submitted blank, restore the original.
    // Like refusing to notarize a blank contract.
    nameEl.textContent = originalName;
  } else {
    // Commit the new name to the data model (the source of truth).
    dept.tasks[taskIdx].name = trimmed;
    // Also update the hidden data attribute used for search/filtering.
    taskEl.dataset.name = trimmed.toLowerCase();
    // Update what the user sees on screen.
    nameEl.textContent = trimmed;
  }
  // Restore the double-click-to-edit hint tooltip.
  nameEl.title = 'Double-click to rename';
  nameEl.ondblclick = () => startTaskEdit(deptId, taskIdx);

  // Persist to localStorage so changes survive a page refresh.
  saveToStorage();
  // If the map view is open, redraw it so it reflects the new name.
  if (currentView === 'map') renderFlowMap();
}

// ====================
// OWNER PICKER
// ====================

// Holds a reference to the "click anywhere to close" listener so we can remove it later.
// Like keeping the receipt so you can return the item.
let _ownerPickerCloseHandler = null;

// Pops up a little dropdown menu of owner names when you click an owner badge —
// like a context menu appearing right under your cursor.
function showOwnerPicker(deptId, taskIdx, badgeEl) {
  // Close any already-open picker before opening a new one —
  // only one dropdown allowed at a time, like a one-at-a-time turnstile.
  closeOwnerPicker();

  // Build the dropdown container div.
  const picker = document.createElement('div');
  picker.id = 'owner-picker';
  picker.className = 'owner-picker';

  // Build the picker list from the live team roster so newly-added employees
  // appear immediately. UNOWNED is appended last as a "clear assignment" option.
  const allOwners = [...getEmployeeNames(), 'UNOWNED'];
  allOwners.forEach(owner => {
    const btn = document.createElement('button');
    // UNOWNED keeps its CSS class for the pulsing animation; everyone else gets
    // an inline background so their chosen hex color shows correctly.
    btn.className = 'owner-picker-btn' + (owner === 'UNOWNED' ? ' owner-unowned' : '');
    if (owner !== 'UNOWNED') btn.style.background = getEmployeeHex(owner);
    btn.textContent = owner;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't let this click bubble up and accidentally close the picker.
      setTaskOwner(deptId, taskIdx, owner); // Reassign the task.
      closeOwnerPicker();                   // Close the menu after selecting.
    });
    picker.appendChild(btn);
  });

  // Attach the dropdown to the page body (not inside the task card)
  // so it floats freely on top of everything else.
  document.body.appendChild(picker);

  // Figure out exactly where on screen the badge is and position the dropdown
  // just below it — like a tooltip that knows where to hover.
  const rect = badgeEl.getBoundingClientRect();
  picker.style.top  = (rect.bottom + 4) + 'px';
  // Clamp to the left so it doesn't fly off the right edge of the screen.
  picker.style.left = Math.min(rect.left, window.innerWidth - 160) + 'px';

  // Register a "click outside = close" handler on the entire document.
  _ownerPickerCloseHandler = (e) => {
    if (!e.target.closest('#owner-picker')) closeOwnerPicker();
  };
  // The setTimeout defers attaching the listener by one event loop tick —
  // without it, the very click that opened the picker would immediately close it.
  setTimeout(() => document.addEventListener('click', _ownerPickerCloseHandler), 0);
}

// Removes the dropdown from the DOM and cleans up the global click listener —
// like folding up a pop-up tent and storing it back in the bag.
function closeOwnerPicker() {
  const picker = document.getElementById('owner-picker');
  if (picker) picker.remove(); // Tear it out of the page entirely.
  if (_ownerPickerCloseHandler) {
    // Stop listening for outside clicks — we don't need the watchdog anymore.
    document.removeEventListener('click', _ownerPickerCloseHandler);
    _ownerPickerCloseHandler = null; // Clear the receipt; item returned.
  }
}

// Reassigns a task to a new owner, then updates the data, the DOM badge,
// the stats panel, and storage — the whole chain of custody.
function setTaskOwner(deptId, taskIdx, newOwner) {
  // Find the department in data — the filing cabinet drawer.
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  // Update the data model first — this is the source of truth.
  dept.tasks[taskIdx].owner = newOwner;

  // Now find the matching DOM row to update what the user sees.
  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    const isUnowned = newOwner === 'UNOWNED';
    // Update the hidden data attribute (used by filtering) to the new owner.
    taskEl.dataset.owner = newOwner;
    // Toggle the "unowned" warning highlight on or off.
    taskEl.classList.toggle('unowned', isUnowned);

    const badge = taskEl.querySelector('.task-owner');
    // Strip ALL existing color classes, then apply the new color via inline style
    // so dynamically-added employees get their chosen hex color automatically.
    // UNOWNED keeps its CSS class for the pulse animation.
    badge.className = 'task-owner' + (newOwner === 'UNOWNED' ? ' owner-unowned' : '');
    badge.style.background = newOwner !== 'UNOWNED' ? getEmployeeHex(newOwner) : '';
    badge.textContent = newOwner;
    badge.title = 'Click to reassign';
  }

  updateStats();   // Recalculate the summary numbers shown in the header.
  saveToStorage(); // Persist so the change survives a refresh.
  // If the map view is visible, redraw its controls and diagram to reflect the change.
  if (currentView === 'map') {
    renderMapControls();
    renderFlowMap();
  }
}

// ====================
// SEARCH & FILTER
// ====================

// Scans all tasks to collect every unique owner name, then populates the
// filter dropdown — like reading every name tag in the room and making a guest list.
function populateOwnerFilter() {
  const select = document.getElementById('owner-filter');
  // Clear existing options except the first "All Owners" placeholder
  while (select.options.length > 1) select.remove(1);
  // Flatten all tasks from all departments into one big list of owner names,
  // deduplicate with Set (no duplicate guests on the list),
  // then sort alphabetically — but always push UNOWNED to the very bottom
  // like seating the awkward relative at the far end of the table.
  const owners = [...new Set(
    orgData.departments.flatMap(d => d.tasks.map(t => t.owner))
  )].sort((a, b) => {
    if (a === 'UNOWNED') return 1;  // UNOWNED sinks to the bottom.
    if (b === 'UNOWNED') return -1; // Everything else floats above it.
    return a.localeCompare(b);      // Alphabetical for everyone else.
  });

  // For each owner, create an <option> element and drop it into the <select>.
  owners.forEach(owner => {
    const opt = document.createElement('option');
    opt.value = owner;
    // Give UNOWNED a warning emoji label so it stands out like a caution sign.
    opt.textContent = owner === 'UNOWNED' ? '⚠️ UNOWNED' : owner;
    select.appendChild(opt);
  });
}

// The search engine: reads keyword, owner, status, and priority filters, then
// shows/hides task rows and entire department cards like a bouncer with a checklist.
function applyFilter() {
  const keyword         = document.getElementById('search-input').value.toLowerCase().trim();
  const selectedOwner   = document.getElementById('owner-filter').value;
  const selectedStatus  = document.getElementById('status-filter')?.value  || '';
  const selectedPriority= document.getElementById('priority-filter')?.value || '';
  const isFiltering = keyword !== '' || selectedOwner !== '' || selectedStatus !== '' || selectedPriority !== '';

  // Running tallies so we can detect "no results" at the end.
  let visibleTaskTotal = 0;
  let visibleDeptCount = 0;

  // Walk through every department card on screen.
  document.querySelectorAll('.department').forEach(deptEl => {
    const taskItems = deptEl.querySelectorAll('.task-item');
    let deptVisibleCount = 0; // How many tasks in this dept survived the filter?

    // Check each task row against all four active filters.
    taskItems.forEach(item => {
      const name     = item.dataset.name;
      const owner    = item.dataset.owner;
      const status   = item.dataset.status   || 'todo';
      const priority = item.dataset.priority || 'medium';

      const matchesKeyword  = !keyword          || name.includes(keyword);
      const matchesOwner    = !selectedOwner    || owner    === selectedOwner;
      const matchesStatus   = !selectedStatus   || status   === selectedStatus;
      const matchesPriority = !selectedPriority || priority === selectedPriority;

      if (matchesKeyword && matchesOwner && matchesStatus && matchesPriority) {
        item.style.display = ''; // Show it — it's on the list.
        deptVisibleCount++;
        visibleTaskTotal++;
      } else {
        item.style.display = 'none'; // Hide it — bounced.
      }
    });

    // If every task in a department was hidden, hide the whole department card too —
    // like removing an empty shelf from the display.
    if (deptVisibleCount === 0) {
      deptEl.style.display = 'none';
    } else {
      deptEl.style.display = '';
      // Auto-expand the department so filtered results are visible right away.
      deptEl.classList.add('expanded');
      // Update the task count badge to show "visible / total" while filtering,
      // or just "total" when no filter is active.
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

function clearFilter() {
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
    deptEl.querySelectorAll('.task-item').forEach(item => { item.style.display = ''; });
    const countSpan = deptEl.querySelector('.dept-task-count');
    if (countSpan) countSpan.textContent = deptEl.querySelectorAll('.task-item').length;
  });

  const noResults = document.getElementById('no-results');
  if (noResults) noResults.style.display = 'none';

  const countEl = document.getElementById('filter-count');
  if (countEl) countEl.style.display = 'none';
}

// ====================
// MAP STATE
// ====================

const mapState = {
  hiddenOwners: new Set(),  // owners whose connections are hidden
  focusedOwner: null,       // owner whose connections are highlighted (others dimmed)
  focusedDept:  null,       // department that is currently selected in the side panel
};

// ====================
// MAP CONTROLS (owner filter pills)
// ====================

function renderMapControls() {
  const container = document.getElementById('map-controls');
  if (!container) return;
  container.innerHTML = '';

  const uniqueOwners = [...new Set(
    orgData.departments.flatMap(d => d.tasks.map(t => t.owner))
  )];

  const label = document.createElement('span');
  label.className = 'map-control-label';
  label.textContent = 'Toggle:';
  container.appendChild(label);

  uniqueOwners.forEach(owner => {
    const isHidden   = mapState.hiddenOwners.has(owner);
    const isFocused  = mapState.focusedOwner === owner;
    const btn = document.createElement('button');
    btn.className = 'map-filter-pill' +
      (isHidden  ? ' map-filter-pill--hidden'  : '') +
      (isFocused ? ' map-filter-pill--focused' : '');
    // getEmployeeHex covers both hardcoded and dynamically-added employees
    btn.style.setProperty('--pill-color', getEmployeeHex(owner));
    btn.textContent = owner === 'UNOWNED' ? '⚠ UNOWNED' : owner;
    btn.title = isHidden
      ? `Show ${owner}'s connections`
      : isFocused
        ? `Un-focus ${owner}`
        : `Click to focus ${owner} · Shift+click to hide`;

    btn.addEventListener('click', (e) => {
      if (e.shiftKey) {
        // Shift-click: toggle hide
        if (mapState.hiddenOwners.has(owner)) {
          mapState.hiddenOwners.delete(owner);
        } else {
          mapState.hiddenOwners.add(owner);
          if (mapState.focusedOwner === owner) mapState.focusedOwner = null;
        }
      } else {
        // Regular click: toggle focus
        mapState.focusedOwner = (mapState.focusedOwner === owner) ? null : owner;
        // Un-hide if focusing
        if (mapState.focusedOwner === owner) mapState.hiddenOwners.delete(owner);
      }
      renderMapControls();
      renderFlowMap();
    });

    container.appendChild(btn);
  });

  // Show All / Reset button when anything is active
  if (mapState.hiddenOwners.size > 0 || mapState.focusedOwner !== null) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary map-reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      mapState.hiddenOwners.clear();
      mapState.focusedOwner = null;
      renderMapControls();
      renderFlowMap();
    });
    container.appendChild(resetBtn);
  }

  // Instruction hint
  const hint = document.createElement('span');
  hint.style.cssText = 'font-size:11px;color:#90a4ae;margin-left:auto;white-space:nowrap;';
  hint.textContent = 'Click to focus · Shift+click to hide/show · Click dept box for task list';
  container.appendChild(hint);
}

// ====================
// MAP DEPT PANEL
// ====================

function showDeptPanel(dept) {
  mapState.focusedDept = dept.id;

  const panel = document.getElementById('map-dept-panel');
  if (!panel) return;

  // Group tasks by owner
  const byOwner = {};
  dept.tasks.forEach(t => {
    if (!byOwner[t.owner]) byOwner[t.owner] = [];
    byOwner[t.owner].push(t.name);
  });

  const unownedCount = dept.tasks.filter(t => t.owner === 'UNOWNED').length;

  panel.innerHTML = `
    <div class="map-panel-header" style="border-left: 5px solid ${dept.color}">
      <strong>${dept.name}</strong>
      <span class="task-count-badge">${dept.tasks.length} tasks${unownedCount > 0 ? ` · ${unownedCount} ⚠` : ''}</span>
      <button class="map-panel-close" onclick="closeDeptPanel()" title="Close">&#x2715;</button>
    </div>
    <div class="map-panel-body">
      ${Object.entries(byOwner).map(([owner, tasks]) => `
        <div class="map-panel-owner-group">
          <div class="map-panel-owner-badge${owner === 'UNOWNED' ? ' owner-unowned' : ''}"
               style="${owner !== 'UNOWNED' ? `background:${getEmployeeHex(owner)}` : ''}">${owner}</div>
          <ul>
            ${tasks.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  panel.classList.add('active');
}

function closeDeptPanel() {
  mapState.focusedDept = null;
  const panel = document.getElementById('map-dept-panel');
  if (panel) {
    panel.classList.remove('active');
    panel.innerHTML = `
      <div class="map-panel-placeholder">
        <span>&#x1F4CB;</span>
        <p>Click a department box on the map to see its task list here.</p>
      </div>`;
  }
}

// ====================
// MAP TOOLTIP
// ====================

function showMapTooltip(html, mouseX, mouseY) {
  let tip = document.getElementById('map-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'map-tooltip';
    tip.className = 'map-tooltip';
    document.body.appendChild(tip);
  }
  tip.innerHTML = html;
  tip.style.display = 'block';

  // Position so it doesn't overflow the viewport
  const tw = tip.offsetWidth || 200;
  const th = tip.offsetHeight || 60;
  const x = mouseX + 14;
  const y = mouseY - 10;
  tip.style.left = (x + tw > window.innerWidth  ? mouseX - tw - 10 : x) + 'px';
  tip.style.top  = (y + th > window.innerHeight ? mouseY - th - 10 : y) + 'px';
}

function hideMapTooltip() {
  const tip = document.getElementById('map-tooltip');
  if (tip) tip.style.display = 'none';
}

// ====================
// MAP VIEW - Flow map with interactivity
// ====================

function renderFlowMap() {
  const svg = document.getElementById('flowMap');
  svg.innerHTML = '';

  // ── Layout constants ──────────────────────────────────────────────
  const PADDING_TOP    = 60;
  const PADDING_BOTTOM = 50;
  const DEPT_SPACING   = 72;
  const DEPT_W         = 260;
  const DEPT_H         = 58;
  const DEPT_X         = 230;
  const OWNER_R        = 44;
  const OWNER_X        = 1250;
  const COMPANY_W      = 155;
  const COMPANY_H      = 110;
  const COMPANY_X      = 28;

  const depts        = orgData.departments;
  const deptCount    = depts.length;
  const uniqueOwners = [...new Set(depts.flatMap(d => d.tasks.map(t => t.owner)))];
  const ownerCount   = uniqueOwners.length;

  // Canvas dimensions
  const deptsTotalH = (deptCount - 1) * DEPT_SPACING + DEPT_H;
  const canvasH = PADDING_TOP + deptsTotalH + PADDING_BOTTOM;
  const canvasW = OWNER_X + OWNER_R + 40;

  svg.setAttribute('width', canvasW);
  svg.setAttribute('height', canvasH);
  svg.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);

  // ── Y positions ───────────────────────────────────────────────────
  const deptCY = (i) => PADDING_TOP + i * DEPT_SPACING + DEPT_H / 2;
  const topCY    = deptCY(0);
  const bottomCY = deptCY(deptCount - 1);
  const ownerCY  = (i) => {
    if (ownerCount === 1) return (topCY + bottomCY) / 2;
    return topCY + (i / (ownerCount - 1)) * (bottomCY - topCY);
  };

  const ownerPos = {};
  uniqueOwners.forEach((owner, i) => {
    ownerPos[owner] = { x: OWNER_X, y: ownerCY(i) };
  });

  const companyCY = (topCY + bottomCY) / 2;

  // Determine visual state per owner/dept
  const hasFocused = mapState.focusedOwner !== null;

  function connectionOpacity(owner) {
    if (mapState.hiddenOwners.has(owner)) return 0;
    if (hasFocused) return mapState.focusedOwner === owner ? 0.9 : 0.08;
    return 0.65;
  }

  function ownerGroupOpacity(owner) {
    if (mapState.hiddenOwners.has(owner)) return 0.25;
    if (hasFocused) return mapState.focusedOwner === owner ? 1 : 0.3;
    return 1;
  }

  function deptGroupOpacity(dept) {
    if (!hasFocused) return 1;
    // Is the focused owner involved in this dept?
    const ownerPresent = dept.tasks.some(t => t.owner === mapState.focusedOwner);
    return ownerPresent ? 1 : 0.3;
  }

  // ── Layer 1: Company → Dept connector lines ───────────────────────
  const compLineLayer = svgGroup(svg);
  depts.forEach((dept, i) => {
    svgLine(compLineLayer,
      COMPANY_X + COMPANY_W, companyCY,
      DEPT_X, deptCY(i),
      '#cfd8dc', 1.5);
  });

  // ── Layer 2: Dept → Owner bezier curves ──────────────────────────
  const curveLayer = svgGroup(svg);

  depts.forEach((dept, i) => {
    const cy = deptCY(i);
    const x1 = DEPT_X + DEPT_W;

    const ownerCounts = {};
    dept.tasks.forEach(t => {
      ownerCounts[t.owner] = (ownerCounts[t.owner] || 0) + 1;
    });

    Object.entries(ownerCounts).forEach(([owner, count]) => {
      const op = ownerPos[owner];
      if (!op) return;

      const opacity = connectionOpacity(owner);
      if (opacity === 0) return;

      const x2   = op.x - OWNER_R;
      const y2   = op.y;
      const midX = x1 + (x2 - x1) * 0.55;
      const color   = ownerColors[owner]?.hex || '#d32f2f';
      const strokeW = Math.max(2, Math.min(count * 1.0, 8));
      const dash    = owner === 'UNOWNED' ? '6,4' : null;

      const path = svgPath(
        curveLayer,
        `M${x1},${cy} C${midX},${cy} ${midX},${y2} ${x2},${y2}`,
        color, strokeW, dash, opacity
      );

      // Thicker invisible hit area for easier hovering
      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', `M${x1},${cy} C${midX},${cy} ${midX},${y2} ${x2},${y2}`);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '14');
      hitPath.style.cursor = 'pointer';
      curveLayer.appendChild(hitPath);

      const tooltipHtml = `<strong>${dept.name} → ${owner}</strong>${count} task${count !== 1 ? 's' : ''}`;
      hitPath.addEventListener('mouseenter', (e) => showMapTooltip(tooltipHtml, e.clientX, e.clientY));
      hitPath.addEventListener('mousemove',  (e) => showMapTooltip(tooltipHtml, e.clientX, e.clientY));
      hitPath.addEventListener('mouseleave', hideMapTooltip);
    });
  });

  // ── Layer 3: Company box ──────────────────────────────────────────
  const boxLayer = svgGroup(svg);
  const compY = companyCY - COMPANY_H / 2;
  svgRect(boxLayer, COMPANY_X, compY, COMPANY_W, COMPANY_H, '#37474f', 10);
  drawCompanyLabel(boxLayer, COMPANY_X + COMPANY_W / 2, companyCY);

  // ── Layer 4: Department boxes (interactive) ───────────────────────
  depts.forEach((dept, i) => {
    const cy = deptCY(i);
    const bx = DEPT_X;
    const by = cy - DEPT_H / 2;

    const unownedCount = dept.tasks.filter(t => t.owner === 'UNOWNED').length;
    const isFocused    = mapState.focusedDept === dept.id;
    const boxBg        = isFocused ? '#e3f2fd' : (unownedCount > 0 ? '#fff5f5' : '#ffffff');
    const opacity      = deptGroupOpacity(dept);

    const g = svgGroup(boxLayer);
    g.setAttribute('opacity', opacity);
    g.style.cursor = 'pointer';

    // Shadow rect for focused state
    if (isFocused) {
      svgRect(g, bx - 2, by - 2, DEPT_W + 4, DEPT_H + 4, 'none', 9, '#1976d2', 2.5);
    }

    svgRect(g, bx, by, DEPT_W, DEPT_H, boxBg, 7, dept.color, 3);

    const MAX = 32;
    const label = dept.name.length > MAX ? dept.name.slice(0, MAX - 1) + '\u2026' : dept.name;
    svgText(g, bx + 14, cy - 9,  label, '#263238', 12, 700, 'start');

    const statsLabel = `${dept.tasks.length} tasks` +
      (unownedCount > 0 ? `  \u00B7  ${unownedCount} \u26A0 unowned` : '');
    const statsColor = unownedCount > 0 ? '#d32f2f' : '#78909c';
    svgText(g, bx + 14, cy + 10, statsLabel, statsColor, 11, 400, 'start');

    // Tooltip
    const ownerList = [...new Set(dept.tasks.map(t => t.owner))].join(', ');
    const tipHtml = `<strong>${dept.name}</strong>${dept.tasks.length} tasks · Owners: ${ownerList}`;

    g.addEventListener('mouseenter', (e) => {
      showMapTooltip(tipHtml, e.clientX, e.clientY);
      // Glow on hover (only if not already focused)
      if (!isFocused) g.style.filter = 'drop-shadow(0 0 6px rgba(25,118,210,0.5))';
    });
    g.addEventListener('mousemove',  (e) => showMapTooltip(tipHtml, e.clientX, e.clientY));
    g.addEventListener('mouseleave', () => {
      hideMapTooltip();
      g.style.filter = '';
    });
    g.addEventListener('click', () => {
      if (mapState.focusedDept === dept.id) {
        closeDeptPanel();
        renderFlowMap();
      } else {
        showDeptPanel(dept);
        renderFlowMap();
      }
    });
  });

  // ── Layer 5: Owner circles (interactive) ─────────────────────────
  uniqueOwners.forEach((owner) => {
    const { x, y } = ownerPos[owner];
    const color   = ownerColors[owner]?.hex || '#d32f2f';
    const opacity = ownerGroupOpacity(owner);

    const g = svgGroup(boxLayer);
    g.setAttribute('opacity', opacity);
    g.style.cursor = 'pointer';

    svgCircle(g, x, y, OWNER_R, color, '#263238', 2);

    if (owner === 'UNOWNED') {
      svgText(g, x, y - 7,  '\u26A0',  '#fff', 14, 700);
      svgText(g, x, y + 10, 'UNOWNED', '#fff', 10, 700);
    } else {
      svgText(g, x, y + 5, owner, '#fff', 13, 700);
    }

    const taskCount = orgData.departments.reduce(
      (sum, d) => sum + d.tasks.filter(t => t.owner === owner).length, 0
    );
    const deptNames = orgData.departments
      .filter(d => d.tasks.some(t => t.owner === owner))
      .map(d => d.name)
      .join(', ');
    const ownerTipHtml = `<strong>${owner}</strong>${taskCount} tasks · Depts: ${deptNames || 'none'}`;

    g.addEventListener('mouseenter', (e) => {
      showMapTooltip(ownerTipHtml, e.clientX, e.clientY);
      g.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.6))';
    });
    g.addEventListener('mousemove',  (e) => showMapTooltip(ownerTipHtml, e.clientX, e.clientY));
    g.addEventListener('mouseleave', () => {
      hideMapTooltip();
      g.style.filter = '';
    });
    g.addEventListener('click', () => {
      // Toggle focus on this owner
      mapState.focusedOwner = (mapState.focusedOwner === owner) ? null : owner;
      if (mapState.focusedOwner === owner) mapState.hiddenOwners.delete(owner);
      renderMapControls();
      renderFlowMap();
    });
  });

  // ── Legend ────────────────────────────────────────────────────────
  svgText(svg, canvasW / 2, 22,
    'Line thickness = task count  \u00B7  Dashed red = unowned  \u00B7  Click circles or dept boxes to interact',
    '#90a4ae', 11, 400);
}

// ── SVG helpers ───────────────────────────────────────────────────────

function svgGroup(parent) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  parent.appendChild(g);
  return g;
}

function svgRect(parent, x, y, w, h, fill, rx = 0, stroke = 'none', strokeW = 0) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  el.setAttribute('x', x);  el.setAttribute('y', y);
  el.setAttribute('width', w); el.setAttribute('height', h);
  el.setAttribute('fill', fill);
  el.setAttribute('rx', rx);
  if (stroke !== 'none') {
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', strokeW);
  }
  parent.appendChild(el);
  return el;
}

function svgText(parent, x, y, text, fill, fontSize, fontWeight, textAnchor = 'middle') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.setAttribute('text-anchor', textAnchor);
  el.setAttribute('dominant-baseline', 'middle');
  el.setAttribute('fill', fill);
  el.setAttribute('font-size', fontSize);
  el.setAttribute('font-weight', fontWeight);
  el.setAttribute('font-family', "Segoe UI, Tahoma, Geneva, Verdana, sans-serif");
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function svgCircle(parent, cx, cy, r, fill, stroke, strokeW) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', cx); el.setAttribute('cy', cy);
  el.setAttribute('r', r);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeW);
  parent.appendChild(el);
  return el;
}

function svgLine(parent, x1, y1, x2, y2, stroke, strokeW) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeW);
  parent.appendChild(el);
  return el;
}

function svgPath(parent, d, stroke, strokeW, dashArray = null, opacity = 1) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeW);
  if (dashArray) el.setAttribute('stroke-dasharray', dashArray);
  if (opacity < 1) el.setAttribute('opacity', opacity);
  parent.appendChild(el);
  return el;
}

// ====================
// STATS
// ====================
function updateStats() {
  let total = 0, assigned = 0, unowned = 0, done = 0, inProgress = 0, blocked = 0;

  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      total++;
      if (task.owner === 'UNOWNED') unowned++;
      else assigned++;
      // Status counters — default to 'todo' for pre-feature tasks
      const s = task.status || 'todo';
      if (s === 'done')        done++;
      else if (s === 'in-progress') inProgress++;
      else if (s === 'blocked')     blocked++;
    });
  });

  document.getElementById('stat-total').textContent       = total;
  document.getElementById('stat-done').textContent        = done;
  document.getElementById('stat-in-progress').textContent = inProgress;
  document.getElementById('stat-blocked').textContent     = blocked;
  document.getElementById('stat-assigned').textContent    = assigned;
  document.getElementById('stat-unowned').textContent     = unowned;
  document.getElementById('stat-departments').textContent = orgData.departments.length;

  // Keep every beacon in sync whenever task counts change (after any assignment,
  // auto-assign run, import, or reset).
  updateBeacons();
}

// ====================
// SAVE TOAST
// ====================

let _toastTimer = null;

function showSaveToast(isError = false) {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  clearTimeout(_toastTimer);

  toast.textContent = isError ? '⚠ Save failed' : '✓ Saved';
  toast.className = 'save-toast' + (isError ? ' save-toast--error' : '');

  // Force reflow so re-triggering the animation works
  void toast.offsetWidth;
  toast.classList.add('visible');

  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
}

// ====================
// PERSISTENCE (localStorage)
// ====================

const STORAGE_KEY      = 'pm-ops-data-v1';
const COMPANY_KEY      = 'pm-ops-company-name';

function saveToStorage() {
  try {
    const payload = orgData.departments.map(dept => ({
      id: dept.id,
      // Include status and priority so they survive a page refresh.
      // Default values ('todo', 'medium') are written explicitly so exported
      // files can be re-imported into older versions without crashing.
      tasks: dept.tasks.map(t => ({
        name:     t.name,
        owner:    t.owner,
        status:   t.status   || 'todo',
        priority: t.priority || 'medium'
      }))
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showSaveToast();
  } catch (e) {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    showSaveToast(true);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    saved.forEach(savedDept => {
      const dept = orgData.departments.find(d => d.id === savedDept.id);
      if (!dept) return;
      savedDept.tasks.forEach((savedTask, idx) => {
        if (dept.tasks[idx]) {
          dept.tasks[idx].name  = savedTask.name;
          dept.tasks[idx].owner = savedTask.owner;
          // status and priority are optional so older saves load cleanly —
          // they'll just default to 'todo' / 'medium' during rendering.
          if (savedTask.status)   dept.tasks[idx].status   = savedTask.status;
          if (savedTask.priority) dept.tasks[idx].priority = savedTask.priority;
        }
      });
    });
  } catch (e) {
    // Ignore corrupt / incompatible saved data
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetStorage() {
  if (!confirm('Reset all task names and owner assignments to defaults?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ====================
// EXPORT / IMPORT
// ====================

function exportJSON() {
  const payload = {
    company: getCompanyName(),
    exported: new Date().toISOString(),
    departments: orgData.departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      tasks: dept.tasks.map(t => ({
        name:     t.name,
        owner:    t.owner,
        status:   t.status   || 'todo',
        priority: t.priority || 'medium'
      }))
    }))
  };
  _downloadBlob(
    JSON.stringify(payload, null, 2),
    'application/json',
    `pm-ops-${_fileSlug()}.json`
  );
}

function exportCSV() {
  const rows = [['Department', 'Task', 'Owner', 'Status', 'Priority']];
  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      rows.push([
        dept.name,
        task.name,
        task.owner,
        task.status   || 'todo',
        task.priority || 'medium'
      ]);
    });
  });
  const csv = rows.map(r =>
    r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
  _downloadBlob(csv, 'text/csv', `pm-ops-${_fileSlug()}.csv`);
}

function importJSON(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data.departments)) throw new Error('Missing departments');

      data.departments.forEach(savedDept => {
        const dept = orgData.departments.find(d => d.id === savedDept.id);
        if (!dept) return;
        if (!Array.isArray(savedDept.tasks)) return;
        savedDept.tasks.forEach((savedTask, idx) => {
          if (dept.tasks[idx] && savedTask.name && savedTask.owner) {
            dept.tasks[idx].name  = savedTask.name;
            dept.tasks[idx].owner = savedTask.owner;
            if (savedTask.status)   dept.tasks[idx].status   = savedTask.status;
            if (savedTask.priority) dept.tasks[idx].priority = savedTask.priority;
          }
        });
      });

      if (data.company) {
        try { localStorage.setItem(COMPANY_KEY, data.company); } catch (_) {}
        applyCompanyName(data.company);
      }

      saveToStorage();
      renderTrackingView();
      updateStats();
      document.querySelectorAll('.department').forEach(d => d.classList.add('expanded'));
      populateOwnerFilter();
    } catch (e) {
      alert('Import failed: invalid or incompatible file.');
    } finally {
      inputEl.value = '';
    }
  };
  reader.readAsText(file);
}

function _fileSlug() {
  return getCompanyName().replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
}

function _downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ====================
// COMPANY NAME
// ====================

function getCompanyName() {
  return localStorage.getItem(COMPANY_KEY) || 'Your Company';
}

// Render the company name into the SVG box, wrapping words across up to 3 lines.
function drawCompanyLabel(layer, cx, cy) {
  const name  = getCompanyName().toUpperCase();
  const words = name.trim().split(/\s+/);

  let lines;
  if (words.length <= 3) {
    lines = words;
  } else {
    // Chunk into 3 roughly-equal groups
    const size = Math.ceil(words.length / 3);
    lines = [
      words.slice(0, size).join(' '),
      words.slice(size, size * 2).join(' '),
      words.slice(size * 2).join(' '),
    ].filter(Boolean);
  }

  const lineH  = 16;
  const startY = cy - ((lines.length - 1) / 2) * lineH;
  lines.forEach((line, i) => {
    const isLast   = i === lines.length - 1 && lines.length > 1;
    svgText(layer, cx, startY + i * lineH, line, '#fff', isLast ? 10 : 12, isLast ? 400 : 700);
  });
}

function applyCompanyName(name) {
  const heading = document.getElementById('company-heading');
  if (heading) heading.textContent = name.toUpperCase();
  // SVG map re-reads getCompanyName() on next render — no extra action needed.
}

// ============================================================
// TASK STATUS & PRIORITY — Constants, Helpers, and Cycle Logic
// ============================================================
// All status/priority functionality is grouped here so it's easy to find.
// renderTrackingView() reads STATUS_LABELS and PRIORITY_LABELS at render time.
// cycleTaskStatus / cycleTaskPriority are called by the pill/dot onclick handlers.
// ============================================================

// Human-readable labels for each status value.
// The HTML uses these so the status pill always shows the right text.
const STATUS_LABELS = {
  'todo':        'To Do',
  'in-progress': 'In Progress',
  'blocked':     '⚠ Blocked',
  'done':        '✓ Done'
};

// Labels for the priority dot tooltip.
const PRIORITY_LABELS = {
  'high':   'High',
  'medium': 'Medium',
  'low':    'Low'
};

// Click-to-cycle orders — each click advances one step, wrapping around.
// Status cycle follows the natural task lifecycle: start → work → stuck → done.
const STATUS_CYCLE   = ['todo', 'in-progress', 'blocked', 'done'];
const PRIORITY_CYCLE = ['high', 'medium', 'low'];

// ── buildDeptCompletionText ───────────────────────────────────────────────────
// Returns the inline HTML that shows done and blocked counts in the dept header.
// Called by renderTrackingView and updateDeptProgress.
// Returns an empty string when both counts are zero so the header stays clean.
function buildDeptCompletionText(doneCount, blockedCount) {
  const parts = [];
  if (doneCount   > 0) parts.push(`· <span class="dept-done-count">✓ ${doneCount} done</span>`);
  if (blockedCount > 0) parts.push(`· <span class="dept-blocked-count">⚠ ${blockedCount} blocked</span>`);
  return parts.join(' ');
}

// ── cycleTaskStatus ───────────────────────────────────────────────────────────
// Advances a task's status one step in the cycle and updates the DOM surgically
// (no full re-render needed — only the changed task row and dept header update).
function cycleTaskStatus(deptId, taskIdx) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  const task    = dept.tasks[taskIdx];
  const current = task.status || 'todo';
  // Advance to next step, wrapping back to 'todo' after 'done'
  task.status   = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];

  // ── Surgical DOM update — only touch what changed ──────────────────────────
  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    const newStatus = task.status;
    // Keep data-status in sync so the filter can read it without a re-render
    taskEl.dataset.status = newStatus;
    // Toggle the done-dimming class
    taskEl.classList.toggle('task-done', newStatus === 'done');

    // Update the status pill: new class + new label text
    const pill = taskEl.querySelector('.status-pill');
    if (pill) {
      pill.className = `status-pill status-${newStatus}`;
      pill.textContent = STATUS_LABELS[newStatus];
      pill.title = `Status: ${STATUS_LABELS[newStatus]} — click to change`;
    }
  }

  // Update the department header progress bar + done/blocked counts
  updateDeptProgress(deptId);

  saveToStorage(); // Persist immediately — no debounce needed for single-click ops
  updateStats();   // Refresh the global Done / In Progress / Blocked stat cards
}

// ── cycleTaskPriority ─────────────────────────────────────────────────────────
// Advances a task's priority one step (High → Medium → Low → High) and updates
// only the priority dot — a minimal, surgical DOM change.
function cycleTaskPriority(deptId, taskIdx) {
  const dept = orgData.departments.find(d => d.id === deptId);
  if (!dept) return;

  const task    = dept.tasks[taskIdx];
  const current = task.priority || 'medium';
  task.priority = PRIORITY_CYCLE[(PRIORITY_CYCLE.indexOf(current) + 1) % PRIORITY_CYCLE.length];

  // Update data attribute so the filter reads the new value immediately
  const taskEl = document.querySelector(
    `.department[data-id="${deptId}"] .task-item[data-task-idx="${taskIdx}"]`
  );
  if (taskEl) {
    taskEl.dataset.priority = task.priority;
    const dot = taskEl.querySelector('.priority-dot');
    if (dot) {
      // Swap the priority color class — remove old, add new
      PRIORITY_CYCLE.forEach(p => dot.classList.remove(`priority-${p}`));
      dot.classList.add(`priority-${task.priority}`);
      dot.title = `Priority: ${PRIORITY_LABELS[task.priority]} — click to change`;
    }
  }

  saveToStorage();
}

// ── updateDeptProgress ────────────────────────────────────────────────────────
// Refreshes only the department header's progress bar and done/blocked counts
// after a status change — avoids re-rendering the entire department card.
function updateDeptProgress(deptId) {
  const dept   = orgData.departments.find(d => d.id === deptId);
  const deptEl = document.querySelector(`.department[data-id="${deptId}"]`);
  if (!dept || !deptEl) return;

  const total    = dept.tasks.length;
  const done     = dept.tasks.filter(t => (t.status || 'todo') === 'done').length;
  const blocked  = dept.tasks.filter(t => (t.status || 'todo') === 'blocked').length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

  // Animate the progress bar fill to the new percentage
  const fill = deptEl.querySelector('.dept-progress-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.closest('.dept-progress-track').title = `${pct}% of tasks done`;
  }

  // Update the done/blocked text counts inline
  const completionEl = deptEl.querySelector('.dept-completion');
  if (completionEl) completionEl.innerHTML = buildDeptCompletionText(done, blocked);
}

// ====================
// ONBOARDING MODAL
// ====================

function showOnboardingModal() {
  const modal = document.getElementById('onboarding-modal');
  modal.classList.add('visible');
  const input = document.getElementById('company-input');
  setTimeout(() => input.focus(), 50);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitCompanyName();
  });
}

function submitCompanyName() {
  const input = document.getElementById('company-input');
  const name  = input.value.trim();
  if (!name) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
    return;
  }
  try { localStorage.setItem(COMPANY_KEY, name); } catch (_) { /* ignore */ }
  applyCompanyName(name);
  document.getElementById('onboarding-modal').classList.remove('visible');
}

// ====================
// INITIALIZATION
// ====================
document.addEventListener('DOMContentLoaded', () => {
  // ★ BEACON: loadTeamData MUST run before loadFromStorage + renderTrackingView
  // so that getEmployeeHex() has a populated registry when it's first called.
  loadTeamData();

  loadFromStorage();
  renderTrackingView();
  updateStats();          // Also calls updateBeacons() internally
  populateOwnerFilter();
  renderLegend();         // Build the dynamic legend from teamData

  document.querySelectorAll('.department').forEach(dept => {
    dept.classList.add('expanded');
  });

  const savedName = localStorage.getItem(COMPANY_KEY);
  if (savedName) {
    applyCompanyName(savedName);
  } else {
    showOnboardingModal();
  }
});

// ============================================================
// ★ BEACON: TEAM DATA — Dynamic Employee Registry
// ============================================================
// teamData is the live runtime registry of all employees.
// It lives in its own localStorage key (TEAM_KEY) separate from task assignments,
// so you can reset tasks without wiping your team roster.
//
// Structure:
//   { employees: [ { name, hex, affinities: [deptId, ...] } ] }
//
// On first load it's seeded from the hardcoded ownerColors + defaultAffinities
// (both defined in data.js). After that, managers edit it in the Team Manager view.
// ============================================================

const TEAM_KEY = 'pm-ops-team-v1';

// Preset hex colors a manager can pick when adding a new employee.
// Every color here is dark enough to contrast against white badge text.
const COLOR_PALETTE = [
  '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab',
  '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047',
  '#7cb342', '#fb8c00', '#f4511e', '#ff6f00', '#1976d2',
  '#c62828', '#263238', '#6d4c41', '#546e7a', '#00695c'
];

// Runtime registry — starts empty, populated by loadTeamData() at DOMContentLoaded.
// Declared with `let` so it can be replaced wholesale on import/reset.
let teamData = { employees: [] };

// Tracks which color swatch is currently selected in the Add Employee form.
let _selectedColor = COLOR_PALETTE[0];

// ── Seed default employees ────────────────────────────────────────────────────
// Called only on first-ever load (when TEAM_KEY doesn't exist in localStorage).
// Converts the static ownerColors object (data.js) into the dynamic teamData format,
// merging in the defaultAffinities map so the auto-assign engine has a head start.
function seedDefaultTeam() {
  teamData.employees = Object.entries(ownerColors)
    .filter(([name]) => name !== 'UNOWNED') // UNOWNED is a state, not a real person
    .map(([name, info]) => ({
      name,
      hex: info.hex,
      // Seed from compiled defaults; empty array if the employee isn't listed there
      affinities: defaultAffinities[name] ? [...defaultAffinities[name]] : []
    }));
}

function saveTeamData() {
  try {
    localStorage.setItem(TEAM_KEY, JSON.stringify(teamData));
  } catch (e) {
    // localStorage unavailable (private browsing, quota exceeded) — fail silently
  }
}

function loadTeamData() {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) {
      // First visit — build team from the hardcoded defaults in data.js
      seedDefaultTeam();
      saveTeamData();
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.employees)) {
      teamData = parsed;
    } else {
      // Corrupted data — fall back to defaults
      seedDefaultTeam();
    }
  } catch (e) {
    seedDefaultTeam();
  }
}

// ── Employee helper functions ─────────────────────────────────────────────────

// Returns the hex color for any owner name.
// Checks the live teamData roster first so newly-added employees always
// get their chosen color; falls back to the static ownerColors map, then
// to a neutral gray if the name is completely unknown.
function getEmployeeHex(name) {
  if (name === 'UNOWNED') return '#d32f2f';
  const emp = teamData.employees.find(e => e.name === name);
  if (emp) return emp.hex;
  return ownerColors[name]?.hex || '#607d8b'; // gray for unknown names
}

// Returns an array of all employee names in the current roster (excludes UNOWNED).
function getEmployeeNames() {
  return teamData.employees.map(e => e.name);
}

// Scans all departments and tallies how many tasks each employee currently owns.
// Returns a Map so callers can do O(1) lookups: { employeeName → taskCount }.
// The auto-assign engine calls this before each run so it can balance load in
// real time as it assigns tasks one by one.
function buildWorkloadMap() {
  const counts = new Map();
  // Pre-populate so every employee appears even if they own zero tasks
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
// Used by the beacon updater and the auto-assign button badge.
function countUnowned() {
  return orgData.departments.reduce(
    (sum, dept) => sum + dept.tasks.filter(t => t.owner === 'UNOWNED').length,
    0
  );
}

// ============================================================
// ★ BEACON UPDATER
// ============================================================
// Keeps every beacon in sync with the current UNOWNED count.
// Called after any action that changes task assignments:
//   setTaskOwner → updateStats → updateBeacons
//   runAutoAssign → updateBeacons (direct)
//   removeEmployee → updateBeacons (direct)
//   commitAddEmployee → updateBeacons (direct)
// ============================================================
function updateBeacons() {
  const count = countUnowned();

  // ★ Nav-tab beacon — the pulsing red dot on the Team Manager tab.
  // Visible = "you have UNOWNED tasks to deal with", hidden = "all clear".
  const tabBeacon = document.getElementById('tab-beacon');
  if (tabBeacon) tabBeacon.hidden = (count === 0);

  // ★ Auto-assign button badge — the red count inside the button itself.
  // Disappears entirely when count reaches zero so the button looks "calm".
  const badge = document.getElementById('auto-assign-badge');
  if (badge) {
    badge.textContent  = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  // Disable the auto-assign button when there's nothing left to assign,
  // and update its tooltip to reflect the current state.
  const btn = document.getElementById('auto-assign-btn');
  if (btn) {
    btn.disabled = (count === 0);
    btn.title = count > 0
      ? `Auto-assign ${count} unowned task${count !== 1 ? 's' : ''} based on department affinities`
      : 'All tasks are assigned — nothing to auto-assign!';
  }
}

// ============================================================
// ★ AUTO-ASSIGN ENGINE
// ============================================================
// Distributes every UNOWNED task to an employee based on two rules:
//
//   Rule 1 — Affinity match:
//     Prefer employees whose affinity tags include the task's department.
//     This routes "Maintenance Coordination" tasks to TeamMember4/TeamMember7, not Carlos.
//
//   Rule 2 — Workload balance:
//     Among the matching employees, always pick whoever has the fewest tasks
//     RIGHT NOW (updated live as we assign). This prevents one person getting
//     a pile while others stay empty.
//
//   Fallback: if nobody has an affinity for the department, the engine
//   falls back to globally least-loaded — so no task is ever left UNOWNED.
// ============================================================
function runAutoAssign() {
  const unownedCount = countUnowned();

  if (unownedCount === 0) {
    // Nothing to do — show the success toast as feedback
    showAutoAssignToast(0);
    return;
  }

  if (teamData.employees.length === 0) {
    alert('No employees in your team roster.\nAdd at least one employee in the Team Manager tab first.');
    return;
  }

  // Live workload map — updated incrementally so each assignment within
  // this run is immediately visible to the next iteration.
  // This is what prevents a single person from getting ALL the tasks.
  const workload = buildWorkloadMap();
  let assignedCount = 0;

  orgData.departments.forEach(dept => {
    dept.tasks.forEach((task) => {
      if (task.owner !== 'UNOWNED') return; // Already assigned — skip

      // Step 1: Find employees whose affinity tags include this department
      const affinityMatches = teamData.employees.filter(emp =>
        emp.affinities.includes(dept.id)
      );

      // Step 2: Build the candidate pool.
      // If nobody has a matching affinity we use the entire team as a fallback
      // rather than leaving the task UNOWNED.
      const candidates = affinityMatches.length > 0
        ? affinityMatches
        : [...teamData.employees];

      // Step 3: Sort candidates by current task count (ascending) so the
      // least-loaded employee is always at index 0.
      candidates.sort((a, b) =>
        (workload.get(a.name) || 0) - (workload.get(b.name) || 0)
      );

      const winner = candidates[0];
      if (!winner) return; // Safety net — cannot happen if employees array is non-empty

      // Step 4: Commit the assignment to the data model
      task.owner = winner.name;

      // Step 5: Increment the winner's count in our live workload map
      // so the NEXT task in this loop sees the updated load.
      workload.set(winner.name, (workload.get(winner.name) || 0) + 1);
      assignedCount++;
    });
  });

  // Persist and re-render every UI surface that shows task ownership
  saveToStorage();
  renderTrackingView();
  updateStats();            // Also calls updateBeacons() internally
  populateOwnerFilter();
  renderLegend();

  if (currentView === 'map') {
    renderMapControls();
    renderFlowMap();
  }
  if (currentView === 'team') {
    renderTeamView(); // Refresh the workload chart to reflect new assignments
  }

  showAutoAssignToast(assignedCount);
}

// Shows a green success toast confirming how many tasks were just auto-assigned.
function showAutoAssignToast(count) {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  clearTimeout(_toastTimer);

  toast.textContent = count > 0
    ? `⚡ ${count} task${count !== 1 ? 's' : ''} auto-assigned!`
    : '✓ All tasks already assigned';

  toast.className = 'save-toast save-toast--success';
  void toast.offsetWidth; // Force reflow so the animation restarts cleanly
  toast.classList.add('visible');

  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ============================================================
// ★ TEAM MANAGER VIEW
// ============================================================
// Renders the full Team Manager panel: header with alert, employee roster
// (left column), and workload dashboard bar chart (right column).
// Called every time the Team Manager tab is opened or team data changes.
// ============================================================
function renderTeamView() {
  const container = document.getElementById('team-view-inner');
  if (!container) return;

  const workload = buildWorkloadMap();
  // maxTasks prevents division-by-zero and sets the 100% bar width reference point
  const maxTasks = Math.max(...[...workload.values()], 1);
  const unowned  = countUnowned();

  container.innerHTML = `
    <!-- ★ BEACON: Team header shows a red alert when UNOWNED tasks exist,
         or a green "all clear" badge when everything is assigned. -->
    <div class="team-header">
      <div>
        <h2 class="team-heading">&#128101; Team Manager</h2>
        <p class="team-subheading">Add employees, set department affinities, then hit Auto-Assign to map tasks automatically.</p>
      </div>
      ${unowned > 0 ? `
        <div class="team-unowned-alert">
          <span class="beacon-dot"></span>
          <strong>${unowned} unowned task${unowned !== 1 ? 's' : ''}</strong> need assignment
          <button class="btn-auto-assign-inline" onclick="runAutoAssign()">&#9889; Auto-Assign Now</button>
        </div>
      ` : `
        <div class="team-all-assigned">&#10003; All tasks are assigned!</div>
      `}
    </div>

    <!-- Two-column layout: [Employee Roster] | [Workload Dashboard] -->
    <div class="team-layout">

      <!-- LEFT COLUMN: Roster + Add Employee form -->
      <div class="team-roster-panel">
        <h3 class="team-panel-heading">Employee Roster</h3>

        <!-- Add Employee form — dashed border to signal "editable area" -->
        <div class="add-employee-form">
          <input
            type="text"
            id="new-emp-name"
            class="add-emp-input"
            placeholder="Employee name..."
            maxlength="30"
            autocomplete="off"
            onkeydown="if(event.key==='Enter') commitAddEmployee()"
          >
          <!-- Color palette — click a swatch to set the employee's badge color -->
          <div class="color-palette" id="color-palette">
            ${COLOR_PALETTE.map((hex, i) => `
              <button
                class="color-swatch${i === 0 ? ' selected' : ''}"
                style="background:${hex}"
                data-color="${hex}"
                title="${hex}"
                onclick="selectPaletteColor(this)"
              ></button>
            `).join('')}
          </div>
          <button class="btn-add-employee" onclick="commitAddEmployee()">+ Add Employee</button>
        </div>

        <!-- Employee cards — one per roster member -->
        <div class="employee-list">
          ${teamData.employees.map(emp =>
            buildEmployeeCard(emp, orgData.departments, workload, maxTasks)
          ).join('')}
        </div>
      </div>

      <!-- RIGHT COLUMN: Workload Dashboard -->
      <div class="workload-panel">
        <h3 class="team-panel-heading">Workload Dashboard</h3>
        <p class="workload-desc">
          Bar width = task share relative to the most-loaded employee.
          Auto-assign always picks the least-loaded eligible candidate.
          <!-- ★ BEACON: Overloaded employees (≥35% above average) get a ⚠ warning. -->
        </p>
        <div class="workload-chart">
          ${buildWorkloadBars(workload, maxTasks)}
        </div>
      </div>

    </div>
  `;

  // After rendering, reset the selected color to the first swatch so
  // the `_selectedColor` state and the visual selection are in sync.
  _selectedColor = COLOR_PALETTE[0];
}

// ── buildEmployeeCard ─────────────────────────────────────────────────────────
// Returns the HTML string for one employee card.
// Kept as a separate function so it can be re-used if we ever need
// to refresh a single card without rebuilding the whole view.
function buildEmployeeCard(emp, depts, workload, maxTasks) {
  const taskCount = workload.get(emp.name) || 0;
  const pct       = maxTasks > 0 ? Math.round((taskCount / maxTasks) * 100) : 0;

  return `
    <div class="employee-card" data-emp="${emp.name}">
      <!-- Header row: color dot | name | task count | mini-bar | Remove button -->
      <div class="employee-card-header">
        <span class="emp-color-dot" style="background:${emp.hex}"></span>
        <span class="emp-name">${emp.name}</span>
        <span class="emp-task-count" style="color:${emp.hex}">${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
        <!-- Mini workload bar — same data as the dashboard, just much smaller -->
        <div class="emp-mini-bar-track">
          <div class="emp-mini-bar-fill" style="width:${Math.max(pct, 2)}%;background:${emp.hex}"></div>
        </div>
        <button class="emp-remove-btn" onclick="removeEmployee('${emp.name}')" title="Remove ${emp.name}">&#x2715;</button>
      </div>

      <!-- Affinity tags: one toggle button per department.
           Filled = has affinity (auto-assign will route matching tasks here).
           Outline only = no affinity (tasks won't be preferentially routed here). -->
      <div class="affinity-tags">
        <span class="affinity-label">Affinities:</span>
        ${depts.map(dept => {
          const active = emp.affinities.includes(dept.id);
          return `
            <button
              class="affinity-tag${active ? ' active' : ''}"
              style="${active
                ? `background:${dept.color};border-color:${dept.color}`
                : `border-color:${dept.color};color:${dept.color}`}"
              onclick="toggleAffinity('${emp.name}','${dept.id}')"
              title="${active ? 'Remove' : 'Add'} affinity: ${dept.name}"
            >${dept.name}</button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ── buildWorkloadBars ─────────────────────────────────────────────────────────
// Returns HTML for the horizontal bar chart in the Workload Dashboard.
// Rows are sorted by task count descending (most loaded at top).
// Overloaded employees (≥35% above the team average AND more than 5 tasks)
// get a ★ BEACON warning indicator — the red ⚠ icon and a tinted background.
function buildWorkloadBars(workload, maxTasks) {
  const sorted = [...workload.entries()].sort((a, b) => b[1] - a[1]);

  // Compute the team average so we can flag outliers
  const total = [...workload.values()].reduce((a, b) => a + b, 0);
  const avg   = workload.size > 0 ? total / workload.size : 0;

  return sorted.map(([name, count]) => {
    const pct        = maxTasks > 0 ? Math.round((count / maxTasks) * 100) : 0;
    const hex        = getEmployeeHex(name);
    // ★ BEACON: only flag as overloaded when meaningfully above average
    const overloaded = count > avg * 1.35 && count > 5;

    return `
      <div class="workload-bar-row${overloaded ? ' overloaded' : ''}">
        <div class="workload-name-cell">
          <span class="wl-dot" style="background:${hex}"></span>
          <span class="wl-name">${name}</span>
          ${overloaded
            ? '<span class="wl-beacon" title="Significantly above team average — consider re-balancing">&#9888;</span>'
            : ''}
        </div>
        <div class="workload-bar-track">
          <div class="workload-bar-fill" style="width:${Math.max(pct, 2)}%;background:${hex}"></div>
        </div>
        <span class="workload-count">${count}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// EMPLOYEE CRUD — Add, Remove, Toggle Affinity
// ============================================================

// Highlights the clicked palette swatch and records the chosen color.
// Called by the onclick on each .color-swatch button.
function selectPaletteColor(swatchEl) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  swatchEl.classList.add('selected');
  _selectedColor = swatchEl.dataset.color;
}

// Reads the name input + currently selected palette color, validates,
// then adds the employee to the live roster.
function commitAddEmployee() {
  const input = document.getElementById('new-emp-name');
  const name  = (input?.value || '').trim();

  if (!name) {
    // Reuse the existing shake animation (defined in CSS for onboarding-input)
    // as a lightweight "you forgot to fill this in" signal.
    input?.classList.add('shake');
    setTimeout(() => input?.classList.remove('shake'), 400);
    return;
  }

  // Prevent duplicates — case-insensitive so "teammember4" can't shadow "TeamMember4"
  const duplicate = teamData.employees.some(
    e => e.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    alert(`"${name}" is already in the roster.`);
    return;
  }

  teamData.employees.push({
    name,
    hex: _selectedColor,
    affinities: [] // New employees start with no affinities — manager sets them via the tags
  });

  saveTeamData();
  renderTeamView();       // Re-render the team view to show the new card
  renderLegend();         // Add them to the color legend in the controls bar
  populateOwnerFilter();  // Add them to the "Filter by owner" dropdown
  updateBeacons();
}

// Removes an employee from the roster.
// Tasks previously assigned to them revert to UNOWNED so nothing silently
// disappears — the manager will see the unowned count go up and can re-assign.
function removeEmployee(name) {
  if (!confirm(`Remove "${name}" from the roster?\n\nTheir tasks will be marked UNOWNED.`)) return;

  // Revert all tasks owned by this employee back to UNOWNED
  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      if (task.owner === name) task.owner = 'UNOWNED';
    });
  });

  teamData.employees = teamData.employees.filter(e => e.name !== name);

  saveTeamData();
  saveToStorage();       // Persist the reverted task assignments
  renderTeamView();
  renderTrackingView();  // Refresh the tracking view so removed owner badges update
  updateStats();         // Recalculates unowned count → updateBeacons()
  renderLegend();
  populateOwnerFilter();

  if (currentView === 'map') {
    renderMapControls();
    renderFlowMap();
  }
}

// Toggles a department affinity on or off for a given employee.
// This is what the colored department buttons in each employee card do.
// The change persists immediately so the auto-assign engine picks it up next run.
function toggleAffinity(empName, deptId) {
  const emp = teamData.employees.find(e => e.name === empName);
  if (!emp) return;

  const idx = emp.affinities.indexOf(deptId);
  if (idx === -1) {
    emp.affinities.push(deptId);   // Add the affinity
  } else {
    emp.affinities.splice(idx, 1); // Remove the affinity
  }

  saveTeamData();
  // Re-render the team view to reflect the tag toggle visually
  renderTeamView();
}

// ============================================================
// DYNAMIC LEGEND
// ============================================================
// Replaces the old hardcoded legend HTML with a version built from
// the live teamData roster so new employees appear automatically.
function renderLegend() {
  const legend = document.getElementById('owner-legend');
  if (!legend) return;

  legend.innerHTML = teamData.employees.map(emp => `
    <div class="legend-item">
      <div class="legend-color" style="background:${emp.hex}"></div>
      <span>${emp.name}</span>
    </div>
  `).join('') + `
    <div class="legend-item">
      <div class="legend-color" style="background:#d32f2f"></div>
      <span>&#9888;&#65039; UNOWNED</span>
    </div>
  `;
}
