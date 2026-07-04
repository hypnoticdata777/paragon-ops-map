// Express app factory — kept separate from index.js so tests can build an app
// instance against a temp data directory without binding a real port.
const express = require('express');
const cors = require('cors');
const { WorkspaceStore, HttpError } = require('./store');
const { createRateLimiter } = require('./rateLimit');

function createApp({ dataDir, allowedOrigins = ['*'] }) {
  const store = new WorkspaceStore(dataDir);
  const app = express();

  app.use(express.json({ limit: '3mb' }));
  app.use(cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  }));
  app.use(createRateLimiter({ windowMs: 60_000, max: 60 }));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.post('/api/workspaces/:slug/pull', async (req, res) => {
    try {
      const result = await store.pull(req.params.slug, req.body?.passphrase);
      res.json(result);
    } catch (err) {
      sendError(res, err);
    }
  });

  app.post('/api/workspaces/:slug/version', async (req, res) => {
    try {
      const result = await store.peekVersion(req.params.slug, req.body?.passphrase);
      res.json(result);
    } catch (err) {
      sendError(res, err);
    }
  });

  app.post('/api/workspaces/:slug/push', async (req, res) => {
    try {
      const { passphrase, state, expectedVersion } = req.body || {};
      const result = await store.push(req.params.slug, { passphrase, state, expectedVersion });
      res.json(result);
    } catch (err) {
      sendError(res, err);
    }
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

  // Catches express.json()'s body-too-large / malformed-JSON errors so the
  // API always responds with JSON instead of Express's default HTML page.
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large.' });
      return;
    }
    if (err) {
      res.status(400).json({ error: 'Malformed request body.' });
      return;
    }
    next();
  });

  return app;
}

function sendError(res, err) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.extra ? { current: err.extra } : {}) });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
}

module.exports = { createApp };
