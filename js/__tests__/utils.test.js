
const utils = require('../utils.cjs');

describe('isValidISODate', () => {
  test('valid date returns true', () => {
    expect(utils.isValidISODate('2026-05-08')).toBe(true);
  });

  test('impossible date Feb 30 returns false', () => {
    expect(utils.isValidISODate('2026-02-30')).toBe(false);
  });

  test('out-of-range month 13 returns false', () => {
    expect(utils.isValidISODate('2026-13-01')).toBe(false);
  });

  test('past date with valid format returns true', () => {
    expect(utils.isValidISODate('2020-01-01')).toBe(true);
  });

  test('null input returns false', () => {
    expect(utils.isValidISODate(null)).toBe(false);
  });

  test('empty string returns false', () => {
    expect(utils.isValidISODate('')).toBe(false);
  });

  test('wrong format MM/DD/YYYY returns false', () => {
    expect(utils.isValidISODate('05/08/2026')).toBe(false);
  });

  test('partial string YYYY-MM returns false', () => {
    expect(utils.isValidISODate('2026-05')).toBe(false);
  });
});

describe('escapeHtml', () => {
  test('escapes < and > in script tag', () => {
    expect(utils.escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('escapes double quotes', () => {
    expect(utils.escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  test('escapes ampersand', () => {
    expect(utils.escapeHtml('A & B')).toBe('A &amp; B');
  });

  test('escapes > alone', () => {
    expect(utils.escapeHtml('>')).toBe('&gt;');
  });

  test('null input returns empty string', () => {
    expect(utils.escapeHtml(null)).toBe('');
  });

  test('undefined returns empty string', () => {
    expect(utils.escapeHtml(undefined)).toBe('');
  });

  test('safe text passes through unchanged', () => {
    expect(utils.escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('formatDueChip', () => {
  test('formats Dec 25 correctly', () => {
    expect(utils.formatDueChip('2026-12-25')).toBe('Dec 25');
  });

  test('formats Jan 1 correctly', () => {
    expect(utils.formatDueChip('2026-01-01')).toBe('Jan 1');
  });

  test('formats Jun 30 correctly', () => {
    expect(utils.formatDueChip('2026-06-30')).toBe('Jun 30');
  });

  test('empty string returns empty string', () => {
    expect(utils.formatDueChip('')).toBe('');
  });

  test('null returns empty string', () => {
    expect(utils.formatDueChip(null)).toBe('');
  });
});

describe('buildDeptCompletionText', () => {
  test('(0, 0) returns empty string', () => {
    expect(utils.buildDeptCompletionText(0, 0)).toBe('');
  });

  test('(3, 0) contains "3 done"', () => {
    expect(utils.buildDeptCompletionText(3, 0)).toContain('3 done');
  });

  test('(0, 2) contains "2 blocked"', () => {
    expect(utils.buildDeptCompletionText(0, 2)).toContain('2 blocked');
  });

  test('(3, 2) contains both "3 done" and "2 blocked"', () => {
    const result = utils.buildDeptCompletionText(3, 2);
    expect(result).toContain('3 done');
    expect(result).toContain('2 blocked');
  });
});

describe('getTodayISO', () => {
  test('returns a YYYY-MM-DD formatted string', () => {
    expect(utils.getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('matches today\'s local date', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm   = String(today.getMonth() + 1).padStart(2, '0');
    const dd   = String(today.getDate()).padStart(2, '0');
    const expected = `${yyyy}-${mm}-${dd}`;
    expect(utils.getTodayISO()).toBe(expected);
  });
});

describe('_slugify', () => {
  test('slugifies company name', () => {
    expect(utils._slugify('My Company Inc.')).toBe('my-company-inc');
  });

  test('replaces spaces with hyphens', () => {
    expect(utils._slugify('hello world')).toBe('hello-world');
  });

  test('empty string returns "pm-ops"', () => {
    expect(utils._slugify('')).toBe('pm-ops');
  });

  test('null returns "pm-ops"', () => {
    expect(utils._slugify(null)).toBe('pm-ops');
  });

  test('collapses double hyphens', () => {
    expect(utils._slugify('ABC--DEF')).toBe('abc-def');
  });
});

describe('jsonAttr', () => {
  test('plain string is JSON-stringified with outer quotes HTML-encoded', () => {
    // jsonAttr encodes ALL double-quotes (including surrounding ones) for safe HTML attr embedding
    expect(utils.jsonAttr('hello')).toBe('&quot;hello&quot;');
  });

  test('double quotes in value are HTML-encoded', () => {
    const result = utils.jsonAttr('say "hi"');
    expect(result).toContain('&quot;');
    expect(result).not.toContain('"');
  });
});

describe('isTaskOverdue (integration)', () => {
  test('past dueDate with todo status is overdue', () => {
    const task = { dueDate: '2020-01-01', status: 'todo' };
    expect(utils.isTaskOverdue(task)).toBe(true);
  });

  test('past dueDate with done status is NOT overdue', () => {
    const task = { dueDate: '2020-01-01', status: 'done' };
    expect(utils.isTaskOverdue(task)).toBe(false);
  });

  test('task with no dueDate is not overdue', () => {
    const task = { status: 'todo' };
    expect(utils.isTaskOverdue(task)).toBe(false);
  });

  test('future dueDate is not overdue', () => {
    const task = { dueDate: '9999-12-31', status: 'todo' };
    expect(utils.isTaskOverdue(task)).toBe(false);
  });
});
