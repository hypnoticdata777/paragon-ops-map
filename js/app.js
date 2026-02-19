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
        <span>${dept.name} (${dept.tasks.length} tasks)</span>
        <span>&#9660;</span>
      </div>
      <div class="department-body">
        ${dept.tasks.map(task => `
          <div class="task-item ${task.owner === 'UNOWNED' ? 'unowned' : ''}">
            <div class="task-name">${task.name}</div>
            <div class="task-owner ${ownerColors[task.owner]?.class || 'owner-unowned'}">
              ${task.owner}
            </div>
          </div>
        `).join('')}
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
// MAP VIEW - SVG with RED LINES
// ====================
function renderFlowMap() {
  const svg = document.getElementById('flowMap');
  const svgNS = "http://www.w3.org/2000/svg";

  svg.innerHTML = '';

  const width = 1600;
  const height = Math.max(1400, orgData.departments.length * 100 + 400);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const companyX = 60;
  const companyY = height / 2;
  const deptX = 380;
  const taskX = 820;
  const ownerX = width - 180;

  // Connection lines group
  const linesGroup = document.createElementNS(svgNS, 'g');
  svg.appendChild(linesGroup);

  // Draw company box
  drawBox(svg, companyX, companyY - 50, 240, 100, '#37474f', 'PARAGON\nPROPERTY\nMANAGEMENT', '#fff');

  // Get unique owners and position them
  const owners = {};
  const uniqueOwners = [...new Set(orgData.departments.flatMap(d => d.tasks.map(t => t.owner)))];

  uniqueOwners.forEach((owner, i) => {
    const y = 120 + (i * 90);
    owners[owner] = { x: ownerX, y };
    const color = ownerColors[owner]?.hex || '#d32f2f';
    drawCircle(svg, ownerX, y, 45, color, owner, '#fff');
  });

  // Draw departments and tasks
  orgData.departments.forEach((dept, i) => {
    const deptY = 120 + (i * 80);

    // Department box
    drawBox(svg, deptX, deptY - 35, 220, 70, dept.color, dept.name, '#fff');

    // Line from company to department
    drawLine(linesGroup, companyX + 240, companyY, deptX, deptY, false);

    // Tasks
    dept.tasks.forEach((task, j) => {
      const taskY = deptY + (j - dept.tasks.length / 2) * 38;
      const unowned = task.owner === 'UNOWNED';

      // Task box
      const taskBg = unowned ? '#ffebee' : '#f5f5f5';
      const taskBorder = unowned ? '#d32f2f' : '#90a4ae';
      drawTaskBox(svg, taskX, taskY - 14, 300, 28, taskBg, taskBorder, task.name);

      // Lines: dept to task, task to owner
      drawLine(linesGroup, deptX + 220, deptY, taskX, taskY, unowned);

      const ownerPos = owners[task.owner];
      if (ownerPos) {
        drawLine(linesGroup, taskX + 300, taskY, ownerPos.x - 45, ownerPos.y, unowned);
      }
    });
  });
}

function drawBox(parent, x, y, w, h, fill, text, textColor) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('fill', fill);
  rect.setAttribute('rx', 10);
  rect.setAttribute('stroke', '#263238');
  rect.setAttribute('stroke-width', 2);
  g.appendChild(rect);

  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x + w/2);
    t.setAttribute('y', y + h/2 + (i - lines.length/2 + 0.5) * 18);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', textColor);
    t.setAttribute('font-size', '14');
    t.setAttribute('font-weight', '700');
    t.textContent = line;
    g.appendChild(t);
  });

  parent.appendChild(g);
}

function drawTaskBox(parent, x, y, w, h, fill, border, text) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('fill', fill);
  rect.setAttribute('rx', 5);
  rect.setAttribute('stroke', border);
  rect.setAttribute('stroke-width', 2);
  g.appendChild(rect);

  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x + 10);
  t.setAttribute('y', y + h/2);
  t.setAttribute('dominant-baseline', 'middle');
  t.setAttribute('fill', '#263238');
  t.setAttribute('font-size', '11');
  t.setAttribute('font-weight', '600');
  t.textContent = text.length > 42 ? text.substring(0, 39) + '...' : text;
  g.appendChild(t);

  parent.appendChild(g);
}

function drawCircle(parent, cx, cy, r, fill, text, textColor) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx);
  circle.setAttribute('cy', cy);
  circle.setAttribute('r', r);
  circle.setAttribute('fill', fill);
  circle.setAttribute('stroke', '#263238');
  circle.setAttribute('stroke-width', 2);
  g.appendChild(circle);

  const parts = text.split(' ');
  const displayText = parts[0] + (parts[1] ? '\n' + parts[1].charAt(0) + '.' : '');
  const lines = displayText.split('\n');

  lines.forEach((line, i) => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', cx);
    t.setAttribute('y', cy + (i - lines.length/2 + 0.5) * 14);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', textColor);
    t.setAttribute('font-size', '13');
    t.setAttribute('font-weight', '700');
    t.textContent = line;
    g.appendChild(t);
  });

  parent.appendChild(g);
}

function drawLine(parent, x1, y1, x2, y2, unowned) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.classList.add('map-connection');
  if (unowned) {
    line.classList.add('unowned');
  }
  parent.appendChild(line);
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
      <p style="color: #546e7a; font-style: italic; margin-bottom: 15px;">${model.subtitle}</p>
      <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
        <strong>Best For:</strong> ${model.bestFor}
      </div>
      <h4 style="margin-bottom: 10px; color: #263238;">Team Structure:</h4>
      <ul>
        ${model.teamStructure.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 3px solid #00897b;">
          <h5 style="margin-bottom: 8px; color: #00897b;">&#10003; Pros</h5>
          <ul style="font-size: 13px;">
            ${model.pros.map(pro => `<li>${pro}</li>`).join('')}
          </ul>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 3px solid #d32f2f;">
          <h5 style="margin-bottom: 8px; color: #d32f2f;">&#9888; Cons</h5>
          <ul style="font-size: 13px;">
            ${model.cons.map(con => `<li>${con}</li>`).join('')}
          </ul>
        </div>
      </div>
      <p style="margin-top: 15px; font-size: 14px; color: #546e7a;"><strong>Example:</strong> ${model.example}</p>
    </div>
  `).join('');
}

function renderCaseStudies() {
  const container = document.getElementById('case-studies-container');
  if (container.innerHTML) return; // Already rendered

  container.innerHTML = caseStudies.map(study => `
    <div class="case-study">
      <h3>${study.title}</h3>
      <p style="color: #546e7a; font-size: 14px; margin-bottom: 15px;"><strong>Source:</strong> ${study.source}</p>
      <ul>
        ${study.findings.map(finding => `<li>${finding}</li>`).join('')}
      </ul>
      <p style="margin-top: 15px;"><a href="${study.link}" target="_blank" rel="noopener noreferrer" style="color: #1976d2; font-weight: 600;">Read Full Case Study &#8594;</a></p>
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

  // Expand all departments by default
  document.querySelectorAll('.department').forEach(dept => {
    dept.classList.add('expanded');
  });
});
