# Routines

A personal exercise-routine timer, installable as a PWA on phone / iPad / desktop.
Pick a routine, hit start, and it runs the whole circuit hands-free: a countdown
dial, spoken exercise names, transition beeps, and auto-advance between moves.

Live at: **https://ausmani23.github.io/routines/**

- To install on iPhone/iPad: open the URL in Safari → Share → **Add to Home Screen**.
- To install on desktop: open in Chrome/Edge → **Install** icon in the address bar.
- Works offline after the first load (service worker).

## Editing routines

All content lives in [`routines.js`](routines.js) — a single `ROUTINES` array,
documented at the top of that file. Edit it, bump `CACHE` in [`sw.js`](sw.js)
(e.g. `routines-v2`), commit, and push; GitHub Pages redeploys automatically and
installed apps pick up the new version on next launch.

No build step, no dependencies. See [`PROJECT.md`](PROJECT.md) for the full
architecture handoff.
