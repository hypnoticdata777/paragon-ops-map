// CommonJS mirror for Jest tests. Keep behavior in sync with utils.js.

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function isValidISODate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isTaskOverdue(task) {
  return !!(task.dueDate && isValidISODate(task.dueDate) && task.dueDate < getTodayISO() && (task.status || 'todo') !== 'done');
}

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

function buildDeptCompletionText(doneCount, blockedCount) {
  const parts = [];
  if (doneCount   > 0) parts.push(`Â· <span class="dept-done-count">âœ“ ${doneCount} done</span>`);
  if (blockedCount > 0) parts.push(`Â· <span class="dept-blocked-count">âš  ${blockedCount} blocked</span>`);
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

module.exports = {
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
};
