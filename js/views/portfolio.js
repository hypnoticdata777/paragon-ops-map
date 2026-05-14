import { portfolio, setPortfolio, workOrders } from '../state.js';
import { savePortfolio, saveWorkOrders, logAudit, _showActionToast } from '../storage.js';
import { escapeHtml, shakeInput } from '../utils.js';
import { renderLaunchPlan } from '../launchPlan.js';

function totalUnits() {
  return portfolio.properties.reduce((sum, property) => sum + Number(property.units || 0), 0);
}

function propertyOptions() {
  return [
    '<option value="">Select property</option>',
    ...portfolio.properties.map(property => (
      `<option value="${escapeHtml(property.id)}">${escapeHtml(property.name)}</option>`
    ))
  ].join('');
}

function propertyName(propertyId) {
  return portfolio.properties.find(property => property.id === propertyId)?.name || 'Unassigned property';
}

export function renderPortfolioView() {
  const inner = document.getElementById('portfolio-view-inner');
  if (!inner) return;

  inner.innerHTML = `
    <div class="portfolio-shell">
      <div class="portfolio-header">
        <div>
          <div class="portfolio-kicker">Portfolio Starter</div>
          <h2>Properties, units, owners, tenants, and vendors.</h2>
          <p>Keep the beginner registry simple: what you manage, who lives there, who owns it, and who you call when something breaks.</p>
        </div>
        <div class="portfolio-summary">
          <div><strong>${portfolio.properties.length}</strong><span>properties</span></div>
          <div><strong>${totalUnits()}</strong><span>units</span></div>
          <div><strong>${portfolio.tenants.length}</strong><span>tenants</span></div>
          <div><strong>${portfolio.vendors.length}</strong><span>vendors</span></div>
        </div>
      </div>

      ${renderStarterExampleStrip()}

      <div class="portfolio-grid">
        <section class="portfolio-panel">
          <div class="portfolio-panel-head">
            <div>
              <h3>Add Property</h3>
              <p>Track the minimum context needed to run early operations.</p>
            </div>
          </div>
          <div class="portfolio-form-grid">
            <label>
              <span>Property name</span>
              <input id="property-name" class="portfolio-input" type="text" placeholder="e.g. Oak Street Duplex" maxlength="80">
            </label>
            <label>
              <span>Units</span>
              <input id="property-units" class="portfolio-input" type="number" min="0" step="1" placeholder="2">
            </label>
            <label>
              <span>Owner / client</span>
              <input id="property-owner" class="portfolio-input" type="text" placeholder="e.g. Rivera Family LLC" maxlength="80">
            </label>
            <label>
              <span>Notes</span>
              <input id="property-notes" class="portfolio-input" type="text" placeholder="Gate code, special terms, risk notes..." maxlength="140">
            </label>
          </div>
          <button class="btn btn-primary portfolio-submit" onclick="commitAddProperty()">Add Property</button>
        </section>

        <section class="portfolio-panel">
          <div class="portfolio-panel-head">
            <div>
              <h3>Add Tenant</h3>
              <p>Know who is connected to each unit before requests and renewals arrive.</p>
            </div>
          </div>
          <div class="portfolio-form-grid">
            <label>
              <span>Tenant name</span>
              <input id="tenant-name" class="portfolio-input" type="text" placeholder="e.g. Maya Chen" maxlength="80">
            </label>
            <label>
              <span>Property</span>
              <select id="tenant-property" class="portfolio-input">
                ${propertyOptions()}
              </select>
            </label>
            <label>
              <span>Unit</span>
              <input id="tenant-unit" class="portfolio-input" type="text" placeholder="2B" maxlength="30">
            </label>
            <label>
              <span>Status</span>
              <select id="tenant-status" class="portfolio-input">
                <option value="active">Active</option>
                <option value="applicant">Applicant</option>
                <option value="notice">On notice</option>
                <option value="past">Past tenant</option>
              </select>
            </label>
            <label>
              <span>Phone</span>
              <input id="tenant-phone" class="portfolio-input" type="tel" placeholder="(555) 000-0000" maxlength="40">
            </label>
            <label>
              <span>Email</span>
              <input id="tenant-email" class="portfolio-input" type="email" placeholder="tenant@example.com" maxlength="90">
            </label>
          </div>
          <button class="btn btn-primary portfolio-submit" onclick="commitAddTenant()">Add Tenant</button>
        </section>

        <section class="portfolio-panel">
          <div class="portfolio-panel-head">
            <div>
              <h3>Add Vendor</h3>
              <p>Build the emergency bench before the first urgent repair.</p>
            </div>
          </div>
          <div class="portfolio-form-grid">
            <label>
              <span>Vendor name</span>
              <input id="vendor-name" class="portfolio-input" type="text" placeholder="e.g. Ace Plumbing" maxlength="80">
            </label>
            <label>
              <span>Trade</span>
              <input id="vendor-trade" class="portfolio-input" type="text" placeholder="Plumbing" maxlength="60">
            </label>
            <label>
              <span>Phone</span>
              <input id="vendor-phone" class="portfolio-input" type="tel" placeholder="(555) 000-0000" maxlength="40">
            </label>
            <label>
              <span>Email</span>
              <input id="vendor-email" class="portfolio-input" type="email" placeholder="dispatch@example.com" maxlength="90">
            </label>
          </div>
          <button class="btn btn-primary portfolio-submit" onclick="commitAddVendor()">Add Vendor</button>
        </section>
      </div>

      <div class="portfolio-lists">
        <section class="portfolio-list-panel">
          <div class="portfolio-list-head">
            <h3>Managed Properties</h3>
            <span>${portfolio.properties.length} total</span>
          </div>
          ${portfolio.properties.length
            ? `<div class="portfolio-list">${portfolio.properties.map(renderPropertyCard).join('')}</div>`
            : '<div class="portfolio-empty">Add the first property so the launch dashboard knows what this company manages.</div>'
          }
        </section>

        <section class="portfolio-list-panel">
          <div class="portfolio-list-head">
            <h3>Tenant Roster</h3>
            <span>${portfolio.tenants.length} total</span>
          </div>
          ${portfolio.tenants.length
            ? `<div class="portfolio-list">${portfolio.tenants.map(renderTenantCard).join('')}</div>`
            : '<div class="portfolio-empty">Add the first tenant so maintenance and communication have real unit context.</div>'
          }
        </section>

        <section class="portfolio-list-panel">
          <div class="portfolio-list-head">
            <h3>Vendor Bench</h3>
            <span>${portfolio.vendors.length} total</span>
          </div>
          ${portfolio.vendors.length
            ? `<div class="portfolio-list">${portfolio.vendors.map(renderVendorCard).join('')}</div>`
            : '<div class="portfolio-empty">Add at least one vendor for plumbing, HVAC, electrical, or general maintenance.</div>'
          }
        </section>
      </div>
    </div>
  `;

  [
    'property-name', 'property-units', 'property-owner', 'property-notes',
    'tenant-name', 'tenant-property', 'tenant-unit', 'tenant-status', 'tenant-phone', 'tenant-email',
    'vendor-name', 'vendor-trade', 'vendor-phone', 'vendor-email'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onkeydown = e => {
      if (e.key === 'Enter') {
        if (id.startsWith('property')) commitAddProperty();
        else if (id.startsWith('tenant')) commitAddTenant();
        else commitAddVendor();
      }
    };
  });
}

