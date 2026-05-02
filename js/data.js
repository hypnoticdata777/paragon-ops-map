// Jest test shim — loads the same config.json the browser fetches at runtime.
// Not referenced by index.html; the browser uses fetch('config.json') instead.
const path   = require('path');
const fs     = require('fs');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));

const orgData           = config.orgData;
const ownerColors       = config.ownerColors;
const defaultAffinities = config.defaultAffinities;

if (typeof module !== 'undefined') { module.exports = { orgData, ownerColors, defaultAffinities }; }
