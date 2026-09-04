# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal exercise-routine timer PWA (plain HTML/CSS/JS, no framework, no build
step, no dependencies), deployed to GitHub Pages at
https://adanerusmani.com/routines/. `PROJECT.md` is the full handoff document —
read it for background and open decisions.

**The address changed on 2 Sep 2026.** The owner's user site got the custom
domain adanerusmani.com, and GitHub then 301-redirects every
`ausmani23.github.io/<app>/` URL there. An app installed from the OLD address
is frozen: its service worker can't update through a redirect, and its
cache-first fetch handler discards the redirected (opaque) responses, so
nothing pushed after that date reaches it — and its localStorage is on the old
origin, unreachable from the new one. The only way out is a fresh install at
the new address, with the data carried over by hand (Copy everything from the
old app; the Notes screen's Copy/Restore backup for any future move).

## Commands

There is no build, lint, or test step. Development is: edit files, open
`index.html` (or push and check the live URL).

- **Deploy**: `git push` — GitHub Pages serves the repo root from `main`.
- **This repo is the canonical shell for four apps** (routines, tara, abba,
  amma — all on adanerusmani.com). `app.js lift.js schedule.js drag.js
  styles.css index.html sw.js manifest.json` are byte-identical across them
  apart from the title/manifest/CACHE lines; everything per-person lives in
  each app's `config.js` (name, `dbKey`, export copy, area labels, `history`,
  `textScale`). **Make shell changes here, then run
  `claude_workspace/sync-shell.sh`** (copies the shell out, restores each
  sibling's identity, bumps its CACHE; `--dry-run` to preview). Never edit a
  shell file in a sibling. Then run each sibling's harnesses:
  `claude_workspace/run-tests.sh ../tara` (also `../abba`, `../amma`).
- **When any app file changes, bump `CACHE` in `sw.js`** (`routines-v1` →
  `routines-v2`, …). Installed clients only pick up new versions when the cache
  name changes. The app then reloads itself once the new worker takes control
  (`controllerchange` in app.js) — but that reload is deliberately suppressed
  while a routine is running, so a deploy mid-workout applies on return to home.
- **If a change appears not to have shipped, suspect the cache before the code.**
  Verify what is actually being served (`curl -s <url>/app.js | grep …`) rather
  than re-pushing. A cache-first worker will happily serve a stale page from a
  correct deploy.
- Test harnesses live in `claude_workspace/tests/` (engine assertions, schedule +
  navigation, routine durations + data integrity, responsive layout) — see the
  README there; `claude_workspace/run-tests.sh` runs them all. `schedule.html`
  asserts the real `PROGRAM.schedule` is well-formed, so **run it after every
  re-program**.
- **Never use `--screenshot` at a narrow `--window-size` to check mobile
  layout.** Headless Chrome lays out at a fixed ~500px regardless, so the image
  is a crop of a wider render and looks exactly like a clipping bug. Render
  through a fixed-width iframe instead.

## Architecture

- `config.js` — the `APP` object: this copy's identity (see Commands). Loaded
  first; `app.js` reads `APP.dbKey`, the export strings and `textScale`,
  `schedule.js` merges `APP.areas` into `AREAS`.
- `routines.js` — the `ROUTINES` data array; the only file that changes for
  rehab-content edits. Schema documented in its header comment. New routines are
  appended objects; the engine needs no changes.
- `program.js` — the `PROGRAM` object: the current training block. Unlike
  `routines.js` this is **meant to churn** — rewritten every Sunday from the
  week's export, and replaced wholesale **per travel window** (an 11-day stay
  with a known gym is the planning unit; "weeks 1–8" is not). Past blocks go in
  `PROGRAM_ARCHIVE` at the bottom. See `feedback/README.md`.
- `schedule.js` — the scheduling layer: dates, the agenda for a day, completion
  lookups, and the drag overrides. Pure functions, no DOM. Loads **before**
  `app.js` and touches `db` only from inside function bodies.
- `drag.js` — moving a session to another day on Upcoming. Pointer Events, not
  HTML5 drag-and-drop, which does not fire on iOS touch at all.

### The schedule is data, not prose

