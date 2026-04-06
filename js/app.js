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
  if (view === 'map') {
    renderMapControls();
    renderFlowMap();
  } else if (view === 'models') {
    renderStrategicModels();
    renderCaseStudies();
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

    // Stamp the card's interior HTML all at once — header + every task row.
    deptDiv.innerHTML = `
      <div class="department-header" style="background: ${dept.color}" onclick="toggleDepartment('${dept.id}')">
        <span>${dept.name} (<span class="dept-task-count">${dept.tasks.length}</span> tasks)</span>
        <span>&#9660;</span>
      </div>
      <div class="department-body">
        ${dept.tasks.map((task, taskIdx) => {
          // Escape any quotes in the task name so they don't break the HTML attribute.
          // Like putting a "handle with care" label on a fragile package.
          const safeName = task.name.replace(/"/g, '&quot;');
          // Flag tasks with no owner — the orphan tasks that need adoption.
          const isUnowned = task.owner === 'UNOWNED';
          return `
          <div class="task-item ${isUnowned ? 'unowned' : ''}"
               data-dept-id="${dept.id}"
               data-task-idx="${taskIdx}"
               data-owner="${task.owner}"
               data-name="${safeName.toLowerCase()}">
            <div class="task-name"
                 ondblclick="startTaskEdit('${dept.id}', ${taskIdx})"
                 title="Double-click to rename">${task.name}</div>
            <div class="task-owner ${ownerColors[task.owner]?.class || 'owner-unowned'}"
                 onclick="showOwnerPicker('${dept.id}', ${taskIdx}, this)"
                 title="Click to reassign">
              ${task.owner}
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

  // For each known owner, create a color-coded button in the dropdown.
  // Like printing a name tag for every person in the roster.
  Object.keys(ownerColors).forEach(owner => {
    const btn = document.createElement('button');
    btn.className = `owner-picker-btn ${ownerColors[owner]?.class || 'owner-unowned'}`;
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
    // Strip ALL existing color classes off the badge before adding the new one —
    // like peeling off an old sticker before applying a fresh one.
    badge.className = 'task-owner';
    badge.classList.add(ownerColors[newOwner]?.class || 'owner-unowned');
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

// The search engine: reads the keyword and owner filter, then shows/hides
// task rows and entire department cards like a bouncer checking a list.
function applyFilter() {
  // Read the search box and lowercase it — case-insensitive matching.
  const keyword = document.getElementById('search-input').value.toLowerCase().trim();
  // Read the owner dropdown selection (empty string = "show all").
  const selectedOwner = document.getElementById('owner-filter').value;
  // Are we actually filtering anything, or is everything wide open?
  const isFiltering = keyword !== '' || selectedOwner !== '';

  // Running tallies so we can detect "no results" at the end.
  let visibleTaskTotal = 0;
  let visibleDeptCount = 0;

  // Walk through every department card on screen.
  document.querySelectorAll('.department').forEach(deptEl => {
    const taskItems = deptEl.querySelectorAll('.task-item');
    let deptVisibleCount = 0; // How many tasks in this dept survived the filter?

    // Check each task row against both filters — like a bouncer with TWO criteria.
    taskItems.forEach(item => {
      const name  = item.dataset.name;  // Pre-lowercased name stored in the DOM.
      const owner = item.dataset.owner; // Owner name stored in the DOM.

      // Pass if: keyword is blank OR name contains the keyword.
      const matchesKeyword = !keyword || name.includes(keyword);
      // Pass if: no owner filter selected OR this task's owner matches.
      const matchesOwner   = !selectedOwner || owner === selectedOwner;

      if (matchesKeyword && matchesOwner) {
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
  const searchInput = document.getElementById('search-input');
  const ownerFilter = document.getElementById('owner-filter');
  if (searchInput) searchInput.value = '';
  if (ownerFilter) ownerFilter.value = '';

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
    btn.style.setProperty('--pill-color', ownerColors[owner]?.hex || '#d32f2f');
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
          <div class="map-panel-owner-badge ${ownerColors[owner]?.class || 'owner-unowned'}">${owner}</div>
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
// STRATEGIC MODELS VIEW
// ====================
function renderStrategicModels() {
  const container = document.getElementById('models-container');
  if (container.innerHTML) return;

  container.innerHTML = strategicModels.map(model => `
    <div class="model-card">
      <h3>${model.title}</h3>
      <p class="model-subtitle">${model.subtitle}</p>
      <div class="model-best-for"><strong>Best For:</strong> ${model.bestFor}</div>
      <h4 class="model-structure-heading">Team Structure:</h4>
      <ul>
        ${model.teamStructure.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <div class="model-pros-cons">
        <div class="model-pros">
          <h5>&#10003; Pros</h5>
          <ul>${model.pros.map(pro => `<li>${pro}</li>`).join('')}</ul>
        </div>
        <div class="model-cons">
          <h5>&#9888; Cons</h5>
          <ul>${model.cons.map(con => `<li>${con}</li>`).join('')}</ul>
        </div>
      </div>
      <p class="model-example"><strong>Example:</strong> ${model.example}</p>
    </div>
  `).join('');
}

function renderCaseStudies() {
  const container = document.getElementById('case-studies-container');
  if (container.innerHTML) return;

  container.innerHTML = caseStudies.map(study => `
    <div class="case-study">
      <h3>${study.title}</h3>
      <p class="case-study-source"><strong>Source:</strong> ${study.source}</p>
      <ul>
        ${study.findings.map(finding => `<li>${finding}</li>`).join('')}
      </ul>
      <p class="case-study-link">
        <a href="${study.link}" target="_blank" rel="noopener noreferrer">Read Full Case Study &#8594;</a>
      </p>
    </div>
  `).join('');
}

// ====================
// STATS
// ====================
function updateStats() {
  let total = 0, assigned = 0, unowned = 0;

  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      total++;
      if (task.owner === 'UNOWNED') unowned++;
      else assigned++;
    });
  });

  document.getElementById('stat-total').textContent       = total;
  document.getElementById('stat-assigned').textContent    = assigned;
  document.getElementById('stat-unowned').textContent     = unowned;
  document.getElementById('stat-departments').textContent = orgData.departments.length;
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
      tasks: dept.tasks.map(t => ({ name: t.name, owner: t.owner }))
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
  loadFromStorage();
  renderTrackingView();
  updateStats();
  populateOwnerFilter();

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
