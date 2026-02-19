// ====================
// VIEW MANAGEMENT
// ====================
let currentView = 'tracking';

// FIX: Accept the clicked tab element explicitly instead of relying on
// the implicit window.event global (which is undefined in Firefox).
function switchView(view, tabEl) {
  currentView = view;

  // Hide all views
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Show selected view
  document.getElementById(`${view}-view`).classList.add('active');

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  tabEl.classList.add('active');

  // Show search/filter bar only on the Tracking view; reset it on leave
  const filterBar = document.getElementById('filter-bar');
  if (view === 'tracking') {
    filterBar.style.display = 'flex';
  } else {
    filterBar.style.display = 'none';
    clearFilter(); // reset so returning to tracking shows everything
  }

  // Render view-specific content
  if (view === 'map') {
    renderFlowMap();
  } else if (view === 'models') {
    renderStrategicModels();
    renderCaseStudies();
  }
}

// ====================
// TRACKING VIEW
// ====================
function renderTrackingView() {
  const container = document.getElementById('departments');
  container.innerHTML = '';

  orgData.departments.forEach(dept => {
    const deptDiv = document.createElement('div');
    deptDiv.className = 'department';
    deptDiv.style.borderTop = `4px solid ${dept.color}`;
    // FIX: store the dept id in a data attribute for reliable lookup
    deptDiv.dataset.id = dept.id;

    deptDiv.innerHTML = `
      <div class="department-header" style="background: ${dept.color}" onclick="toggleDepartment('${dept.id}')">
        <span>${dept.name} (<span class="dept-task-count">${dept.tasks.length}</span> tasks)</span>
        <span>&#9660;</span>
      </div>
      <div class="department-body">
        ${dept.tasks.map(task => {
          // Escape special characters for safe use in data attributes
          const safeName = task.name.replace(/"/g, '&quot;');
          return `
          <div class="task-item ${task.owner === 'UNOWNED' ? 'unowned' : ''}"
               data-owner="${task.owner}"
               data-name="${safeName.toLowerCase()}">
            <div class="task-name">${task.name}</div>
            <div class="task-owner ${ownerColors[task.owner]?.class || 'owner-unowned'}">
              ${task.owner}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    container.appendChild(deptDiv);
  });
}

// FIX: Use data-id attribute selector instead of brittle textContent/toString matching.
// This is minification-safe and works regardless of task names.
function toggleDepartment(deptId) {
  const dept = document.querySelector(`.department[data-id="${deptId}"]`);
  if (dept) {
    dept.classList.toggle('expanded');
  }
}

// ====================
// SEARCH & FILTER
// ====================

