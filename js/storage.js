// localStorage persistence, toast notifications, and company profile helpers.
import {
  orgData, teamData, setTeamData, workOrders, setWorkOrders,
  auditLog, setAuditLog, ownerColors, defaultAffinities, AUDIT_LABELS,
} from './state.js';
import { _isQuotaError, _slugify } from './utils.js';

// ── Storage keys ──────────────────────────────────────────────────────────────
export const STORAGE_KEY     = 'pm-ops-data-v1';
export const COMPANY_KEY     = 'pm-ops-company-name';
export const OPS_PROFILE_KEY = 'pm-ops-profile-v1';
export const NAV_COMPACT_KEY = 'pm-ops-nav-compact';
export const TEAM_KEY        = 'pm-ops-team-v1';
export const WORKORDERS_KEY  = 'pm-ops-workorders-v1';
export const AUDIT_KEY       = 'pm-ops-audit-v1';
export const GUIDE_KEY       = 'pm-ops-guide-dismissed';
export const NOTIF_DATE_KEY  = 'pm-ops-notif-date';

// ── Toast notifications ───────────────────────────────────────────────────────
let _toastTimer = null;

export function showSaveToast(isError = false, isQuota = false) {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  clearTimeout(_toastTimer);

  toast.textContent = isQuota
    ? '⚠ Storage full — export your data now!'
    : isError ? '⚠ Save failed' : '✓ Saved';
  toast.className = 'save-toast' + (isError ? ' save-toast--error' : '');

  void toast.offsetWidth; // force reflow so re-triggering the animation works
  toast.classList.add('visible');

  _toastTimer = setTimeout(() => toast.classList.remove('visible'), isQuota ? 6000 : 2000);
}

export function _showActionToast(msg, cls, duration = 3000) {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  clearTimeout(_toastTimer);
  toast.textContent = msg;
  toast.className = 'save-toast ' + cls;
  void toast.offsetWidth;
  toast.classList.add('visible');
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

// ── Task data persistence ─────────────────────────────────────────────────────
export function saveToStorage() {
  try {
    const payload = orgData.departments.map(dept => ({
      id: dept.id,
      tasks: dept.tasks.map(t => ({
        _configName: t._configName || t.name,
        name:        t.name,
        owner:       t.owner,
        status:      t.status   || 'todo',
        priority:    t.priority || 'medium',
        dueDate:     t.dueDate  || null,
        blockedBy:   t.blockedBy || null
      }))
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showSaveToast();
  } catch (e) {
    showSaveToast(true, _isQuotaError(e));
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    saved.forEach(savedDept => {
      const dept = orgData.departments.find(d => d.id === savedDept.id);
      if (!dept) return;
      savedDept.tasks.forEach((savedTask) => {
        const key  = savedTask._configName || savedTask.name;
        const task = dept.tasks.find(t => t._configName === key);
        if (!task) return;
        task.name  = savedTask.name;
        task.owner = savedTask.owner;
        if (savedTask.status)   task.status   = savedTask.status;
        if (savedTask.priority) task.priority = savedTask.priority;
        if (savedTask.dueDate !== undefined) task.dueDate = savedTask.dueDate;
        if (savedTask.blockedBy !== undefined) task.blockedBy = savedTask.blockedBy || null;
      });
    });
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function resetStorage() {
  if (!confirm('Reset all task names and owner assignments to defaults?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ── Team data persistence ─────────────────────────────────────────────────────
export function seedDefaultTeam() {
  teamData.employees = Object.entries(ownerColors)
    .filter(([name]) => name !== 'UNOWNED')
    .map(([name, info]) => ({
      name,
      hex: info.hex,
      affinities: defaultAffinities[name] ? [...defaultAffinities[name]] : []
    }));
}

export function saveTeamData() {
  try {
    localStorage.setItem(TEAM_KEY, JSON.stringify(teamData));
  } catch (e) {
    if (_isQuotaError(e)) showSaveToast(true, true);
  }
}

export function loadTeamData() {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) {
      seedDefaultTeam();
      saveTeamData();
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.employees)) {
      setTeamData(parsed);
    } else {
      seedDefaultTeam();
    }
  } catch (e) {
    seedDefaultTeam();
  }
}

// ── Work order persistence ────────────────────────────────────────────────────
export function saveWorkOrders() {
  try {
    localStorage.setItem(WORKORDERS_KEY, JSON.stringify(workOrders));
  } catch (e) {
    if (_isQuotaError(e)) showSaveToast(true, true);
  }
}

export function loadWorkOrders() {
  try {
    const raw = localStorage.getItem(WORKORDERS_KEY);
    if (raw) setWorkOrders(JSON.parse(raw) || []);
  } catch (e) {
    setWorkOrders([]);
  }
}

// ── Audit log persistence ─────────────────────────────────────────────────────
export function loadAuditLog() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) setAuditLog(JSON.parse(raw) || []);
  } catch (_) {
    setAuditLog([]);
  }
}

export function saveAuditLog() {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLog));
  } catch (_) { /* silent fail */ }
}

export function logAudit(action, details = {}) {
  auditLog.unshift({ ts: new Date().toISOString(), action, ...details });
  if (auditLog.length > 500) auditLog.length = 500;
  saveAuditLog();
}

// ── Company profile helpers ───────────────────────────────────────────────────
export function getCompanyName() {
  return localStorage.getItem(COMPANY_KEY) || 'Your Company';
}

export function getOpsProfile() {
  try {
    return JSON.parse(localStorage.getItem(OPS_PROFILE_KEY)) || {};
  } catch (_) {
    return {};
  }
}

export function applyCompanyName(name) {
  const heading = document.getElementById('company-heading');
  if (heading) heading.textContent = name.toUpperCase();
}

export function applyOpsProfile(profile = getOpsProfile()) {
  document.body.dataset.opsFocus      = profile.focus         || 'stability';
  document.body.dataset.portfolioSize = profile.portfolioSize || 'mid';
}

export function applyNavCompactState() {
  const isCompact = localStorage.getItem(NAV_COMPACT_KEY) === 'true';
  const nav = document.getElementById('nav-tabs');
  const btn = document.getElementById('nav-toggle-btn');
  if (nav) nav.classList.toggle('nav-tabs--compact', isCompact);
  if (btn) {
    btn.textContent = isCompact ? 'Show nav' : 'Hide nav';
    btn.setAttribute('aria-pressed', String(isCompact));
  }
}

export function toggleNavCompact() {
  const next = localStorage.getItem(NAV_COMPACT_KEY) !== 'true';
  try { localStorage.setItem(NAV_COMPACT_KEY, String(next)); } catch (_) {}
  applyNavCompactState();
}

export function _fileSlug() {
  return _slugify(getCompanyName());
}
