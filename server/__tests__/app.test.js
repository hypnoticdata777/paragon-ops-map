const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../src/app');

function buildApp() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-ops-sync-app-test-'));
  return createApp({ dataDir, allowedOrigins: ['*'] });
}

describe('sync server HTTP API', () => {
  test('GET /health', async () => {
    const app = buildApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('push then pull round-trips the same state', async () => {
    const app = buildApp();
    const push = await request(app)
      .post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { company: 'Acme' }, expectedVersion: 0 });
    expect(push.status).toBe(200);
    expect(push.body.version).toBe(1);

    const pull = await request(app)
      .post('/api/workspaces/acme-pm/pull')
      .send({ passphrase: 'secret1' });
    expect(pull.status).toBe(200);
    expect(pull.body.state).toEqual({ company: 'Acme' });
    expect(pull.body.version).toBe(1);
  });

  test('pull with wrong passphrase returns 403', async () => {
    const app = buildApp();
    await request(app).post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });

    const res = await request(app).post('/api/workspaces/acme-pm/pull').send({ passphrase: 'nope' });
    expect(res.status).toBe(403);
  });

  test('pull of a workspace that was never created returns 404', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/workspaces/never-created/pull').send({ passphrase: 'x' });
    expect(res.status).toBe(404);
  });

  test('stale push returns 409 with the current server state attached', async () => {
    const app = buildApp();
    await request(app).post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { a: 1 }, expectedVersion: 0 });
    await request(app).post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { a: 2 }, expectedVersion: 1 });

    const res = await request(app).post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { a: 'stale' }, expectedVersion: 1 });
    expect(res.status).toBe(409);
    expect(res.body.current.state).toEqual({ a: 2 });
    expect(res.body.current.version).toBe(2);
  });

  test('version endpoint returns version without the full state payload', async () => {
    const app = buildApp();
    await request(app).post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { big: 'x'.repeat(1000) }, expectedVersion: 0 });

    const res = await request(app).post('/api/workspaces/acme-pm/version').send({ passphrase: 'secret1' });
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(1);
    expect(res.body.state).toBeUndefined();
  });

  test('oversized payload is rejected with 413', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/workspaces/acme-pm/push')
      .send({ passphrase: 'secret1', state: { blob: 'x'.repeat(3 * 1024 * 1024) }, expectedVersion: 0 });
    expect([413, 400]).toContain(res.status);
  });

  test('unknown routes return 404', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/nonsense');
    expect(res.status).toBe(404);
  });
});
