const path = require('path');
const { createApp } = require('./src/app');

const PORT = Number(process.env.PORT) || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const app = createApp({ dataDir: DATA_DIR, allowedOrigins: ALLOWED_ORIGINS });

app.listen(PORT, () => {
  console.log(`PM Ops Map sync server listening on port ${PORT}`);
  console.log(`Workspace data directory: ${DATA_DIR}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
