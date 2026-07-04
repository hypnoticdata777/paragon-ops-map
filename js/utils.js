// Pure utility functions — no DOM side-effects, no shared state.
//
// Maintainer note:
// Browser modules import this file directly. Jest tests import utils.cjs instead
// because the test suite runs in CommonJS mode. If behavior changes here, mirror
// the same change in utils.cjs or tests and browser behavior can diverge.

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Safely embeds a JS value inside a double-quoted HTML attribute that contains
// a JS call, e.g. onclick="fn(jsonAttr(val))".
function jsonAttr(val) {
  return JSON.stringify(String(val == null ? '' : val)).replace(/"/g, '&quot;');
}

function shakeInput(el) {
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

function _isQuotaError(e) {
  return e instanceof DOMException && (
    e.code === 22 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

// Returns true only for strings that are valid YYYY-MM-DD ISO dates.
function isValidISODate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

// Returns today's date as YYYY-MM-DD using local time (no UTC drift).
function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Returns true if the task has a due date in the past and is not done.
function isTaskOverdue(task) {
  return !!(task.dueDate && isValidISODate(task.dueDate) && task.dueDate < getTodayISO() && (task.status || 'todo') !== 'done');
}

// Formats YYYY-MM-DD to "Dec 15" without toLocaleDateString for consistency.
function formatDueChip(dateStr) {
  if (!dateStr) return '';
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const month = parseInt(parts[1], 10) - 1;
  const day   = parseInt(parts[2], 10);
  if (month < 0 || month > 11 || isNaN(day)) return dateStr;
  return `${MONTHS[month]} ${day}`;
}

// Returns the inline HTML that shows done and blocked counts in the dept header.
function buildDeptCompletionText(doneCount, blockedCount) {
  const parts = [];
  if (doneCount   > 0) parts.push(`· <span class="dept-done-count">✓ ${doneCount} done</span>`);
  if (blockedCount > 0) parts.push(`· <span class="dept-blocked-count">⚠ ${blockedCount} blocked</span>`);
  return parts.join(' ');
}

function _slugify(value) {
  return String(value || 'pm-ops').replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '') || 'pm-ops';
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

function formatWODate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString('en-US',
      { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) { return ''; }
}

// Formats a number as USD, e.g. 1200 -> "$1,200.00".
function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Returns { tone, label, days } describing how close a tenant's lease end
// date is, or null if the tenant has no valid lease end date on file.
// todayISO is injectable for testing; defaults to the real current date.
function getLeaseStatus(tenant, todayISO = getTodayISO()) {
  if (!tenant || !isValidISODate(tenant.leaseEnd)) return null;
  const today = new Date(todayISO + 'T00:00:00');
  const end   = new Date(tenant.leaseEnd + 'T00:00:00');
  const days  = Math.round((end - today) / 86400000);

  if (days < 0)   return { tone: 'danger', label: 'Lease expired', days };
  if (days <= 60) return { tone: 'warn', label: days === 0 ? 'Lease ends today' : `Lease ends in ${days}d`, days };
  return { tone: 'neutral', label: `Lease ends ${formatDueChip(tenant.leaseEnd)}`, days };
}

export {
  escapeHtml,
  jsonAttr,
  shakeInput,
  _isQuotaError,
  isValidISODate,
  getTodayISO,
  isTaskOverdue,
  formatDueChip,
  buildDeptCompletionText,
  _slugify,
  _downloadBlob,
  formatWODate,
  formatCurrency,
  getLeaseStatus,
};
