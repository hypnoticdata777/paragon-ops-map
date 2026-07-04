const fs = require('fs');
const os = require('os');
const path = require('path');
const { WorkspaceStore, HttpError } = require('../src/store');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pm-ops-sync-test-'));
}

describe('WorkspaceStore', () => {
  test('first push claims the workspace and starts at version 1', async () => {
    const store = new WorkspaceStore(tempDir());
    const result = await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });
    expect(result.created).toBe(true);
    expect(result.version).toBe(1);
  });

  test('pull requires the correct passphrase', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });

    const pulled = await store.pull('acme-pm', 'secret1');
    expect(pulled.state).toEqual({ a: 1 });
    expect(pulled.version).toBe(1);

    await expect(store.pull('acme-pm', 'wrong')).rejects.toMatchObject({ status: 403 });
  });

  test('pull with a missing or non-string passphrase returns 400, not a crash', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });

    await expect(store.pull('acme-pm', undefined)).rejects.toMatchObject({ status: 400 });
    await expect(store.pull('acme-pm', null)).rejects.toMatchObject({ status: 400 });
    await expect(store.pull('acme-pm', 123)).rejects.toMatchObject({ status: 400 });
    await expect(store.peekVersion('acme-pm', undefined)).rejects.toMatchObject({ status: 400 });
  });

  test('pulling a workspace that does not exist returns 404', async () => {
    const store = new WorkspaceStore(tempDir());
    await expect(store.pull('nope', 'secret1')).rejects.toMatchObject({ status: 404 });
  });

  test('push with wrong passphrase on an existing workspace is rejected', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });
    await expect(
      store.push('acme-pm', { passphrase: 'wrong', state: { a: 2 }, expectedVersion: 1 })
    ).rejects.toMatchObject({ status: 403 });
  });

  test('push with a stale expectedVersion is rejected with the current state attached', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 2 }, expectedVersion: 1 });

    try {
      await store.push('acme-pm', { passphrase: 'secret1', state: { a: 'stale write' }, expectedVersion: 1 });
      throw new Error('expected push to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect(err.status).toBe(409);
      expect(err.extra.state).toEqual({ a: 2 });
      expect(err.extra.version).toBe(2);
    }
  });

  test('push with the correct expectedVersion advances the version', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });
    const result = await store.push('acme-pm', { passphrase: 'secret1', state: { a: 2 }, expectedVersion: 1 });
    expect(result.created).toBe(false);
    expect(result.version).toBe(2);

    const pulled = await store.pull('acme-pm', 'secret1');
    expect(pulled.state).toEqual({ a: 2 });
  });

  test('rejects invalid workspace names', async () => {
    const store = new WorkspaceStore(tempDir());
    await expect(
      store.push('AB', { passphrase: 'secret1', state: {}, expectedVersion: 0 })
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      store.push('has spaces', { passphrase: 'secret1', state: {}, expectedVersion: 0 })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('rejects passphrases shorter than the minimum length', async () => {
    const store = new WorkspaceStore(tempDir());
    await expect(
      store.push('acme-pm', { passphrase: 'abc', state: {}, expectedVersion: 0 })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('rejects oversized payloads', async () => {
    const store = new WorkspaceStore(tempDir());
    const bigState = { blob: 'x'.repeat(3 * 1024 * 1024) };
    await expect(
      store.push('acme-pm', { passphrase: 'secret1', state: bigState, expectedVersion: 0 })
    ).rejects.toMatchObject({ status: 413 });
  });

  test('concurrent pushes to the same workspace do not corrupt state', async () => {
    const store = new WorkspaceStore(tempDir());
    await store.push('acme-pm', { passphrase: 'secret1', state: { a: 0 }, expectedVersion: 0 });

    // Fire two writes "at once" with the same expectedVersion — only one may win.
    const results = await Promise.allSettled([
      store.push('acme-pm', { passphrase: 'secret1', state: { a: 'first' }, expectedVersion: 1 }),
      store.push('acme-pm', { passphrase: 'secret1', state: { a: 'second' }, expectedVersion: 1 }),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason.status).toBe(409);
  });
});
