# Routines — project handoff

A personal exercise-routine timer. Pick a routine, hit start, and it runs the
whole circuit hands-free: a countdown dial, spoken exercise names, transition
beeps, and auto-advance between moves. Some exercises are timed; others are
rep-based and wait for a tap. Built to replace a stack of PDF routine cards that
were clunky to read mid-workout and required setting timers by hand.

This document is the handoff for taking it from a working single-file prototype
to something installed and used like a real app across phone, iPad, and desktop.
The current prototype is the file `routines.html` that accompanies this doc.

---

## The goal for this phase

Make it **openable and installable on any device — phone, iPad, computer — and
behave like a native app**: its own home-screen icon, full-screen (no browser
chrome), works offline, and — the sticking point — keeps timing and speaking
**through a locked screen**.

The prototype already does the timing, audio, and UI well. The gap is everything
around _deployment and platform integration_, plus one genuinely hard problem
(locked-screen background operation) that deserves an honest decision rather than
another workaround.

---

## Current state: what works

The prototype is a **single self-contained `.html` file, ~36 KB, zero
dependencies, zero build step**. Everything is inlined — no external requests at
all:

- The app icon is an inline SVG data URI.
- The web-app manifest is generated at runtime and attached via a Blob URL.
- The screen-wake fallback video (see below) is a ~2 KB base64 data URI.

Open it in any browser and it runs. That self-contained quality is worth
preserving as long as it's not in the way; it's why the thing is so portable.

**Working features:**

- Three routines defined in a single `ROUTINES` data array (see schema below):
  a real _tendon & foot_ morning routine, a _back-safe core_ routine with three
  difficulty levels, and a _hip flexor_ morning routine.
- Four screens (home, detail, run, done), shown/hidden by toggling an `.on`
  class — no router.
- **Timed segments** count down a dial and auto-advance.
- **Rep-based segments** show the target (e.g. "12–15 reps") in the dial, pulse
  amber instead of draining, and wait for the user to tap the dial (or the main
  button) to advance. A quiet elapsed counter ticks up so they can see how long a
  set took, but nothing forces them on.
- **Sides and sets** expand automatically: a `sides:2, sets:2` block becomes four
  segments (Set 1 Left, Set 1 Right, Set 2 Left, …) with the side spoken aloud.
- **Difficulty levels** (core routine): tapping Level 1/2/3 rewrites every
  exercise description to that level.
- **Audio**: transition tones and last-3-seconds countdown beeps via Web Audio;
  spoken exercise names via `speechSynthesis`. Both toggleable.
- **Wall-clock timing**: position is reconstructed from real elapsed time
  (`state.endsAt`), not by counting ticks, so backgrounding or a brief lock
  doesn't cause drift — `resync()` catches up to where it should be, correctly
  skipping any segments that elapsed while away.
- **Audio scheduled ahead**: because a run of timed segments is fully known in
  advance, all their beeps and tones are queued up front on the AudioContext
  clock (`scheduleAhead()`), so cues can still fire even if the JS timer is
  throttled in the background.
- **Screen-wake**: uses the Wake Lock API when available, with a looping hidden
  video as a fallback. The home screen reports which mechanism is actually
  active.

---

## Architecture, so you can navigate the file

It's plain HTML/CSS/JS, no framework. Roughly top to bottom:

- **`<style>`** — design tokens as CSS variables at `:root` (dark slate theme,
  a per-routine accent color, teal signal / amber warm accents). All screens and
  components styled here.
- **Markup** — four `<section class="screen">` blocks (`#home`, `#detail`,
  `#run`, `#done`), plus the hidden keep-awake `<video>`.
- **`ROUTINES`** — the data array. **This is the part you edit to change
  content.** Everything else is engine.
