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
     suggest   THE WEEK'S PRESCRIPTION, prefilled (dimmed) in every set row,
               e.g. {weight:285, reps:4, rpe:7} — weight ALWAYS in lbs
               (storage is lbs; kg is a display toggle). The Sunday re-program
               updates these to the progressed numbers; last session's values
               show in the PREV column and fill only fields the suggest omits.
               Every lift should carry one so no field ever starts blank.
     rest      intended rest between sets, seconds. Documentation only — the
               app no longer runs a rest timer (the Garmin does the timing).
     note      coaching line shown under the exercise
     warmup    true → excluded from the working-set count on the card
   ============================================================ */
const PROGRAM = {
  block: "Zurich — build 1",
  week: 1,
  weeks: 3,
  start: "2026-08-24",
  focus: "Three weeks, full gym, Mon–Fri only. With the return to soccer deliberately slowed to Carolyn's 11-week plan, the gym carries the block: squat pattern back in, deadlift climbing, bench back on the barbell, and a three-a-week assault on the pull-up stall.",
  note: "The frame: Carolyn's 11-week return-to-soccer plan started Aug 17, so this block is her weeks 2–4 — swim/bike/strength only, with the FIRST easy run on Tue Sep 8 (week 3), after the NSAID course ends. The proper course starts Mon Aug 24: 1200 mg ibuprofen/day for 14 days (to Sep 6), always with food and plenty of water. Pain stays at a bare minimum everywhere; 90° at the ankle, heel lifts in, no jumps, no cutting, no strides — those live in her weeks 5–8.\n\nTraining is Mon–Fri; weekends are deliberately empty for family travel and long walks/hikes, which are unprogrammed and, on current evidence (25k steps + 700 ft with zero ill effect), unlimited. Three full-body lifts (Mon/Wed/Fri) and two bike days (Tue/Thu) — the spin class is a full substitute for either bike day: log it as one entry with class length and overall RPE, and drag the session to whichever day the class runs.\n\nEvery set row is prefilled with this week's prescription — do it as written and tick. The gym is metric, so every target shows kg alongside lbs; flip the kg toggle and the numbers convert in place (storage never changes meaning). Week 2 and 3 loads climb only where this week's RPEs earn it — that is what the Sunday export decides. The pull-up plan is the one deliberate experiment: three exposures a week (volume Mon, weighted Wed, easy Fri), every set short of failure — frequency is the fix for a lift stuck at 3×7 @10, not harder grinding.\n\nOn lift days (Mon/Wed/Fri) the programmed calf raise REPLACES the PT 3×15 — one or the other, never both. On Tue/Thu the PT raise runs at the day-after rule: set 3 lands at RPE 7, not 9. Log the check-in every morning, before coffee.",

  /* Unmeasured and untouched this block: no MAS work programmed (bike efforts
     run on RPE). Carries over, still assumed, for whenever running volume
     returns. */
  mas: { value: 3.9, units: "m/s", source: "assumed", date: "2026-08-10",
         basis: "4.4 m/s tested Aug 2025, discounted for detraining; still unmeasured — the bursitis keeps replacing the session that would test it" },

  /* Three identical Mon–Fri weeks; weekends are rest by design (family travel,
     long walks). The single change is week 3's Tuesday: the first easy run
     (Carolyn's week-3 milestone), with the displaced bike day sliding to
     Thursday. This array is the ONLY statement of what happens when. */
  schedule: [
    { sid:"d1",  date:"2026-08-24", w:"s-fsq"  },
    { sid:"d2",  date:"2026-08-25", w:"c-bike" },
    { sid:"d3",  date:"2026-08-26", w:"s-dl"   },
    { sid:"d4",  date:"2026-08-27", w:"c-bike2"},
    { sid:"d5",  date:"2026-08-28", w:"s-uni"  },
    { sid:"d6",  date:"2026-08-29", rest:true  },
    { sid:"d7",  date:"2026-08-30", rest:true  },
    { sid:"d8",  date:"2026-08-31", w:"s-fsq"  },
    { sid:"d9",  date:"2026-09-01", w:"c-bike" },
    { sid:"d10", date:"2026-09-02", w:"s-dl"   },
    { sid:"d11", date:"2026-09-03", w:"c-bike2"},
    { sid:"d12", date:"2026-09-04", w:"s-uni"  },
    { sid:"d13", date:"2026-09-05", rest:true  },
    { sid:"d14", date:"2026-09-06", rest:true  },
    { sid:"d15", date:"2026-09-07", w:"s-fsq"  },
    { sid:"d16", date:"2026-09-08", w:"r-easy" },
    { sid:"d17", date:"2026-09-09", w:"s-dl"   },
    { sid:"d18", date:"2026-09-10", w:"c-bike" },
    { sid:"d19", date:"2026-09-11", w:"s-uni"  },
    { sid:"d20", date:"2026-09-12", rest:true  },
    { sid:"d21", date:"2026-09-13", rest:true  }
  ],

  workouts: [
    /* ---------------------------------------------------------------- */
    {
      id: "checkin",
      name: "Morning check-in", short: "Check-in",
      accent: "#C9A227", unit: "check", cat: "check", sched: {freq:"daily"},
      sub: "Ten seconds, before you get going. Watching the left heel through the NSAID course — and especially the two mornings after it ends.",
      exercises: [
        { name:"Morning stiffness & pain", sets:1,
          fields:["duration","rpe"], labels:{duration:"MINUTES", rpe:"PAIN"},
          phs:{duration:"min", rpe:"0-10"},
          target:"Minutes of stiffness on first getting up · pain 0–10",
          note:"Minutes, not a vibe: time how long from standing up to walking normally. The PAIN number is the back of the LEFT heel — the bursitis spot. NSAID course runs Aug 24 – Sep 6 (1200 mg/day, always with food, plenty of water — Carolyn's dosing). Two rules: any morning worse than the day before → skip that day's conditioning entirely; and treat Sep 7–8 conservatively — NSAIDs can mask symptoms for a day or two after the course ends, and the first run hangs on those two mornings being genuinely clean. Full-height heel lifts stay in daily." },
        { name:"New niggles scan", sets:1,
          fields:["where","rpe"], labels:{rpe:"WORST"}, phs:{where:"body part", rpe:"0-10"},
          target:"Anything new, anywhere? 0 = nothing",
          note:"Ten seconds, head to toe: is any spot new, or behaving differently than yesterday? Name the spot in the WHERE box (this is the better way you asked for) and score it 0–10 — even a 1. Watch list from London: the right wrist (front, radial side) that spoke up on Aug 20. 0 most mornings is the expected answer; the whole value is the morning it isn't." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-fsq",
      name: "S1 · Front squat + bench",
      accent: "#C97F5B", cat: "strength",
      sub: "Monday. The squat pattern returns — front squat, heel lifts in, depth capped where the left heel stays quiet.",
      exercises: [
        { name:"Front squat", sets:4,
          target:"4 × 5 @ RPE 7 · 72.5 kg (160 lb)", rest:180, suggest:{weight:160, reps:5, rpe:7},
          note:"Heel lifts IN. Bar high on the shoulders, elbows driven up the whole set, torso as tall as the rack position demands. Brace, sit straight down between the legs — and CAP THE DEPTH: stop where the heels stay planted and the left heel stays quiet, roughly parallel with the lifts in. No bounce out of the bottom; stand up through the whole foot. (Your July numbers: 160×8, 190×3 — but the capped depth changes the lift, so 72.5 kg @ RPE 7 is an assumption for the log to correct. All sets ≤7 → 75 kg next week.)" },
        { name:"Barbell bench press", sets:4,
          target:"4 × 6 @ RPE 7 · 60 kg (132 lb)", rest:150, suggest:{weight:132, reps:6, rpe:7},
          note:"Feet planted, shoulder blades pinched and tucked, elbows ~45° — never flared to a T. Touch the chest under control, press slightly back toward the face. WRIST: bar low in the palm, knuckles to the ceiling, wrist stacked straight over the forearm — the right wrist grumbled on Aug 20 and a stacked wrist is the fix; if it talks, stop the set. (Back on the barbell now there is one: you pressed 120×10–12 in late July and 135×7 before that, so 60 kg × 6 restarts the climb with room. The app tracks this as a fresh lift, separate from DB bench.)" },
        { name:"Pull-up", sets:4, fields:["reps","rpe"],
          target:"Volume day · 4 × 5 @ RPE ≤7", rest:120, suggest:{reps:5, rpe:7},
          note:"Dead hang each rep, blades set — down and back — BEFORE the arms bend, chest to the bar, controlled negative. Every set stops with 2–3 reps in the tank. (The stall-breaker: three pull-up exposures a week — volume here, weighted Wednesday, easy Friday — roughly 2.5× your weekly volume with NO set at failure. A lift stuck at 3×7 @10 needs frequency, not grinding. If set 4 creeps past RPE 7, cut it short; sub-max is the entire mechanism.)" },
        { name:"Eccentric leg extension", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 5 each · 4 s down · ~80 kg stack (180 lb)", rest:120, suggest:{weight:180, reps:5, rpe:8},
          note:"Lift up with BOTH legs, lower on the right leg alone over a slow counted 4 seconds — the lowering is the entire exercise. Full control at the top before each descent; if the top-outer corner of the kneecap complains, shorten the range rather than dropping the weight. (180 is earned — Aug 17 felt better than week 1 at 170. New machine, though: find the setting where 5 slow lowers land at RPE 8 and log what the stack says; 180 lb ≈ 80 kg.)" },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8 each @ RPE 7–8 · 90° gate, wedge in · 75 kg (165 lb)", rest:90, suggest:{weight:165, reps:8, rpe:7},
          note:"Single leg on the leg-press sled, wedge under the forefoot. Press up smooth over ~3 seconds, lower the same — and STOP at neutral: the heel never drops past 90°. Stop the set at the first hint of the back of the left heel. REPLACES the PT 3×15 today — never both. (Held near flat on purpose — the tissue next door is the one that flared. All sets ≤7 and clean mornings → 80 kg in week 3.)" }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-dl",
      name: "S2 · Deadlift + pull",
      accent: "#B48EAD", cat: "strength",
      sub: "Wednesday. The heaviest pull of the week, plus the weighted pull-up day.",
      exercises: [
        { name:"Deadlift", sets:4,
          target:"4 × 4 @ RPE 7 · 135 kg (297 lb)", rest:180, suggest:{weight:297, reps:4, rpe:7},
          note:"Bar over mid-foot, hinge down with a long spine, lats set before the pull. Push the floor away and finish tall — no jerking off the floor, no ramming the lockout. Reset the brace every rep; every set ends with reps in the tank. (Earned jump: 285×4 came in comfortable on Aug 17, so 135 kg it is — still well under your 285×8 from July and 350×3 from May.)" },
        { name:"Chest-supported row", sets:3,
          target:"3 × 8–10 @ RPE 7 · 30 kg DBs (66 lb)", rest:90, suggest:{weight:66, reps:8, rpe:7},
          note:"Chest GLUED to the pad — if the torso heaves, the weight is doing the rowing. Pull to the lower ribs, squeeze the blades for a beat, lower slow. Never bent-over: the lumbar spine already deadlifted today. (65 went in on Aug 17; 30 kg DBs ≈ 66. Ride the rep range to 10, then load.)" },
        { name:"Pull-up (weighted)", sets:4, fields:["weight","reps","rpe"],
          target:"4 × 4 @ RPE 8 · +5 kg (+11 lb)", rest:150, suggest:{weight:11, reps:4, rpe:8},
          note:"Same strictness as bodyweight: dead hang, blades first, no kipping, controlled negative. Load is the ADDED weight — a 5 kg plate in a backpack or a DB between the feet. (Your bw 3×7 puts a 4RM around +7 kg, so +5 kg × 4 leaves margin; the history panel remembers +45 lb × 3 from 2025 — that strength is recoverable, and this day is the road back.)" },
        { name:"Overhead press", sets:3,
          target:"3 × 6–8 @ RPE 7 · 20 kg DBs (44 lb)", rest:120, suggest:{weight:44, reps:6, rpe:7},
          note:"Dumbbells, seated or standing. Ribs DOWN, glutes squeezed before the press — the low back does not arch to finish a rep; if it does, the set is over. Lockout with biceps by the ears, lower under control. WRIST: knuckles up, DB resting low in the palm — same right-wrist watch as bench. (42.5s ran @7 in London; 20 kg ≈ 44 sits right. 6s → 8s, then 22.5 kg.)" },
        { name:"Long-lever hip iso hold", sets:3, fields:["duration","rpe"],
          target:"3 × 25 s each side", rest:60, suggest:{duration:"25", rpe:7},
          note:"Leg long, knee locked, toes pulled toward you; hold the heel where the hip flexor burns but the low back stays quiet and pressed down — if the back arches, lower the leg an inch. All holds on one side before switching. (25 s now, up from 20 — isometrics progress by duration. At a comfortable 3 × 25 s the 25 lb DB on the lap returns.)" },
        { name:"Seated calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 10 @ RPE 7–8 · 90° gate · 35 kg (77 lb)", rest:90, suggest:{weight:77, reps:10, rpe:7},
          note:"Knees bent 90°, pad on the thighs, balls of the feet on the platform. Smooth 2–3 seconds up to a full squeeze, same down, STOP at neutral — the heel never drops below the platform. Stop at the first hint of the left-heel spot. REPLACES the PT 3×15 today. (70 ran clean at @7–8.5 on Aug 20 → 35 kg ≈ 77, inside the ≤10%-a-week tendon clock.)" }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-uni",
      name: "S3 · Single-leg + bench volume",
      accent: "#5B8FC9", cat: "strength",
      sub: "Friday. Single-leg strength, the bench volume slot, and the easy pull-up day.",
      exercises: [
        { name:"Deficit rear-foot-elevated split squat", sets:3,
          target:"3 × 6 each @ RPE 7 · 25 kg (55 lb)", rest:150, suggest:{weight:55, reps:6, rpe:7},
          note:"Back foot laces-down on the bench, front foot on the deficit plate, far enough forward that the shin stays near vertical. Torso tall, drop straight down between the legs, drive up through the whole front foot. Stop at the depth where the right knee starts talking. (Earned: 50×8 across on Aug 20 opens the promised 55×6 ≈ 25 kg. Build back to 8s, then 60.)" },
        { name:"DB bench press", sets:3,
          target:"3 × 8 @ RPE 7–8 · 25 kg DBs (55 lb)", rest:120, suggest:{weight:55, reps:8, rpe:7},
          note:"Flat bench, blades pinched and tucked, elbows ~45°, touch under control, press slightly back toward the face. Wrists stacked. (The 55s were Monday's prescription in London — here they are the volume slot behind the barbell day: 25 kg × 8, feeding the same press without repeating it.)" },
        { name:"Romanian deadlift", sets:3,
          target:"3 × 6 @ RPE 7 · 70 kg (154 lb)", rest:150, suggest:{weight:154, reps:6, rpe:7},
          note:"Hips back, spine long, bar dragging up the thighs, knees soft and FIXED — the hips keep travelling back, the knees don't keep bending. Stop when the hamstrings run out of range, stand up by driving the hips through. (145×8 @8 on Aug 20 → 70 kg ≈ 154 at 6s. The limiter is hamstring range, so it climbs steadily rather than leaping.)" },
        { name:"Pull-up", sets:3, fields:["reps","rpe"],
          target:"Easy day · 3 × 6 @ RPE 6–7", rest:90, suggest:{reps:6, rpe:6},
          note:"Same strict form, nothing hard about it: 3 × 6 finishing FRESH. This is practice, not work — the third weekly exposure is the dose, not the effort. If Wednesday left you sore, 3 × 4 is fine; never chase it." },
        { name:"Lateral lunge to med-ball throw", sets:3, fields:["reps","rpe"],
          target:"3 × 5 each side", rest:90, suggest:{reps:5, rpe:7},
          note:"~6 kg ball. Step wide, sit into the outside hip with the trail leg straight — load it like a spring — then drive across and throw as hard as the wall can take. Full reset between reps: five explosive singles, not a flow. (Unchanged on purpose: with cutting parked until Carolyn's week 8, this is the only frontal-plane power in the week, and power progresses by intent and crispness.)" },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8 each @ RPE 7–8 · 90° gate, wedge in · 75 kg (165 lb)", rest:90, suggest:{weight:165, reps:8, rpe:7},
          note:"Same as Monday: single leg on the sled, wedge in, ~3 s up and down, STOP at neutral, stop at the first hint of the heel spot. REPLACES the PT 3×15 today." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-bike",
      name: "C1 · Bike tempo / spin",
      accent: "#8FBF6B", unit: "drill", cat: "cardio",
      sub: "Tuesday. Engine work with zero load through the left heel — or the spin class, which counts in full.",
      exercises: [
        { name:"Easy spin", sets:1, fields:["duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"Seat high enough that the ankle stays quiet — push through the mid-foot, not the toes." },
        { name:"Bike tempo interval", sets:4, fields:["duration","rpe"],
          target:"4 × 2 min hard @ RPE 7 · 2 min easy spin between", rest:120,
          suggest:{duration:"2:00", rpe:7},
          note:"A pace you could just about hold for six minutes flat out. If rep 4 lands at RPE 8+, that is the data — do not add a fifth. THE SPIN CLASS IS A FULL SUBSTITUTE for this whole session: log it as one entry with the class length and an overall RPE, and drag this card to the class day if it differs. (4 reps this week; 5 in week 2, 6 in week 3 if the RPEs hold.)" },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy", suggest:{duration:"3:00", rpe:3} }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-bike2",
      name: "C2 · Bike 30/30s / spin",
      accent: "#C95B7F", unit: "drill", cat: "cardio",
      sub: "Thursday. The interval day — or the spin class, which counts in full. Nothing airborne, nothing that dorsiflexes the left ankle under load.",
      exercises: [
        { name:"Easy spin", sets:1, fields:["duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4} },
        { name:"Bike 30/30 — hard 30s", sets:8, fields:["duration","rpe"],
          target:"30 s hard / 30 s easy × 4 reps × 2 sets", rest:180,
          suggest:{duration:"0:30", rpe:8},
          note:"Log the hard 30s only — 8 rows, 4 per set, 3 min easy spinning between sets. A spin class replaces the whole session — one entry, class length, overall RPE. A METCON works for variety, but the constraint is absolute: nothing airborne — no jumps, no skipping, no burpees, no running — and nothing that bends the left ankle past 90° under load. (2×5 in week 2, 2×6 in week 3 if the RPEs hold.)" },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy", suggest:{duration:"3:00", rpe:3} }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "r-easy",
      name: "R1 · Easy run",
      accent: "#6FAF9F", unit: "drill", cat: "cardio",
      sub: "Carolyn's week-3 milestone: ONE easy run, Tue Sep 8 — and only if the post-NSAID mornings stay clean. Nothing fast, nothing bouncy.",
      exercises: [
        { name:"Brisk walk", sets:1, fields:["duration","rpe"],
          target:"5 min", warmup:true, suggest:{duration:"5:00", rpe:2},
          note:"Heel lifts in. This plus the primer below is the whole warm-up — the run itself is easy enough that more would be theatre." },
        { name:"Isometric calf primer", sets:2, fields:["duration","rpe"],
          target:"2 × 30 s · heel never below neutral (90° gate)", warmup:true, rest:30, suggest:{duration:"0:30", rpe:4},
          note:"Standing, bent knee, rise to the ball of the foot and hold at ~60–70%. Your own pre-play protocol, scaled to a jog." },
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"10 min easy · RPE 4 · flat, soft surface", suggest:{duration:"10:00", rpe:4},
          note:"Heel lifts IN, flat lakeside path, conversational the whole way. NO strides, no skips, no pogos, no cuts — every one of those lives in Carolyn's weeks 5–8, not here. If the heel says anything at all mid-run, walk home: pain is not productive, and nothing this run buys is worth re-provoking the bursa. The NSAID course ended Sep 6, so the two mornings after THIS run are the honest verdict — log them carefully. (Aug 13 you ran 1600 m in 10:00 at RPE 4 and felt good; that is the shape of it.)" },
        { name:"Cool-down walk", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy", suggest:{duration:"3:00", rpe:2} }
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
  { block: "London — return to soccer, part 1", start: "2026-08-12", end: "2026-08-21",
    note: "Two weeks, 8 planned sessions. Week 1 ran as written (S1, C1 return-to-run, S2, C2 change-of-direction) — then an acute LEFT retrocalcaneal bursitis flared hours after C2, and the back half was re-planned: running and jumps pulled, conditioning moved to the bike, lifting kept and progressed. Week 2 completed: S1 on Aug 17 (logged on the other device, assumed as prescribed — deadlift 285×4 comfortable, eccentric leg extension better than week 1), S2 on Aug 20 (RFESS 50×8, pull-up 3×7 @10, RDL 145×8 @8, OHP 42.5s, seated calf 70 clean), and a 45-min spin class on Aug 19 (unlogged). Carolyn's verdict (Aug 17–21): could be bursitis all along, or bursitis alongside a resolving insertional tendinopathy; NSAIDs yes, injections not yet, calf raises stay; her 11-week return-to-soccer sheet (Aug 21) governs the blocks that follow. Morning heel pain 0 from Aug 17 onward. MAS never measured — the session that would have measured it was the one the bursitis took." },
  { block: "Block 0 — baseline week", start: "2026-08-09", end: "2026-08-10",
    note: "Superseded before it ran. Three empty freeform slots, intended to capture a week of normal training before programming. Made redundant when the Hevy export (141 sessions, Jan 2025 – Jul 2026) and the 2025 ACL Rehab Online materials arrived instead." }
];
