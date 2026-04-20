# Contributing to PM Ops Map

Thanks for your interest in contributing. PM Ops Map is built to be simple — the goal is to keep it that way while making it more useful for real property management companies.

## Ways to Contribute

### 1. Share Your Department Templates
If you've customized `js/data.js` for your company and built something useful — a new department, a better task breakdown, a department specific to HOA or commercial PM — open a PR. Other companies benefit directly.

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
open index.html

# Option B — dev server with live reload
npm install
npm start       # runs at localhost:8080
```

## Project Structure

```
pm-ops-map/
├── index.html          Main layout and navigation
├── css/style.css       All styles
├── js/
│   ├── data.js         All data — departments, tasks, owners, strategic content
│   └── app.js          All rendering — views, SVG map, editing, filters
```

All data lives in `data.js`. All rendering lives in `app.js`. Keep it that way.

## Pull Request Guidelines

- Keep PRs focused — one change per PR
- If you're editing `data.js`, make sure the data structure matches the existing schema exactly
- If you're editing `app.js`, test in Chrome and Firefox before submitting
- No new runtime dependencies — if it needs `npm install` to work, it won't be merged
- Run `npm test` before submitting — tests must pass

## Code Style

- Vanilla JS only — no frameworks, no build-time dependencies in runtime code
- 2-space indentation
- Descriptive variable names over comments
- Functions should do one thing

## License

By contributing, you agree your changes will be licensed under the [MIT License](LICENSE.txt).