- **Engine**, in order: audio (`ctx`, `toneAt`, `ping`, `scheduleAhead`,
  `clearScheduled`, `say`, `unlockAudio`); screen-wake (`keepAwake`,
  `paintAwakeStatus`); navigation (`go`); home render (`renderHome`); detail
  render (`renderDetail`, `openDetail`); sequence builder (`buildSeq` — flattens
  blocks into a flat `seq` of segments); the run loop (`startRoutine`, `loadStep`,
  `advance`, `resync`, `startTick`, `finish`); and control handlers.
- **`state`** — one mutable object: `{ routine, level, seq, i, left, up,
  running, tick, wake, endsAt, startedAt }`. `seq` is the flattened segment list;
  `i` is the current segment index; `endsAt` is the wall-clock deadline for the
  current timed segment.

### Data model

Each routine:

```js
{
  id: "tendon",                 // unique
  name: "Morning — tendon & foot",
  accent: "#E5A33C",            // per-routine color
  sub: "Every morning. Non-negotiable.",
  levelNames: ["Level 1","Level 2","Level 3"],  // optional; omit for single-level
  levelTags:  ["start here","","check in"],      // optional captions
  defaultLevel: 0,
  blocks: [ /* … */ ]
}
```

Each block (one exercise; may expand into several segments):

```js
{
  group: "Step 2 — Tendon",   // optional section header shown above this block
  name: "Isometric calf holds",
  badge: "req",               // req | new | opt | rec  → renders a labeled pill
  mode: "time",               // "time" (counts down) | "reps" (waits for a tap)
  sec: 40,                    // seconds per segment (time mode)
  target: "12–15 reps",       // dial label (reps mode)
  sides: 2,                   // optional: runs Left then Right
  sets: 2,                    // optional: repeats the whole block N times
  est: 60,                    // reps mode only: rough seconds, for the home-screen duration estimate
  dose: "2–3 holds per side, 30–45 sec, bent knee",  // the prescription line
  detail: "Standing, single leg…",  // how-to shown during the move
  cue: "Manages the symptom…",       // the italic coaching note
  levels: ["…","…","…"],       // optional: per-level detail text, overrides `detail`
  tag: "2nd round"            // optional small qualifier next to the name
}
```

Adding a routine is purely a matter of appending one of these objects. No engine
changes needed for new content.

---

## Known challenges and open decisions

### 1. Locked-screen operation — the crux

This is the feature that motivated turning the PDFs into an app, and it's the one
the web platform fights hardest.

- **Wake Lock only works over `https://` (a "secure context").** Opened as a
  local `file://`, the browser silently refuses it — which is almost certainly
  why the prototype seemed not to work when opened directly from Files. Hosting it
  fixes wake lock, and keeping the screen _on_ is the reliable path.
- **True background operation (screen actually locked, timer still running and
  speaking) is not reliably achievable as a pure web app on iOS.** Backgrounded
  web pages get throttled/suspended; sustained background audio needs entitlements
  only native apps receive. The scheduled-audio trick papers over short locks but
  should not be trusted for a full routine with the phone pocketed.

**Decision to make:** is "screen stays on, unlocked, for the duration" acceptable
(then a hosted PWA is enough), or is "pocket the phone, screen locked, audio
coaches you through" a hard requirement (then you need a native shell — see
Capacitor below)? For a ~5–13 min routine done at home, keeping the screen awake
is usually fine and far less work. Worth confirming before investing in native.

### 2. Not yet hosted / installable

To behave like an app it needs to live at an https URL with a proper external
`manifest.json`, real icon files (PNG at 192/512 + maskable + Apple touch), and a
**service worker** for offline use. The runtime-injected manifest in the
prototype is a stopgap that works for a quick "Add to Home Screen" but isn't the
right long-term setup. Once hosted with a service worker, "Add to Home Screen" on
iOS/iPadOS and "Install" on desktop/Android give a real full-screen, offline,
icon-launched app on all three device types from one codebase.

### 3. No persistence

