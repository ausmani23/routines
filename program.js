/* ============================================================
   STRENGTH PROGRAM — the file that gets rewritten every block.

   The routines in routines.js are stable rehab content. This is the
   opposite: it is meant to churn. The loop is

     you train  →  the app logs sets/reps/weight/RPE/distance/time  →  you
     export from the Notes screen  →  Claude reads it and rewrites this file
     →  a new block whenever you land somewhere new.

   Blocks are scoped to TRAVEL WINDOWS, not to a fixed number of weeks — an
   11-day stay with a known gym is a real planning unit; "weeks 1-8" is not.

   Keep the ARCHIVE at the bottom: it is the only place past blocks survive
   once this file is overwritten.

   PROGRAM fields:
     block     name of the current block
     week      which week of the block this file programs
     weeks     how many weeks the block runs
     start     ISO date the block began (drives the week counter on home)
     focus     one line: what this block is trying to buy
     note      the block's rationale, shown on the Upcoming screen. NOT the
               day-by-day plan — that lives in `schedule` below and there is
               exactly one source of truth for it.
     mas       maximal aerobic speed, in m/s, used to compute interval
               distances. ALWAYS record `source` — "assumed" vs "tested" —
               so a guess is never later mistaken for a measurement.
     schedule  the calendar: one entry per day of the block, in date order.
                 sid   unique and stable WITHIN the block. It is what an
                       in-app drag writes its override against, and what a
                       logged session records, so the same workout on two days
                       is two independently tickable slots.
                 date  local "YYYY-MM-DD"
                 w     a workout id, or omit it and set `rest:true`
               A workout with no entry here and no `sched` (the spare session)
               is reachable from Browse but never scheduled.
     workouts  the sessions

   Workout fields:
     id        unique and STABLE — the log is keyed to it, so never rename an
               id when you change a day's contents
     name, accent, sub
     short     compact name for the daily summary line on Upcoming
     cat     which area it files under: "strength" | "cardio" | "check".
               Drives the Today/Browse grouping. Defaults to strength.
     sched     {freq:"daily"} → due every day and not part of the dated
               calendar (the morning check-in). Omit on ordinary sessions.
     unit      what one exercise is called on the card — "lift" (default),
               "drill" on conditioning days, "check" on the check-in
     freeform  true → starts empty, you add exercises as you go
     exercises the movements, in order

   Exercise fields:
     name      display name — ALSO the key history matches on across sessions,
               so "Trap-bar deadlift" and "Trap bar deadlift" are two different
               exercises as far as the PREV column is concerned. Reuse names
               deliberately: that is how a lift keeps its history when it moves
               between days.
     sets      how many rows to lay out (you can add more in-app)
     fields    which columns this exercise records. Omit for lifting
               (weight/reps/rpe). Others: ["distance","duration","rpe"] for
               runs, ["duration","rpe"] for holds, ["reps","rpe"] for jumps.
     labels    optional per-field column re-heading, e.g. {rpe:"PAIN"}
     phs       optional per-field placeholder override, e.g. {duration:"min"}
               (only shows when there is no previous value to suggest)
     target    prescription line; overrides the reps/rpe/load composition
     reps, rpe, load   used to compose `target` when `target` is absent
     suggest   starting values the app proposes in an empty set row, e.g.
               {weight:265, reps:4, rpe:7} — weight ALWAYS in lbs (storage is
               lbs; kg is a display toggle). Used only until a real logged
               session exists; after that, last time's numbers take over.
               Every lift should carry one so no field ever starts blank.
     rest      intended rest between sets, seconds. Documentation only — the
               app no longer runs a rest timer (the Garmin does the timing).
     note      coaching line shown under the exercise
     warmup    true → excluded from the working-set count on the card
   ============================================================ */