export function addStarterExample() {
  const hasExistingData = portfolio.properties.length || portfolio.tenants.length || portfolio.vendors.length || workOrders.length;
  if (hasExistingData && !confirm('Add one editable starter example to your current setup?\n\nThis creates a property, tenant, vendor, and work order you can change or delete.')) {
    return;
  }

  const stamp = Date.now();
  const propertyId = `property-example-${stamp}`;
  const property = {
    id: propertyId,
    name: 'Oak Street Duplex',
    units: 2,
    owner: 'Rivera Family LLC',
    notes: 'Lockbox on side gate. Owner prefers text before non-urgent repairs.',
    createdAt: new Date().toISOString(),
  };
  const tenant = {
    id: `tenant-example-${stamp}`,
    name: 'Maya Chen',
    propertyId,
    unit: '2B',
    status: 'active',
    phone: '(555) 010-2040',
    email: 'maya.chen@example.com',
    createdAt: new Date().toISOString(),
  };
  const vendor = {
    id: `vendor-example-${stamp}`,
    name: 'Ace Plumbing',
    trade: 'Plumbing',
    phone: '(555) 010-1188',
    email: 'dispatch@aceplumbing.example',
    createdAt: new Date().toISOString(),
  };
  const workOrder = {
    id: `wo-example-${stamp}`,
    property: property.name,
    unit: tenant.unit,
    tenant: tenant.name,
    title: 'Kitchen sink leak',
    notes: 'Tenant reports slow drip under sink. Confirm access window before dispatch.',
    priority: 'high',
    status: 'submitted',
    assignee: 'UNASSIGNED',
    vendor: vendor.name,
    dueDate: null,
    cost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setPortfolio({
    properties: [property, ...portfolio.properties],
    tenants: [tenant, ...portfolio.tenants],
    vendors: [vendor, ...portfolio.vendors],
  });
  workOrders.unshift(workOrder);
  savePortfolio();
  saveWorkOrders();
  logAudit('starter_example_added', { title: property.name });
  renderPortfolioView();
  renderLaunchPlan();

  const workOrderBeacon = document.getElementById('wo-tab-beacon');
  if (workOrderBeacon) workOrderBeacon.hidden = false;
  _showActionToast('Starter example added', 'save-toast--success');
}

export function commitAddProperty() {
  const nameEl = document.getElementById('property-name');
  const name = nameEl?.value.trim();
  if (!name) {
    shakeInput(nameEl);
    nameEl?.focus();
    return;
  }
  const rawUnits = parseInt(document.getElementById('property-units')?.value, 10);
  portfolio.properties.unshift({
    id: `property-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    units: Number.isFinite(rawUnits) && rawUnits >= 0 ? rawUnits : 0,
    owner: document.getElementById('property-owner')?.value.trim() || '',
    notes: document.getElementById('property-notes')?.value.trim() || '',
    createdAt: new Date().toISOString(),
  });
  savePortfolio();
  logAudit('portfolio_property_added', { title: name });
  renderPortfolioView();
  renderLaunchPlan();
}

export function commitAddTenant() {
  const nameEl = document.getElementById('tenant-name');
  const name = nameEl?.value.trim();
  if (!name) {
    shakeInput(nameEl);
    nameEl?.focus();
    return;
  }
  portfolio.tenants.unshift({
    id: `tenant-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    propertyId: document.getElementById('tenant-property')?.value || '',
    unit: document.getElementById('tenant-unit')?.value.trim() || '',
    status: document.getElementById('tenant-status')?.value || 'active',
    phone: document.getElementById('tenant-phone')?.value.trim() || '',
    email: document.getElementById('tenant-email')?.value.trim() || '',
    createdAt: new Date().toISOString(),
  });
  savePortfolio();
  logAudit('portfolio_tenant_added', { title: name });
  renderPortfolioView();
  renderLaunchPlan();
}

export function commitAddVendor() {
  const nameEl = document.getElementById('vendor-name');
  const name = nameEl?.value.trim();
  if (!name) {
    shakeInput(nameEl);
    nameEl?.focus();
    return;
  }
  portfolio.vendors.unshift({
    id: `vendor-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    trade: document.getElementById('vendor-trade')?.value.trim() || '',
    phone: document.getElementById('vendor-phone')?.value.trim() || '',
    email: document.getElementById('vendor-email')?.value.trim() || '',
    createdAt: new Date().toISOString(),
  });
  savePortfolio();
  logAudit('portfolio_vendor_added', { title: name });
  renderPortfolioView();
  renderLaunchPlan();
}

export function deleteProperty(id) {
  const property = portfolio.properties.find(p => p.id === id);
  if (!property) return;
  if (!confirm(`Delete property?\n\n${property.name}`)) return;
  setPortfolio({
    ...portfolio,
    properties: portfolio.properties.filter(p => p.id !== id),
  });
  savePortfolio();
  logAudit('portfolio_property_deleted', { title: property.name });
  renderPortfolioView();
  renderLaunchPlan();
}

export function deleteTenant(id) {
  const tenant = portfolio.tenants.find(t => t.id === id);
  if (!tenant) return;
  if (!confirm(`Delete tenant?\n\n${tenant.name}`)) return;
  setPortfolio({
    ...portfolio,
    tenants: portfolio.tenants.filter(t => t.id !== id),
  });
  savePortfolio();
  logAudit('portfolio_tenant_deleted', { title: tenant.name });
  renderPortfolioView();
  renderLaunchPlan();
}

export function deleteVendor(id) {
  const vendor = portfolio.vendors.find(v => v.id === id);
  if (!vendor) return;
  if (!confirm(`Delete vendor?\n\n${vendor.name}`)) return;
  setPortfolio({
    ...portfolio,
    vendors: portfolio.vendors.filter(v => v.id !== id),
  });
  savePortfolio();
  logAudit('portfolio_vendor_deleted', { title: vendor.name });
  renderPortfolioView();
  renderLaunchPlan();
}

function renderPropertyCard(property) {
  return `
    <article class="portfolio-card">
      <div>
        <strong>${escapeHtml(property.name)}</strong>
        <span>${Number(property.units || 0)} unit${Number(property.units || 0) === 1 ? '' : 's'}${property.owner ? ` / ${escapeHtml(property.owner)}` : ''}</span>
        ${property.notes ? `<small>${escapeHtml(property.notes)}</small>` : ''}
      </div>
      <button class="portfolio-delete-btn" onclick="deleteProperty('${property.id}')" aria-label="Delete ${escapeHtml(property.name)}">Delete</button>
    </article>
  `;
}

function renderVendorCard(vendor) {
  const contact = [vendor.phone, vendor.email].filter(Boolean).join(' / ');
  return `
    <article class="portfolio-card">
      <div>
        <strong>${escapeHtml(vendor.name)}</strong>
        <span>${escapeHtml(vendor.trade || 'General vendor')}</span>
        ${contact ? `<small>${escapeHtml(contact)}</small>` : ''}
      </div>
      <button class="portfolio-delete-btn" onclick="deleteVendor('${vendor.id}')" aria-label="Delete ${escapeHtml(vendor.name)}">Delete</button>
    </article>
  `;
}

function renderTenantCard(tenant) {
  const contact = [tenant.phone, tenant.email].filter(Boolean).join(' / ');
  const unitLabel = tenant.unit ? `Unit ${tenant.unit}` : 'No unit recorded';
  return `
    <article class="portfolio-card">
      <div>
        <strong>${escapeHtml(tenant.name)}</strong>
        <span>${escapeHtml(propertyName(tenant.propertyId))} / ${escapeHtml(unitLabel)} / ${escapeHtml(tenant.status || 'active')}</span>
        ${contact ? `<small>${escapeHtml(contact)}</small>` : ''}
      </div>
      <button class="portfolio-delete-btn" onclick="deleteTenant('${tenant.id}')" aria-label="Delete ${escapeHtml(tenant.name)}">Delete</button>
    </article>
  `;
}

function renderStarterExampleStrip() {
  const setupIncomplete = !portfolio.properties.length || !portfolio.tenants.length || !portfolio.vendors.length || !workOrders.length;
  if (!setupIncomplete) return '';

  return `
    <section class="portfolio-example-strip">
      <div>
        <strong>Want a realistic starter setup?</strong>
        <span>Add an editable duplex, tenant, plumbing vendor, and first repair request to see how the pieces connect.</span>
      </div>
      <button class="btn btn-secondary" onclick="addStarterExample()">Add Starter Example</button>
    </section>
  `;
}