`PROGRAM.schedule` is an array of `{sid, date, w}` (or `{sid, date, rest:true}`)
and is the **only** statement of what happens when — `PROGRAM.note` must not
re-enumerate the days, or the two will drift on the first re-program. Recurring
work instead carries `sched:{freq:"daily"|"onDemand"}`: that is every routine in
`routines.js` plus the morning check-in. A routine may also carry
`sched:{freq:"weekly", days:[1,3,5]}` (0 = Sunday) and be due on those weekdays
only, or `sched:{freq:"gym"}` and be due on the days the calendar has a
strength session (the pre-lift prep follows a dragged session) —
`routinesOn(k)` in schedule.js. Weekly and gym-day routines are cards on
Upcoming (they are what varies); dailies stay on the one-line summary.

`sid` is stable within a block and is what a drag override and a logged session
are keyed to, so the same workout on two different days ticks off independently.

Three areas — **mobility & pt** (every routine, plus the check-in), **strength**,
**cardio** — set by `cat` on a workout; routines are always mobility. They sort in
that order within a day, which is the order the day actually happens in.

### Three ways in, one screen each

`home` is **Today** (the day's agenda, grouped by area, finished items dimmed and
sunk to the foot of their group), `upcoming` is the day-by-day list, `browse` is
everything by area ignoring the calendar. `go()` renders the screen it switches
to, so there is nothing to keep in sync. Dragging on Upcoming writes
`db.sched[blockName][sid]` — the app has no backend and cannot edit `program.js`,
so **a move is an override, not an edit**, and "Reset to programmed" clears them.
- `lift.js` — the training engine, for lifting **and** running: set-by-set
  logging, proposed values prefilled in every field (last session's numbers,
  else the exercise's `suggest` from program.js — dimmed until typed over or
  ticked), an RPE dropdown, per-exercise notes, a per-lift history panel
  (rep records + estimated 1RM, fed by the in-app log and the Hevy import),
  ad-hoc exercise adding, the lb ⇄ kg display toggle, and the markdown export.
  There is deliberately **no rest/session timer** — he times on his Garmin;
  session length is self-reported in the field next to Finish and stored as
  `mins`. The inline history panel is a preview; **Past lifts** (`#lifts`,
  `renderLifts`/`openLifts`) is the full screen — lift picker, a hand-drawn SVG
  chart of est. 1RM or heaviest set with dated axes, every rep record, every
  session. It keeps its own Back target (`lifts.back`) because it opens from
  the mid-session lift screen as well as from Notes; `[data-back]` only knows
  the list screens. Loads **after** `app.js` and depends on `db`, `saveDB`, `go`,
  `ping`, `mmss`, `$`, `esc`, `onClick` from it.

### Weights are stored in lbs, always

`db.strength` (sets, `suggest` in program.js, the imported Hevy history) is
canonically lbs, mirroring Hevy's `weight_lbs`. The kg toggle on the lift
screen converts only what is displayed and typed (`wOut`/`wIn` in lift.js);
storage and export never change meaning. Don't add a second stored unit.

### History ships as bare numbers only

`history.js` (committed, served) is the baked-in past: `[exercise, date,
weight_lbs, reps]` rows generated by `claude_workspace/make_history.py` from
the **gitignored** sources (the Hevy CSV and the Paul Read TrueCoach log).
That is the owner's explicit privacy line (Aug 2026): bare lift numbers may
be public; **notes, RPE, body measurements and the raw source files never
are** — regenerate the file, don't widen its schema. The per-lift history
panel merges three sources: the in-app log, `HISTORY`, and
`db.strength.hist` (the Notes-screen Hevy paste-import, used for fresh
exports between regenerations; overlap is harmless because the panel is
max-per-day). Exercise names are matched by normalisation
("Deadlift (Barbell)" ≡ "Deadlift"); `make_history.py` carries an ALIAS map
for TrueCoach names.

### Sets are field-driven, not weight/reps/RPE

An exercise declares `fields` and the set row is built from it: omitted means
lifting (`weight/reps/rpe`); a run uses `["distance","duration","rpe"]`; a hold
`["duration","rpe"]`; a jump `["reps","rpe"]`. `labels` and `phs` override a
column's header and placeholder. A conditioning day is therefore an ordinary
workout with different fields — **do not add a second engine or screen for
running.**

