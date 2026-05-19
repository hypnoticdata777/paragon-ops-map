# Contributing to PM Ops Map

Thanks for your interest in contributing. PM Ops Map is built to be simple — the goal is to keep it that way while making it more useful for real property management companies.

## Ways to Contribute

### 1. Share Your Department Templates
If you've customized `config.json` for your company and built something useful — a new department, a better task breakdown, or a department specific to HOA or commercial PM — open a PR. Other companies benefit directly.

### 2. Report Issues
Found a bug or something that doesn't work in your browser? [Open an issue](https://github.com/hypnoticdata777/paragon-ops-map/issues) with:
- What you expected to happen
- What actually happened
- Browser and OS

### 3. Submit a Feature
Before building something large, open an issue first to discuss it. The tool is intentionally simple — features that add backend dependencies, require a login, or break the "open index.html and it works" experience won't be merged.

Features that are welcome:
- New visualization options that work with the existing SVG engine
- Better mobile UX
- Drag-and-drop reordering
- Undo/redo
- Due dates and priority levels on tasks
- Audit trail / change log

## Getting Started Locally

```bash
git clone https://github.com/hypnoticdata777/paragon-ops-map.git
cd paragon-ops-map

# Option A — no build step (quickest)
python -m http.server 8000

# then open http://localhost:8000

# Option B — dev server with live reload
npm install
npm start       # runs at localhost:8080
```

## Project Structure

```
pm-ops-map/
├── config.json         Starter departments, tasks, owners, colors, and affinities
├── index.html          Main layout, modals, navigation, and inline handlers
├── css/style.css       Application styles
├── js/
│   ├── app.js          Browser entry point and window handler registration
│   ├── state.js        Shared in-memory state and constants
│   ├── storage.js      localStorage, profile, audit, and reset helpers
│   ├── io.js           JSON/CSV export, import, clipboard sync, and undo
│   ├── launchPlan.js   Beginner setup dashboard and readiness checks
│   ├── handbook.js     Markdown handbook export
│   ├── data.js         Jest-only config.json shim
│   └── views/          Tracking, map, team, portfolio, and work order screens
```

Starter operating data lives in `config.json`. Runtime state is loaded by `app.js`, kept in `state.js`, and persisted by `storage.js`. Feature rendering lives in the relevant `js/views/` module.

## Pull Request Guidelines

- Keep PRs focused — one change per PR
- If you're editing `config.json`, make sure the data structure matches the existing schema exactly
- If you're editing an HTML-called handler, update both `index.html` and the `Object.assign(window, ...)` block in `js/app.js`
- If you're editing a view, keep changes in the relevant `js/views/` module when possible
- No new runtime dependencies — the published app should keep working as browser-native HTML, CSS, and JavaScript
- Run `npm test` before submitting — tests must pass

## Code Style

- Vanilla JS only — no frameworks, no build-time dependencies in runtime code
- 2-space indentation
- Descriptive variable names over comments
- Functions should do one thing

## License

By contributing, you agree your changes will be licensed under the [MIT License](LICENSE.txt).
