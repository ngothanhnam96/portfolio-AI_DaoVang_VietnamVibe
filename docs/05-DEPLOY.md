# 05 · Deploy

- **GitHub Pages:** `.github/workflows/pages.yml` runs the tests on every push to `main`, then
  publishes `index.html`, `styles.css`, `favicon.svg` and `src/`. In the repository settings,
  set Pages → Source to "GitHub Actions".
- **CI:** `.github/workflows/ci.yml` syntax-checks every file and runs the tests on Node 20,
  22 and 24.
- **Local:** `npm start` serves on http://127.0.0.1:5173 (set `PORT` to change it). ES modules
  do not load from `file://`.
- **Kiosk or booth:** open `?demo&play=halong` in full screen and the bot plays forever,
  pressing through the cards by itself.
- **Debug:** `?debug` adds `window.__dv` (`state`, `run`, `progress`, `give(n)`, `skip(s)`,
  `unlockAll()`).