A stored set carries only the keys its exercise declared, so the shape is a
superset (`{ex, n, weight, reps, distance, duration, rpe}`) that mirrors Hevy's
CSV columns. It is purely additive: sessions logged before distance/duration
existed still parse. Anything reading a stored set back (`fmtLoggedSet`) must
format from **which keys are present**, because the exercise definition is long
gone by then.
- `app.js` — the engine: audio (`toneAt`/`scheduleAhead`/`say`), screen-wake
  (`keepAwake`), navigation (`go`), rendering
  (`renderToday`/`renderUpcoming`/`renderBrowse`/`renderDetail`),
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
duration-check harness. A block may declare `rest` (seconds between its sets,
a real "Breathe" countdown, counted in the total).

### Buckets and stacks — the daily work in pieces, or as one run

The non-gym work is filed in **buckets**, one routine card each: hips (the
morning opener), core, mobility A/B, PT A/B, and the pre-gym prep on lift
days. They are deliberately small. When there is time for more than one, a
card is dragged by its grip onto another on Today and the two become a
**stack** — one card, one run straight through, logged as each member.
`db.stacks[YYYY-MM-DD] = [[id, …], …]` is a grouping for the day and nothing
else (`stacksOn`/`stackOnto`/`unstack`; a member that stops being due drops
out; a week is kept). A run is therefore always a **list of parts**:
`buildSeq` lays out `state.run = [{r, v, bis}]`, every step carries `rid` and
`bi`, and `finish`/`quitRoutine` record progress per part and log each
routine whose required blocks are all behind you (`partClosed`, not
`partToday()===null`, which is also true when nothing was done). A single
routine is a list of one; `state.stack` is null for it. The stack's detail
screen (`renderStackDetail`) numbers the members' steps straight through and
gives each its own variant picker. Stacking is Today-only and shares one
Pointer-Events gesture with the Upcoming drag (`drag.js`, `DRAG_MOVE` /
`DRAG_STACK`).

### Batches — "give me 10 minutes"

The time-budget chips (5/10/15/All, `pickBatch`) are **off in this app**
(`budgets:false` in config.js — he stacks whole buckets instead) and on in
the siblings. The machinery underneath stays on everywhere: a finished batch
or an early **End routine** records its blocks in
`db.part[routineId][YYYY-MM-DD] = {v, done:[…]}` — **indices into `r.blocks`**,
because names repeat within a routine. A record is *open* only while a
required block is still undone; once every required block is done the day is
logged in `db.log` as a single run would be, and the record reads as absent
(`partRecord` returns null) — so "Run again" is the whole routine, optional
tails never re-log a day, and Upcoming's totals for a finished routine don't
change. While a record is open: the card shows "N min left", the variant is
locked (`defaultVariant`), and **End routine** (`quitRoutine`, no `data-go`)
keeps the blocks already passed. Records older than a week are dropped on load.

A block may carry `paused:true` — an item Carolyn has parked (the mini-pogos,
the knee-to-wall test). `activeBlocks` never returns it, so it neither runs
nor counts; the detail screen lists it dimmed under "Paused" so the card
keeps its text. Delete the flag to resume.

### Notes and the weekly export

There is no backend, so the app cannot write into this repo. Notes and strength
logs live in `localStorage` and leave the device only through **Notes & export →
Copy everything / Download .md**, which emits one markdown document (notes,
strength sessions, routine completions — last 28 days). That export is the input
to the Sunday re-program. Don't add a "sync" feature to close this gap without
asking; the manual hand-off is the design, not an omission. The Notes screen
also has **Copy backup / Restore a backup**: the whole `db` as one JSON blob,
for moving to a new phone or a new address. Restore *merges* (`mergeDB`: what
is on the device wins, the backup fills gaps, nothing is deleted) and refuses
a backup from a sibling app (`app` = `dbKey`).

- `index.html` — nine `<section class="screen">` blocks toggled by an `.on`
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
  authoritative. Never paraphrase or "improve" them without asking. This applies
  to `routines.js`, not `program.js` — the strength block is ours to rewrite.
- **Never use `done` as a bare CSS state class.** `.done` styles the finish
  screen; when it was unscoped it also matched `.bead.done` on the run screen and
  grew the 3px progress strip to 16vh as soon as one segment completed. Those
  rules are now scoped to `#done`, and `lift.js` marks logged sets `.logged`
  rather than `.done`. There is a geometry assertion for this in `lift.html`.
- **Top-level DOM bindings must tolerate a missing element.** Use the `onClick`
  helper, not `$("#x").onclick = …`. The test harnesses mount a subset of
  `index.html`, and a `null` here throws during script evaluation, aborting the
  rest of the file — which surfaces as a baffling "cannot access X before
  initialization" from a completely unrelated line.
