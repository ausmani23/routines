# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal exercise-routine timer PWA (plain HTML/CSS/JS, no framework, no build
step, no dependencies), deployed to GitHub Pages at
https://ausmani23.github.io/routines/. `PROJECT.md` is the full handoff document —
read it for background and open decisions.

## Commands

There is no build, lint, or test step. Development is: edit files, open
`index.html` (or push and check the live URL).

- **Deploy**: `git push` — GitHub Pages serves the repo root from `main`.
- **When any app file changes, bump `CACHE` in `sw.js`** (`routines-v1` →
  `routines-v2`, …). Installed clients only pick up new versions when the cache
  name changes. The app then reloads itself once the new worker takes control
  (`controllerchange` in app.js) — but that reload is deliberately suppressed
  while a routine is running, so a deploy mid-workout applies on return to home.
- **If a change appears not to have shipped, suspect the cache before the code.**
  Verify what is actually being served (`curl -s <url>/app.js | grep …`) rather
  than re-pushing. A cache-first worker will happily serve a stale page from a
  correct deploy.
- Test harnesses live in `claude_workspace/tests/` (engine assertions, routine
  durations + data integrity, responsive layout) — see the README there.
- **Never use `--screenshot` at a narrow `--window-size` to check mobile
  layout.** Headless Chrome lays out at a fixed ~500px regardless, so the image
  is a crop of a wider render and looks exactly like a clipping bug. Render
  through a fixed-width iframe instead.

## Architecture

- `routines.js` — the `ROUTINES` data array; the only file that changes for
  content edits. Schema documented in its header comment. New routines are
  appended objects; the engine needs no changes.
- `app.js` — the engine: audio (`toneAt`/`scheduleAhead`/`say`), screen-wake
  (`keepAwake`), navigation (`go`), rendering (`renderHome`/`renderDetail`),
  sequence builder (`buildSeq` flattens blocks × sides × sets into `state.seq`),
  run loop (`loadStep`/`advance`/`resync`), and localStorage persistence (`db`:
  sound/voice prefs, per-exercise levels, variant state, completion log).

### Progression is per exercise, not per routine

`db.exLevels[routineId][blockName]` holds one level per exercise, keyed by
block **name** — so repeated blocks (`Dead bug` / `Dead bug · 2nd round`) share
a level, which is what the card prescribes ("level up one exercise at a time,
never the whole circuit"). `exLevel()` falls back to the legacy routine-wide
`db.levels[id]` so existing installs migrate silently. Don't reintroduce a
routine-wide level selector.

### A/B routines

A routine with `variants:[...]` filters its blocks through `activeBlocks()`:
a block with no `variant` field runs in **every** variant (that is how daily
non-negotiables carry across A and B days); `variant:n` restricts it to one.
`variantMode:"alternate"` makes the app default to whichever variant was *not*
completed last (`db.variantDone`), so A/B rotates on its own.

### Session budget

Sessions target ≤10 min. `routineSeconds()` counts only required blocks;
`optionalSeconds()` counts `badge:"opt"` ones, shown separately as "+N min opt".
When adding content, check the totals — `claude_workspace/` has the
duration-check harness.
- `index.html` — four `<section class="screen">` blocks toggled by an `.on`
  class; no router.
- `sw.js` — cache-first service worker with background refresh.
- Screen state lives in one mutable `state` object; persistent state in one
  localStorage key `routines.v1`.

## Load-bearing invariants (do not refactor away)

- **Wall-clock timing**: segment position is always derived from `Date.now()`
  vs `state.endsAt` in `resync()` — never a per-tick decrement. This is what
  makes backgrounding/lock not drift.
- **Audio scheduled ahead**: cues for a run of timed segments are queued on the
  AudioContext clock (`scheduleAhead`) so they fire even when JS is throttled.
- **Audio unlock**: all sound must stay behind the first-tap `unlockAudio()`;
  iOS produces no audio otherwise.
- **Content is rehab guidance transcribed from the owner's real cards** —
  exercise text, doses, and cues (e.g. "skip on a RED morning") are
  authoritative. Never paraphrase or "improve" them without asking.