The prototype holds everything in memory, so the chosen difficulty level resets
each launch and there's no history. This was a deliberate constraint of the
prototype's original sandbox — **that constraint is gone in a normal hosted app,
so `localStorage` (or IndexedDB) is now fair game** and is the obvious fix for
remembering the last level, and for any streak/history features.

### 4. Content is hardcoded

Routines live in the `ROUTINES` array. Fine for now, but an in-app editor (add /
reorder / tweak exercises without touching code) would make it self-sufficient.
This pairs naturally with persistence.

### 5. Cross-device "sameness"

The routines are baked into the code, so they're already identical on every
device with no sync needed. Only _per-device state_ (level, history) would differ.
True cross-device sync of user edits would need a backend — probably overkill;
worth resisting unless there's a clear need.

---

## Suggested roadmap

Roughly in order of value-to-effort. None of this requires abandoning the
single-file simplicity until the last step.

1. **Host it and make it a real PWA.** Put it on Vercel / Netlify / GitHub Pages
   (or Cloudflare Pages). Add a `manifest.json` and a service worker (Workbox or a
   hand-rolled cache-first worker — the app is tiny and fully static, so offline
   caching is trivial). Generate proper icon assets. This alone delivers the
   install-on-any-device, full-screen, offline experience and fixes wake lock.
   _Biggest single step._
2. **Add persistence.** `localStorage` for last-selected level per routine, sound/
   voice preferences, and optionally a simple completion log ("last done", streak).
3. **Decide the locked-screen question** (see Challenge 1). If screen-awake is
   acceptable, you're essentially done after steps 1–2. If not, proceed to 5.
4. **Optional: in-app routine editor.** Let routines be created/edited in the UI
   and stored locally, instead of editing the data array by hand.
5. **Optional / only if true background is required: wrap in Capacitor.** This
   packages the exact same web codebase into native iOS/Android shells and unlocks
   real background timers and audio (via a background-mode or local-notifications
   plugin), plus App Store / TestFlight distribution. Most effort; only worth it if
   the pocketed-phone-locked-screen requirement is firm.

### If you split the single file (recommended once you're building for real)

A minimal, still-buildless structure that most static hosts serve directly:

```
/routines
  index.html
  styles.css
  app.js            // the engine
  routines.js       // the ROUTINES data — the file you'll edit most
  manifest.json
  sw.js             // service worker
  /icons            // 192, 512, maskable, apple-touch
```

Keeping `routines.js` as a separate data module is the main win — content edits
stay far away from engine logic. A build step (Vite, etc.) is genuinely optional
here; the app has no dependencies and the browser can load these as-is.

---

## Things to preserve / gotchas

- **Wall-clock timing is load-bearing** — don't refactor `resync()` back into a
  naive per-tick decrement; that reintroduces background drift. Segment position
  should always be derived from `Date.now()` vs `state.endsAt`.
- **Audio must be unlocked by a user gesture.** `unlockAudio()` runs on the first
  Start tap; iOS won't produce sound otherwise. Keep any new audio behind that.
- **`speechSynthesis` voices load asynchronously** and vary by platform; the
  current code tolerates missing voices. Don't assume a specific voice exists.
- **The tendon routine's real duration (~23 min) exceeds the "12–13 min" note on
  the original card.** The discrepancy is real, not a bug: the full prescription
  (2 min/leg foam rolling + 2×2 banded/calf-raise blocks at slow tempo) simply
  adds up to more. The owner should confirm what actually gets trimmed on a normal
  morning so the data reflects reality; the "~12–13 min" label was removed from
  the app rather than display a number that doesn't hold.
- **Content accuracy matters more than usual here** — this is rehab/exercise
  guidance for the owner's own body. Exercise text, doses, and especially the
  "skip on a RED morning" / "non-negotiable" cues were transcribed from the
  owner's real cards and should be treated as authoritative; don't paraphrase or
  "improve" them without asking.
- The **Achilles** content in earlier drafts was a placeholder and has been
  replaced by the real tendon routine; there's no remaining stub to clean up.