const PROGRAM = {
  block: "London — return to soccer, part 1",
  week: 1,
  weeks: 2,
  start: "2026-08-12",
  focus: "Ten days, eight sessions, one job: rebuild the running and jumping capacity that fifteen days off and a year without run training took away — without spiking the Achilles.",
  note: "On the four strength days the loaded calf raise REPLACES the PT 3×15 — do one or the other, never both. PT mini-pogos pause for the block; the jump work here covers it. Log the check-in every morning, before coffee.",

  /* Last tested Aug 2025: 1200 m in 4:26, and the Jul-Oct 2025 templates ran
     100% MAS at 130 m / 30 s → ~4.4 m/s. Discounted to 3.9 for a year without
     run training, softened by the fact he has kept playing matches. This is a
     GUESS and is marked as one. It gets replaced from the C3 data: distance
     and duration are both logged, so a 2-minute rep at the prescribed effort
     measures the real number without a test session existing. */
  mas: { value: 3.9, units: "m/s", source: "assumed", date: "2026-08-10",
         basis: "4.4 m/s tested Aug 2025, discounted for detraining" },

  /* Ten days. Strength and conditioning alternate, never back to back. This
     array is the ONLY statement of what happens when — `note` above no longer
     repeats it. Moving a day in-app writes an override against the `sid`; it
     does not edit this.

     Two constraints reshaped the original eleven-day plan. Day 1 was lost to
     jet lag on Aug 11, and Aug 21 is a train morning, so it has to stay clear.
     That leaves nine days for eight sessions — one rest day, not two. It sits
     at the midpoint, giving 4 on / 1 off / 4 on. The alternation carries the
     load here: no two strength days and no two conditioning days ever touch,
     so nothing is worked on consecutive days even across a four-day run.

     sids keep their original workouts, which is why d3 (a rest day) sits
     mid-array and d7 is gone — a sid is what a drag override and a logged
     session point at, so it follows its session rather than its position. */
  schedule: [
    { sid:"d1",  date:"2026-08-12", w:"s-post"  },
    { sid:"d2",  date:"2026-08-13", w:"c-run"   },
    { sid:"d4",  date:"2026-08-14", w:"s-uni"   },
    { sid:"d5",  date:"2026-08-15", w:"c-cod"   },
    { sid:"d3",  date:"2026-08-16", rest:true   },
    { sid:"d6",  date:"2026-08-17", w:"s-post"  },
    { sid:"d8",  date:"2026-08-18", w:"c-tempo" },
    { sid:"d9",  date:"2026-08-19", w:"s-uni"   },
    { sid:"d10", date:"2026-08-20", w:"c-grid"  },
    { sid:"d11", date:"2026-08-21", rest:true   }
  ],

  workouts: [
    /* ---------------------------------------------------------------- */
    {
      id: "checkin",
      name: "Morning check-in", short: "Check-in",
      accent: "#C9A227", unit: "check", cat: "check", sched: {freq:"daily"},
      sub: "Ten seconds, before you get going. This is what the heel-lift weaning is being steered by.",
      exercises: [
        { name:"Morning stiffness & pain", sets:1,
          fields:["duration","rpe"], labels:{duration:"MINUTES", rpe:"PAIN"},
          phs:{duration:"min", rpe:"0-10"},
          target:"Minutes of stiffness on first getting up · pain 0–10",
          note:"Minutes, not a vibe: time how long from standing up to walking normally. Stiffness — not pain — is what tracks whether a tendon is actually resolving, so it is the number that matters. Put the heel-lift height you used today in the session note. Two mornings in a row above your own baseline → back to full-height lifts and drop the next conditioning day one level." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-post",
      name: "S1 · Posterior + push",
      accent: "#C97F5B", cat: "strength",
      sub: "Deadlift day. The heaviest session of the block and the furthest from any running.",
      exercises: [
        { name:"Trap-bar jump squat", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 3 · jump fast and high", rest:120, suggest:{weight:95, reps:3, rpe:8},
          note:"Power first, while you're fresh. Start at 95 lb — you were at 117.5 a year ago, but that was mid-block. Jump fast and high; if the bar is slowing you down it's too heavy. Counts toward the ≤60 two-leg contact cap." },
        { name:"Deadlift", sets:4,
          target:"4 × 4 @ RPE 7", rest:180, suggest:{weight:275, reps:4, rpe:7},
          note:"Add only when you finish a set with 2+ reps in reserve. You pulled 285×8 @8 on 25 July, so this should feel comfortably submaximal — that is the point in week one back after fifteen days off. Posterior chain work is the best-evidenced thing you do for the back; this is the session that delivers it." },
        { name:"DB bench press", sets:4,
          target:"4 × 6–8 @ RPE 7–8", rest:120, suggest:{weight:50, reps:8, rpe:7},
          note:"Flat, dumbbells." },
        { name:"Chest-supported row", sets:3,
          target:"3 × 8–10 @ RPE 7", rest:90, suggest:{weight:60, reps:10, rpe:7},
          note:"Chest-supported or a 1-arm DB row, deliberately NOT a bent-over row: you have already loaded the lumbar spine hard today and there is no reason to do it again for a rowing stimulus. Rotate with the 1-arm version between sessions." },
        { name:"Eccentric leg extension", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 5 each · 4 s down", rest:120, suggest:{weight:170, reps:5, rpe:8},
          note:"Lower on one leg over 4 seconds, help it up with two. Go heavier than you could lift with one leg — that is the whole exercise. This is the direct quad-tendon item for the right knee; if the top-outer corner of the kneecap complains, shorten the range rather than dropping the weight." },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8 each @ RPE 8 · 90° gate, wedge in", rest:90, suggest:{weight:165, reps:8, rpe:8},
          note:"REPLACES the PT 3×15 today — do not do both. Single leg, wedge under the forefoot, no dorsiflexion past neutral. You did these on the LEG-PRESS sled on 12 Aug (165×8 @8) — the sled carries part of the load, which is why the number reads so much higher than a free-standing raise would; stick with the same machine so the history stays comparable. Carolyn's 90° rule applies here regardless of what the heel lifts in your running shoes are doing." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-uni",
      name: "S2 · Unilateral + lateral",
      accent: "#B48EAD", cat: "strength",
      sub: "Single-leg strength and the frontal plane — the stuff soccer actually asks for.",
      exercises: [
        { name:"Single-leg box jump", sets:3, fields:["reps","rpe"],
          target:"3 × 3 each · land on ONE leg", rest:120, suggest:{reps:3, rpe:7},
          note:"Paul Read's cue, and it still applies: start tall and upright before initiating, and put force into the ground quickly rather than rolling into it with your upper body. You progressed past two-footed landings a year ago, so land on one. 18 contacts a side, well inside the ≤40 single-leg cap." },
        { name:"Deficit rear-foot-elevated split squat", sets:3,
          target:"3 × 6 each @ RPE 7–8", rest:150, suggest:{weight:50, reps:6, rpe:7},
          note:"Start at 45–50 lb — you're doing flat Bulgarians at 50×8–10, and the deficit makes it harder. Stop at the depth where the right knee starts talking rather than chasing the full range." },
        { name:"Pull-up", sets:3, fields:["reps","rpe"],
          target:"3 × 5–8 @ RPE 7", rest:120, suggest:{reps:6, rpe:7},
          note:"You're at 4×6. Leave a rep or two in the tank here; this isn't the session to grind." },
        { name:"Romanian deadlift", sets:3,
          target:"3 × 6–8 @ RPE 7–8", rest:150, suggest:{weight:135, reps:8, rpe:7},
          note:"Barbell, start at 135. Hips back, spine long, stop when the hamstrings run out of range rather than when the bar reaches the floor." },
        { name:"Overhead press", sets:3,
          target:"3 × 6–8 @ RPE 7–8", rest:120, suggest:{weight:35, reps:8, rpe:7},
          note:"Dumbbells, seated or standing. Start at 35s and find the number." },
        { name:"Long-lever hip iso hold", sets:3, fields:["duration","rpe"],
          target:"3 × 15 s each side", rest:60, suggest:{duration:"15", rpe:7},
          note:"Straight from the ARO program — you were holding these with a 25 lb DB on your lap. Complete all reps on one side before switching." },
        { name:"Lateral lunge to med-ball throw", sets:3, fields:["reps","rpe"],
          target:"3 × 5 each side", rest:90, suggest:{reps:5, rpe:7},
          note:"14 lb ball, as before. Load and explode. This is the only frontal-plane power item in the block and it matters more than it looks — cutting is a lateral action and nothing else here trains it." },
        { name:"Seated calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8–12 @ RPE 8 · 90° gate", rest:90, suggest:{weight:90, reps:10, rpe:8},
          note:"REPLACES the PT 3×15 today. Bent knee, so this hits soleus where the standing version hit gastroc. Same rule: no dorsiflexion past neutral. Copenhagen is deliberately not here — Mobility Day B already gives you it roughly every other day, which is the trial dose." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-run",
      name: "C1 · Return to run",
      accent: "#8FBF6B", unit: "drill", cat: "cardio",
      sub: "Your first running in months. Grass, easy, nothing maximal — this day exists to buy surface tolerance, not fitness.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"10 min easy · RPE 4–5", suggest:{duration:"10:00", rpe:4},
          note:"FULL-height heel lifts today — this is low-load running and Pringels keeps lifts at full height through this stage. Conversational the whole way. If 10 minutes feels like nothing, that is the correct feeling; do not add more." },
        { name:"A-skips", sets:3, fields:["distance","rpe"],
          target:"3 × 20 m", rest:30, suggest:{distance:20, rpe:3}, note:"Tall posture, quick ground contact." },
        { name:"B-skips", sets:2, fields:["distance","rpe"],
          target:"2 × 20 m", rest:30, suggest:{distance:20, rpe:3}, note:"Add the reach-and-pull. Slower than it feels like it should be." },
        { name:"Forward extensive pogos", sets:3, fields:["distance","rpe"],
          target:"3 × 20 m", rest:30, suggest:{distance:20, rpe:4},
          note:"Straight out of ARO Phase 1. Jump from the whole foot, not the toes — that was your own question to Paul and the answer was yes, whole foot. Quiet landings. This is the block's spring work, which is why the PT mini-pogos are paused." },
        { name:"Strides", sets:4, fields:["distance","rpe"],
          target:"4 × 40 m @ 75%", rest:60, suggest:{distance:40, rpe:6},
          note:"Build smoothly, hold a few strides, ease down. Full walk-back between. 75% means relaxed face and hands — not a sprint." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-cod",
      name: "C2 · Change of direction",
      accent: "#6FAF9F", unit: "drill", cat: "cardio",
      sub: "First cutting since you stopped playing. Everything at 60–70% — this is a technique day wearing a conditioning day's clothes.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"8 min easy · RPE 4–5", warmup:true, suggest:{duration:"8:00", rpe:4},
          note:"Half-height heel lifts from here on — this is the moderate-load stage in Pringels' schedule. Watch tomorrow's stiffness number carefully; it is the first day of the wean that actually tests anything." },
        { name:"A-skips", sets:2, fields:["distance","rpe"], target:"2 × 20 m", warmup:true, rest:30,
          suggest:{distance:20, rpe:3} },
        { name:"Dribble technique", sets:3, fields:["distance","rpe"],
          target:"3 × 20 m", rest:30, suggest:{distance:20, rpe:4},
          note:"Short, quick, choppy steps. The foundation for everything below — you are re-teaching the feet to accept load quickly." },
        { name:"3-step decel stop", sets:3, fields:["reps","rpe"],
          target:"3 × 3 each side @ 70%", rest:60, suggest:{reps:3, rpe:6},
          note:"Accelerate, then stop in a split stance over three steps. Focus on the penultimate step — that is where the braking actually happens. 70% of max, no more. This is the single most protective drill in the block: deceleration is what tears things, not acceleration." },
        { name:"Lateral shuffle", sets:3, fields:["reps","rpe"],
          target:"3 × 5 each side", rest:60, suggest:{reps:5, rpe:5},
          note:"Dowel or hands overhead to stop the torso leaning. Stay low." },
        { name:"Zig-zag run", sets:5, fields:["reps","rpe"],
          target:"5 reps @ 70%", rest:30, suggest:{reps:1, rpe:6},
          note:"Forward and backward, rounded changes of direction — no sharp plants yet." },
        { name:"Strides", sets:6, fields:["distance","rpe"],
          target:"6 × 30 m @ 75–80%", rest:60, suggest:{distance:30, rpe:6},
          note:"Slightly quicker than C1. Still not a sprint." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-tempo",
      name: "C3 · MAS tempo intervals",
      accent: "#5B8FC9", unit: "drill", cat: "cardio",
      sub: "The session that matters most — and the one that measures your MAS without a test.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"Half-height heel lifts." },
        { name:"Forward extensive pogos", sets:2, fields:["distance","rpe"],
          target:"2 × 10 reps", warmup:true, rest:30, suggest:{rpe:4} },
        { name:"Strides", sets:3, fields:["distance","rpe"],
          target:"3 × 40 m @ 75%", warmup:true, rest:60, suggest:{distance:40, rpe:6} },
        { name:"MAS tempo interval", sets:4, fields:["distance","duration","rpe"],
          target:"4 × 2 min @ RPE 7 · 2 min walk between", rest:120,
          suggest:{distance:420, duration:"2:00", rpe:7},
          note:"Run by EFFORT, not by the distance: a pace you could just about hold for six minutes flat out. Target is roughly 420 m per rep, but that number comes from a guessed MAS of 3.9 m/s — so log what you ACTUALLY covered and the guess corrects itself. That is the whole reason we skipped the time trial. Four reps, not the five your old program used, because you're starting further back. If rep 4 lands at RPE 8+, we lower the assumption; if it's RPE 6, we raise it." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-grid",
      name: "C4 · Grids + COD",
      accent: "#C95B7F", unit: "drill", cat: "cardio",
      sub: "The hardest conditioning day, and the last before travel. Capped on purpose.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"Half-height heel lifts." },
        { name:"Strides", sets:3, fields:["distance","rpe"],
          target:"3 × 40 m @ 75%", warmup:true, rest:60, suggest:{distance:40, rpe:6} },
        { name:"MAS grid — hard 30s", sets:8, fields:["distance","duration","rpe"],
          target:"30 s hard / 30 s easy × 4 reps × 2 sets", rest:180,
          suggest:{distance:115, duration:"0:30", rpe:8},
          note:"Log the hard 30s only — 8 rows, 4 per set, 3 min between sets. Target ~115 m per hard rep and jog ~70 m in the float. Same logic as C3: distance logged is what tells us the real number." },
        { name:"10 m accel to 3-point stop", sets:4, fields:["reps","rpe"],
          target:"2 × 2 each side @ 85%", rest:90, suggest:{reps:2, rpe:8},
          note:"Accelerate hard over 10 m, then stop dead into a 3-point stance. 85%, NOT max — the ankle protocol is no longer the limiter but your tissue is: you've done no running for months and hamstrings and calves are what fail when top speed arrives unprepared. Max velocity belongs in the next block, closer to playing." },
        { name:"Wicket run", sets:4, fields:["distance","rpe"],
          target:"4 × 30 m @ 85–90%", rest:90, suggest:{distance:30, rpe:8},
          note:"The fastest thing in the block, and it stops at 90%. Tall, relaxed, quick ground contact." },
        { name:"Mirroring", sets:4, fields:["duration","rpe"],
          target:"4 × 20 s work / 40 s off", suggest:{duration:"0:20", rpe:7},
          note:"No partner in London, so shadow a cone pattern you haven't memorised, or have someone call directions. Reactive agility is the last piece and it properly belongs in the next block — this is a taste, not the dose." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "free",
      name: "Spare session",
      accent: "#7F8FA3", cat: "strength",
      sub: "Empty. For anything unplanned — a hotel session, a swap, a day the gym is shut.",
      freeform: true,
      exercises: []
    }
  ]
};

/* Past blocks, newest first. Appended when a block ends; nothing reads this at
   runtime — it is here so the history travels with the repo. */
const PROGRAM_ARCHIVE = [
  { block: "Block 0 — baseline week", start: "2026-08-09", end: "2026-08-10",
    note: "Superseded before it ran. Three empty freeform slots, intended to capture a week of normal training before programming. Made redundant when the Hevy export (141 sessions, Jan 2025 – Jul 2026) and the 2025 ACL Rehab Online materials arrived instead." }
];
