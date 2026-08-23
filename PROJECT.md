# Routines — project handoff

A personal rehab + training PWA, live at **https://ausmani23.github.io/routines/**
(GitHub Pages, repo root, `main`). Plain HTML/CSS/JS — no framework, no build
step, no dependencies. It began as a hands-free timer for PT routine cards; it
is now also the owner's complete training system: Claude programs his strength
and conditioning in `program.js`, the app logs every set, and a weekly export
closes the loop.

This doc is the orientation layer. `CLAUDE.md` carries the working rules and
load-bearing invariants; `feedback/README.md` documents the weekly loop;
`claude_workspace/INJURY_CONTEXT.md` holds the standing clinical constraints;
the dated `claude_workspace/session_*.md` files are the change history.
A sibling app for his wife lives at ausmani23.github.io/tara (separate repo).

---

## The two halves

**1. The routine timer** (`routines.js` + the run engine in `app.js`) — the
original app. Daily PT/mobility circuits run hands-free: countdown dial, spoken
names, beeps scheduled ahead on the AudioContext clock, wall-clock resync so
locking the phone doesn't drift. Content is transcribed from the owner's real
PT cards and is **authoritative** — annotate, never paraphrase. Progression is
per-exercise (`db.exLevels`), A/B variants alternate automatically.

**2. The training system** (`program.js` + `schedule.js` + `lift.js`) — the
part that churns. `PROGRAM` is the current block: a dated schedule (`sid`-keyed
slots), workouts whose exercises carry the week's prescription in `suggest`
(prefilled dimmed in every set row), form-first coaching notes, and a
field-driven set schema (`weight/reps/rpe` by default; runs, holds, jumps and
the check-in declare their own fields — including free-text `where` for the
morning niggles scan). One markdown export (Notes screen) feeds the Sunday
re-program. Lifting history: baked `history.js` (bare numbers only — the repo
is public) + the in-app log + Hevy paste-import, merged by normalised name.

## The operating loop

- **Every Sunday**: he exports; Claude walks strength RPEs, the cardio log,
  the check-in trend, AND the routines.js cards (annotations, not rewrites),
  then rewrites `program.js` with progressed prescriptions. Flat numbers are
  the one unacceptable outcome; deliberate holds must be named.
- **Every travel window**: a new block, scoped to the stay, archived into
  `PROGRAM_ARCHIVE` when done. No max-test sessions ever — assumed values,
  corrected by logged RPE/distance/duration.
- **Deploy**: `git push`, and **bump `CACHE` in `sw.js`** or installed clients
  keep the old version. If a change "didn't ship", curl the live file before
  re-pushing.
- **Tests**: `claude_workspace/tests/` — engine, lift (150 asserts), schedule
  (run after every re-program), durations, overflow. Headless Chrome, commands
  in its README.

## Where the body is (late Aug 2026)

Left-heel story: years of insertional Achilles work, largely settled by heavy
slow resistance — then an acute **retrocalcaneal bursitis** flare (Aug 15,
after a cutting session). Now governed by PT Carolyn Harper's **11-week
return-to-soccer sheet** (week 1 = Aug 17–23): swim/bike/lift first, easy
running from wk 3, pogos wk 5, intervals wk 6, skills wk 7, agility wk 8,
strides wk 9, sprints wk 10, an old-man-pace game wk 11. Rules that outrank
everything: pain is not productive; 90° at the ankle, heel wedges; full-height
heel lifts daily. Also on file: a structural lower back (two ruptured discs,
managed for years via posterior-chain strength and anti-extension core).

**The horizon: January 2027** — he moves to Australia and wants to join a
league / pick-up games. The sheet nominally finishes ~early Nov, so there are
~8 weeks of slack; no step ever needs to be rushed, and no block may jump the
sheet's queue (the Aug 15 flare came from exactly that).

Block map: **Zurich, Aug 24 – Sep 13** = her wks 2–4 (current: 3 full-body
lifts M/W/F, bike/spin Tu/Th, weekends free, first run Sep 8) → **Sri Lanka,
~Sep 14 – Oct 11, full gym** = her wks 5–8 (impact returns: pogos + gym jumps,
then gentle intervals, skills, first 60% agility; strength eases toward
maintenance as impact spends the leg budget) → Oct–Dec = wks 9–11 + repeats +
match fitness → January comeback. Gym goal order, standing: injury prevention →
deadlift/squat → bench → pull-ups (currently a 3×/week frequency experiment).

## Architecture in one breath

`index.html` (eight `.screen` sections, no router) + `styles.css` + `sw.js`
(cache-first, background refresh) + `routines.js` (stable PT data) +
`program.js` (churning block) + `history.js` (generated bare numbers) +
`schedule.js` (pure date/agenda functions, loads before app.js) + `app.js`
(engine: audio, wake, navigation, rendering, run loop, `db` persistence in one
localStorage key `routines.v1`) + `lift.js` (set logging, suggests, kg⇄lb
display over canonical-lbs storage, per-lift history panel, backdating via the
"Log it for" field, past-sessions viewer, markdown export) + `drag.js`
(pointer-events session moves on Upcoming — overrides, not edits).

## Open decisions / known gaps

- **Two-device logging**: he uses iPhone + iPad; localStorage doesn't sync, so
  an export can miss sessions finished on the other device (it happened —
  Aug 17). Mitigations shipped: past-sessions viewer, backdated entry. A tiny
  Worker+KV sync backend has been sketched twice and declined twice; one-device
  -or-export remains the design. Revisit only if he asks again.
- **Un-pausing checklist** for when impact/COD clears: grep `routines.js` for
  "Aug 2026" — mini-pogos, knee-to-wall, band-work caveats, calf caps; jumps
  return to the strength days; heel-lift wean needs Carolyn's input first.
- **MAS is still an assumed 3.9 m/s** — the first real interval week (Sri
  Lanka wk 6 on the sheet) measures it via logged distance+duration, never a
  time trial.
- **Mobility A/B and PT days run over the 10.5-min budget** (pre-existing; a
  trim conversation is pending). A post-run stretch routine is promised for
  when running actually returns.
- **Locked-screen playback** stays out of scope: wake-lock-plus-screen-on is
  the accepted answer; no native wrapper.

## Things to preserve (see CLAUDE.md for the full list)

Wall-clock timing (`resync()`), ahead-scheduled audio, the first-tap audio
unlock, lbs-canonical storage, the public-repo privacy line (bare numbers only
in `history.js`; exports and body notes stay gitignored), `suggest` = the
week's prescription (prescription beats history), form-first exercise notes,
no in-app timers (the Garmin times; `mins` is self-reported), and `onClick`
guards on every top-level DOM binding so the test harnesses can mount subsets.
