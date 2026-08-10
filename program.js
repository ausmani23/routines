/* ============================================================
   STRENGTH PROGRAM — the file that gets rewritten every Sunday.

   The routines in routines.js are stable rehab content. This is the
   opposite: it is meant to churn. The weekly loop is

     you lift  →  the app logs sets/reps/weight/RPE  →  Sunday you export
     →  Claude reads the export and rewrites this file for the coming week
     →  every 6–8 weeks the whole block gets replanned around your life.

   Keep the ARCHIVE at the bottom: it is the only place past blocks survive
   once this file is overwritten, and it is what makes "what did we do last
   time we were in a hotel for two weeks" answerable.

   PROGRAM fields:
     block     name of the current training block
     week      which week of the block this file is programming
     weeks     how many weeks the block runs
     start     ISO date the block began (drives the week counter on home)
     focus     one line: what this block is trying to buy
     note      anything the app should show you before you start
     workouts  the sessions, in the order they should be done

   Workout fields:
     id        unique, stable — the log is keyed to it, so don't rename
               an id when you change the contents of a day
     name      display name
     accent    card colour
     sub       one line shown on the card and at the top of the session
     freeform  true → starts empty, you add exercises as you go
     exercises the movements, in order

   Exercise fields:
     name      display name — also the key the log matches on across weeks,
               so "Trap-bar deadlift" and "Trap bar deadlift" are two
               different exercises as far as the history is concerned
     sets      how many sets are laid out to start (you can add more in-app)
     reps      target rep range, free text, e.g. "5" or "8–10"
     rpe       target RPE, free text, e.g. "7" or "7–8"
     rest      seconds of rest to count down after each set
     load      optional starting-load hint
     note      optional coaching line, shown under the exercise
     warmup    true → sets are excluded from the working-set count
   ============================================================ */
const PROGRAM = {
  block: "Block 0 — baseline week",
  week: 1,
  weeks: 1,
  start: "2026-08-09",
  focus: "Nothing is programmed yet. This week is for capturing what you actually do so the first real block is built on your numbers instead of my guesses.",
  note: "Use the free session and log your normal HEVY workout into it — same exercises, same order, same weights. On Sunday, export from the Notes screen and hand it over with your recent HEVY history; that becomes Block 1.",
  workouts: [
    {
      id: "free-a",
      name: "Free session A",
      accent: "#C97F5B",
      sub: "Empty by design. Add each exercise as you get to it and log the sets.",
      freeform: true,
      exercises: []
    },
    {
      id: "free-b",
      name: "Free session B",
      accent: "#8FA9C9",
      sub: "The second slot, so an upper/lower or push/pull split keeps its own history.",
      freeform: true,
      exercises: []
    },
    {
      id: "free-c",
      name: "Free session C",
      accent: "#9BC98F",
      sub: "Spare slot — a third training day, or a travel/hotel session.",
      freeform: true,
      exercises: []
    }
  ]
};

/* Past blocks, newest first. Appended when a block ends; nothing reads this
   at runtime — it is here so the history travels with the repo. */
const PROGRAM_ARCHIVE = [];