// Populate the owner dropdown from the data once on init
function populateOwnerFilter() {
  const select = document.getElementById('owner-filter');
  // Collect unique owners in the order they appear, then sort alphabetically
  const owners = [...new Set(
    orgData.departments.flatMap(d => d.tasks.map(t => t.owner))
  )].sort((a, b) => {
    // Always put UNOWNED at the end
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

function applyFilter() {
  const keyword = document.getElementById('search-input').value.toLowerCase().trim();
  const selectedOwner = document.getElementById('owner-filter').value;
  const isFiltering = keyword !== '' || selectedOwner !== '';

  let visibleTaskTotal = 0;
  let visibleDeptCount = 0;

  document.querySelectorAll('.department').forEach(deptEl => {
    const taskItems = deptEl.querySelectorAll('.task-item');
    let deptVisibleCount = 0;

    taskItems.forEach(item => {
      const name = item.dataset.name;       // already lowercased at render time
      const owner = item.dataset.owner;

      const matchesKeyword = !keyword || name.includes(keyword);
      const matchesOwner = !selectedOwner || owner === selectedOwner;

      if (matchesKeyword && matchesOwner) {
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
      // Auto-expand matched departments so results are visible
      deptEl.classList.add('expanded');
      // Update the task count shown in the header
      const countSpan = deptEl.querySelector('.dept-task-count');
      if (countSpan) {
        countSpan.textContent = isFiltering
          ? `${deptVisibleCount}/${deptEl.querySelectorAll('.task-item').length}`
          : deptEl.querySelectorAll('.task-item').length;
      }
      visibleDeptCount++;
    }
  });

  // Show/hide the "no results" message
  const noResults = document.getElementById('no-results');
  noResults.style.display = visibleDeptCount === 0 ? 'block' : 'none';

  // Update match count badge
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

  // Restore all departments and tasks
  document.querySelectorAll('.department').forEach(deptEl => {
    deptEl.style.display = '';
    deptEl.querySelectorAll('.task-item').forEach(item => {
      item.style.display = '';
    });
    // Restore original task count in header
    const countSpan = deptEl.querySelector('.dept-task-count');
    if (countSpan) {
      countSpan.textContent = deptEl.querySelectorAll('.task-item').length;
    }
  });

  const noResults = document.getElementById('no-results');
  if (noResults) noResults.style.display = 'none';

  const countEl = document.getElementById('filter-count');
  if (countEl) countEl.style.display = 'none';
}

// ====================
// MAP VIEW - Department → Owner relationship map
// Aggregated 3-column layout: Company → Depts → Owners
// Bezier curves per dept→owner pair; thickness = task count.
// No individual task rows — zero overlap guaranteed.
// ====================
function renderFlowMap() {
  const svg = document.getElementById('flowMap');
  svg.innerHTML = '';

  // ── Layout constants ──────────────────────────────────────────────
  const PADDING_TOP    = 60;   // space for the legend line at the top
  const PADDING_BOTTOM = 50;
  const DEPT_SPACING   = 72;   // px between consecutive dept center lines
  const DEPT_W         = 248;
  const DEPT_H         = 56;
  const DEPT_X         = 230;
  const OWNER_R        = 42;
  const OWNER_X        = 1230;
  const COMPANY_W      = 150;
  const COMPANY_H      = 110;
  const COMPANY_X      = 28;

  const depts       = orgData.departments;
  const deptCount   = depts.length;
  const uniqueOwners = [...new Set(depts.flatMap(d => d.tasks.map(t => t.owner)))];
  const ownerCount  = uniqueOwners.length;

  // Canvas dimensions
  const deptsTotalH = (deptCount - 1) * DEPT_SPACING + DEPT_H;
  const canvasH = PADDING_TOP + deptsTotalH + PADDING_BOTTOM;
  const canvasW = OWNER_X + OWNER_R + 34;

  svg.setAttribute('width', canvasW);
  svg.setAttribute('height', canvasH);
  svg.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);

  // ── Computed Y positions ──────────────────────────────────────────
  // Dept centers: evenly spaced starting at PADDING_TOP + DEPT_H/2
  const deptCY = (i) => PADDING_TOP + i * DEPT_SPACING + DEPT_H / 2;

  // Owner centers: spread over the same vertical range as the depts
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

  const companyCY = (topCY + bottomCY) / 2;  // vertically centered over dept range

  // ── Layer 1: Company → Dept connector lines (drawn first) ─────────
  const compLineLayer = svgGroup(svg);
  depts.forEach((dept, i) => {
    svgLine(compLineLayer,
      COMPANY_X + COMPANY_W, companyCY,
      DEPT_X, deptCY(i),
      '#cfd8dc', 1.5);
  });

  // ── Layer 2: Dept → Owner bezier curves ──────────────────────────
  // Each dept draws one curve per unique owner it has tasks for.
  // Stroke width scales with task count; UNOWNED uses a dashed red line.
  const curveLayer = svgGroup(svg);

  depts.forEach((dept, i) => {
    const cy = deptCY(i);
    const x1 = DEPT_X + DEPT_W;

    // Aggregate: tasks per owner for this department
    const ownerCounts = {};
    dept.tasks.forEach(t => {
      ownerCounts[t.owner] = (ownerCounts[t.owner] || 0) + 1;
    });

    Object.entries(ownerCounts).forEach(([owner, count]) => {
      const op = ownerPos[owner];
      if (!op) return;

      const x2   = op.x - OWNER_R;
      const y2   = op.y;
      const midX = x1 + (x2 - x1) * 0.55;
      const color   = ownerColors[owner]?.hex || '#d32f2f';
      const strokeW = Math.max(1.5, Math.min(count * 0.85, 7));
      const dash    = owner === 'UNOWNED' ? '6,4' : null;

      svgPath(
        curveLayer,
        `M${x1},${cy} C${midX},${cy} ${midX},${y2} ${x2},${y2}`,
        color, strokeW, dash, 0.6
      );
    });
  });

  // ── Layer 3: Company box ──────────────────────────────────────────
  const boxLayer = svgGroup(svg);
  const compY = companyCY - COMPANY_H / 2;
  svgRect(boxLayer, COMPANY_X, compY, COMPANY_W, COMPANY_H, '#37474f', 10);
  svgText(boxLayer, COMPANY_X + COMPANY_W / 2, companyCY - 16, 'PARAGON',    '#fff', 12, 700);
  svgText(boxLayer, COMPANY_X + COMPANY_W / 2, companyCY,      'PROPERTY',   '#fff', 12, 700);
  svgText(boxLayer, COMPANY_X + COMPANY_W / 2, companyCY + 16, 'MANAGEMENT', '#fff', 10, 400);

  // ── Layer 4: Department boxes ─────────────────────────────────────
  depts.forEach((dept, i) => {
    const cy = deptCY(i);
    const bx = DEPT_X;
    const by = cy - DEPT_H / 2;

    const unownedCount = dept.tasks.filter(t => t.owner === 'UNOWNED').length;
    const boxBg = unownedCount > 0 ? '#fff5f5' : '#ffffff';

    // White box with dept-color left border
    svgRect(boxLayer, bx, by, DEPT_W, DEPT_H, boxBg, 7, dept.color, 3);

    // Department name (truncated)
    const MAX = 30;
    const label = dept.name.length > MAX ? dept.name.slice(0, MAX - 1) + '\u2026' : dept.name;
    svgText(boxLayer, bx + 14, cy - 9,  label, '#263238', 12, 700, 'start');

    // Stats: "N tasks  ·  M unowned"
    const statsLabel = `${dept.tasks.length} tasks` +
      (unownedCount > 0 ? `  \u00B7  ${unownedCount} unowned` : '');
    const statsColor = unownedCount > 0 ? '#d32f2f' : '#78909c';
    svgText(boxLayer, bx + 14, cy + 10, statsLabel, statsColor, 11, 400, 'start');
  });

  // ── Layer 5: Owner circles ────────────────────────────────────────
  uniqueOwners.forEach((owner) => {
    const { x, y } = ownerPos[owner];
    const color = ownerColors[owner]?.hex || '#d32f2f';
    svgCircle(boxLayer, x, y, OWNER_R, color, '#263238', 2);

    if (owner === 'UNOWNED') {
      svgText(boxLayer, x, y - 6,  '\u26A0',  '#fff', 14, 700);
      svgText(boxLayer, x, y + 10, 'UNOWNED', '#fff', 10, 700);
    } else {
      svgText(boxLayer, x, y + 5, owner, '#fff', 13, 700);
    }
  });

  // ── Legend (top of canvas) ────────────────────────────────────────
  svgText(svg, canvasW / 2, 22,
    'Dept \u2192 Owner connections  \u00B7  Line thickness = task count  \u00B7  Dashed red = unowned',
    '#90a4ae', 12, 400);
}

// ── Lightweight SVG helpers ───────────────────────────────────────────

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
}

function svgCircle(parent, cx, cy, r, fill, stroke, strokeW) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', cx); el.setAttribute('cy', cy);
  el.setAttribute('r', r);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeW);
  parent.appendChild(el);
}

function svgLine(parent, x1, y1, x2, y2, stroke, strokeW) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeW);
  parent.appendChild(el);
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
}

// ====================
// STRATEGIC MODELS VIEW
// ====================
function renderStrategicModels() {
  const container = document.getElementById('models-container');
  if (container.innerHTML) return; // Already rendered

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
  if (container.innerHTML) return; // Already rendered

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
// STATS CALCULATION
// ====================
function updateStats() {
  let total = 0, assigned = 0, unowned = 0;

  orgData.departments.forEach(dept => {
    dept.tasks.forEach(task => {
      total++;
      if (task.owner === 'UNOWNED') {
        unowned++;
      } else {
        assigned++;
      }
    });
  });

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-assigned').textContent = assigned;
  document.getElementById('stat-unowned').textContent = unowned;
  document.getElementById('stat-departments').textContent = orgData.departments.length;
}

// ====================
// INITIALIZATION
// ====================
document.addEventListener('DOMContentLoaded', () => {
  renderTrackingView();
  updateStats();
  populateOwnerFilter();

  // Expand all departments by default
  document.querySelectorAll('.department').forEach(dept => {
    dept.classList.add('expanded');
  });
});
