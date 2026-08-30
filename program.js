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
  week: 2,
  weeks: 3,
  start: "2026-08-24",
  focus: "Three weeks, full gym, Mon–Fri only. With the return to soccer deliberately slowed to Carolyn's 11-week plan, the gym carries the block: squat pattern back in, deadlift climbing, bench back on the barbell, and a three-a-week assault on the pull-up stall.",
  note: "The frame: Carolyn's 11-week return-to-soccer plan started Aug 17, so this block is her weeks 2–4 — swim/bike/strength only, with the FIRST easy run on Tue Sep 8 (week 3), after the NSAID course ends. The proper course starts Mon Aug 24: 1200 mg ibuprofen/day for 14 days (to Sep 6), always with food and plenty of water. Pain stays at a bare minimum everywhere; 90° at the ankle, heel lifts in, no jumps, no cutting, no strides — those live in her weeks 5–8.\n\nTraining is Mon–Fri; weekends are deliberately empty for family travel and long walks/hikes, which are unprogrammed and, on current evidence (25k steps + 700 ft with zero ill effect), unlimited. Three full-body lifts (Mon/Wed/Fri) and two bike days (Tue/Thu) — the spin class is a full substitute for either bike day: log it as one entry with class length and overall RPE, and drag the session to whichever day the class runs.\n\nEvery set row is prefilled with this week's prescription — do it as written and tick. The gym is metric; flip the kg toggle and the numbers convert in place (storage never changes meaning). Two week-2 changes you asked for. WARM-UPS: each big lift's note now spells out its ramp — add rows to log the warm-up sets or just do them, either is fine. RPE: the flat 7s were not an accident — RPE 7 is 3 reps in reserve, the deliberate ceiling for a return block where the tendon budget matters more than any one lift — but from this week it is structured rather than uniform: back-off sets @7, ONE designated top set @8, small accessories may sit @8, and nothing is programmed at 9+. A 9 in the log is information, not the plan. Week 2 loads are the ones week 1's RPEs earned: front squat, bench, deadlift, RDL and bike volume climb; rows, presses and pull-ups hold while reps or quality catch up. The pull-up experiment continues: three exposures (volume Mon — now 5×5, weighted Wed, easy Fri), every set short of failure.\n\nOn lift days (Mon/Wed/Fri) the programmed calf raise REPLACES the PT 3×15 — which now lives inside Mobility A/B, not on a separate PT card — one or the other, never both. On Tue/Thu the mobility-routine raise runs at the day-after rule: set 3 lands at RPE 7, not 9. Log the check-in every morning, before coffee.",

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
          note:"Ten seconds, head to toe: is any spot new, or behaving differently than yesterday? Name the spot in the WHERE box and score it 0–10 — even a 1. Current watch list: the RIGHT HIP (woke on the front squat Aug 24 — an old issue; it decides that lift's future, see S1), the intercostal (leg-extension tweak Aug 25, back to 0 by Aug 27), upper back/neck (Aug 28, back to 0 next day), and the right wrist (quiet since Aug 21). 0 most mornings is the expected answer; the whole value is the morning it isn't." }
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
          target:"4 × 5 · 3 @ RPE 7, last @8 · 77.5 kg (171 lb)", rest:180, suggest:{weight:171, reps:5, rpe:7},
          note:"Heel lifts IN. Bar high on the shoulders, elbows driven up the whole set, torso tall. Brace, sit straight down — depth still capped where the heels stay planted and the left heel stays quiet. WARM-UP: bar×10, 50 kg×5, 67.5×3, then the four working sets — first three @7, the last allowed to touch 8. (Earned: 75 kg ran 7,7,8 last Monday. THE RIGHT HIP is the open question — you chose to push: fine while it stays ≤3/10 during the set and is gone by next morning; two noisy sessions in a row and we swap the pattern. Log what it says in the exercise note.)" },
        { name:"Barbell bench press", sets:4,
          target:"4 × 6 · 3 @ RPE 7, last @8 · 62.5 kg (138 lb)", rest:150, suggest:{weight:138, reps:6, rpe:7},
          note:"Feet planted, shoulder blades pinched and tucked, elbows ~45° — never flared to a T. Touch the chest under control, press slightly back toward the face. WRIST: bar low in the palm, knuckles to the ceiling, wrist stacked straight over the forearm. WARM-UP: bar×10, 40 kg×6, 52.5×3. (Earned: 60 kg went 7,7,7,8 — all four sets had room, so 62.5. First three @7, last @8; 4×6 clean → 65 in week 3.)" },
        { name:"Pull-up", sets:5, fields:["reps","rpe"],
          target:"Volume day · 5 × 5 @ RPE ≤7.5", rest:120, suggest:{reps:5, rpe:7},
          note:"Dead hang each rep, blades set — down and back — BEFORE the arms bend, chest to the bar, controlled negative. Every set stops with 2–3 reps in the tank. (Week 1's 4×5 never left 7.5, so the progression is a FIFTH set, not harder sets — volume climbs, intensity doesn't. If set 5 creeps past 7.5, cut it short; sub-max is the entire mechanism of the stall-breaker.)" },
        { name:"Eccentric leg extension", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 5 each · 4 s down · 60 kg stack (132 lb)", rest:120, suggest:{weight:132, reps:5, rpe:8},
          note:"Lift up with BOTH legs, lower on the right leg alone over a slow counted 4 seconds — the lowering is the entire exercise. Full control at the top before each descent; if the top-outer corner of the kneecap complains, shorten the range rather than dropping the weight. SET-UP: settle into the pad and pin the stack BEFORE you brace and lift — the Aug 25 intercostal tweak came from wrestling into position, not from the lowering. (60 kg is this Technogym's number — the 70 opener @10 was the old machine's scale, and 60 landed @8–8.5. Hold it; 3×5 all @8 → 65 in week 3.)" },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8 each @ RPE 7–8 · 90° gate, wedge in · 80 kg (176 lb)", rest:90, suggest:{weight:176, reps:8, rpe:7},
          note:"Single leg on the sled, wedge under the forefoot. Press up smooth over ~3 seconds, lower the same — and STOP at neutral: the heel never drops past 90°. Stop the set at the first hint of the back of the left heel. REPLACES the mobility-routine 3×15 today — never both. (80 kg matched Friday's clean 3×8 @7–8; the machines here move in 10 kg steps, so reps — not load — are the lever between them. If Monday's station runs heavier than Friday's, drop to where 8 land @7–8 and log what it says.)" }
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
          target:"4 × 4 · 3 @ RPE 7, last @8 · 140 kg (309 lb)", rest:180, suggest:{weight:309, reps:4, rpe:7},
          note:"Bar over mid-foot, hinge down with a long spine, lats set before the pull. Push the floor away and finish tall — no jerking off the floor, no ramming the lockout. Reset the brace every rep. WARM-UP (you did this ramp naturally last week — now it's written down): 60 kg×8, 100×5, 125×2. (Earned: 134 kg ran @7 across all four sets, so 140 — first three @7, last allowed @8. Still far under the 285×8 / 350×3 bank.)" },
        { name:"Chest-supported row", sets:3,
          target:"3 × 9 @ RPE ≤8.5 · 30 kg DBs (66 lb)", rest:90, suggest:{weight:66, reps:9, rpe:8},
          note:"Chest GLUED to the pad — if the torso heaves, the weight is doing the rowing. Pull to the lower ribs, squeeze the blades for a beat, lower slow. Never bent-over: the lumbar spine already deadlifted today. (Riding the range: 8s came in @8–9 last week, so hold the 30s and add the rep. 3×10 clean → 32.5s.)" },
        { name:"Pull-up (weighted)", sets:4, fields:["weight","reps","rpe"],
          target:"4 × 4 @ RPE ≤8.5 · +5 kg (+11 lb)", rest:150, suggest:{weight:11, reps:4, rpe:8},
          note:"Same strictness as bodyweight: dead hang, blades first, no kipping, controlled negative. Load is the ADDED weight — a 5 kg plate in a backpack or a DB between the feet. (Hold +5 kg: last week set 4 dropped to 3 reps at your own sensible cap. The win this week is completing all four sets of 4 under 8.5 — THEN the load moves. You managed it exactly right.)" },
        { name:"Overhead press", sets:3,
          target:"3 × 7 · last @8 · 20 kg DBs (44 lb)", rest:120, suggest:{weight:44, reps:7, rpe:7},
          note:"Dumbbells, seated or standing. Ribs DOWN, glutes squeezed before the press — the low back does not arch to finish a rep; if it does, the set is over. Lockout with biceps by the ears, lower under control. WRIST: knuckles up, DB resting low in the palm. (Riding the range: 6,6,8 last week with the 8-rep set @9 — so 3×7, last set @8, nothing at 9. 3×8 all ≤8 unlocks the 22.5s.)" },
        { name:"Long-lever hip iso hold", sets:3, fields:["duration","rpe"],
          target:"3 × 25 s each side · all ≤8", rest:60, suggest:{duration:"25", rpe:7},
          note:"Leg long, knee locked, toes pulled toward you; hold the heel where the hip flexor burns but the low back stays quiet and pressed down — if the back arches, lower the leg an inch. All holds on one side before switching. (HOLD at 25 s: set 3 hit 8.5 last week, and 'comfortable' is the gate — all three holds ≤8 is what brings the 25 lb DB back, not the calendar.)" },
        { name:"Seated calf raise (DB)", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 12 each @ RPE 7–8 · 90° gate · 30 kg DB on ONE knee · 3s up / 1s hold / 3s down", rest:90, suggest:{weight:66, reps:12, rpe:7},
          note:"Its own lift now, as you asked — because it IS a different lift: the machine loads you from the stretched bottom position through a lever, while a DB starts at the 90° gate (the bursitis-safe range anyway) and only weighs what it weighs. That is why 30 kg felt easy. So the levers are tempo and one knee at a time: DB balanced on the thigh, ball of that foot on a plate or step, 3 s up, 1 s full squeeze, 3 s down, STOP at neutral. Stop at the first hint of the left-heel spot. REPLACES the mobility-routine 3×15 today. (If a real seated-calf machine turns up, the old lift resumes under its old name and history.)" }
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
          target:"3 × 7 each @ RPE 7–8 · 26 kg (57 lb)", rest:150, suggest:{weight:57, reps:7, rpe:7},
          note:"Back foot laces-down on the bench, front foot on the deficit plate, far enough forward that the shin stays near vertical. Torso tall, drop straight down between the legs, drive up through the whole front foot. Stop at the depth where the right knee starts talking. (The 26s — this gym's pair — ran 3×6 @8, so hold the bells and add a rep. 3×8 clean unlocks the next pair up.)" },
        { name:"DB bench press", sets:3,
          target:"3 × 9 @ RPE ≤8.5 · 26 kg DBs (57 lb)", rest:120, suggest:{weight:57, reps:9, rpe:8},
          note:"Flat bench, blades pinched and tucked, elbows ~45°, touch under control, press slightly back toward the face. Wrists stacked. (Riding the range: the 26s went 3×8 @7–8.5, so hold them and add the rep. 3×10 clean unlocks the 28s. Your Hevy history for this lift shows in the panel now — the name-matching bug is fixed.)" },
        { name:"Romanian deadlift", sets:3,
          target:"3 × 6 @ RPE 7 · 75 kg (165 lb)", rest:150, suggest:{weight:165, reps:6, rpe:7},
          note:"Hips back, spine long, bar dragging up the thighs, knees soft and FIXED — the hips keep travelling back, the knees don't keep bending. Stop when the hamstrings run out of range, stand up by driving the hips through. (70 kg 'felt easy' at @7 across — so 75. The limiter is hamstring range, so it keeps climbing in 2.5–5 kg steps rather than leaping.)" },
        { name:"Pull-up", sets:3, fields:["reps","rpe"],
          target:"Easy day · 3 × 5 @ RPE ≤7", rest:90, suggest:{reps:5, rpe:6},
          note:"Same strict form, nothing hard about it: 3 × 5 finishing FRESH. This is practice, not work — the third weekly exposure is the dose, not the effort. (Last Friday's 6,5,4 slid to @8 by set two — five crisp beats six ground, so the target drops a rep on purpose. If Wednesday left you sore, 3 × 4 is fine; never chase it.)" },
        { name:"DB lateral lunge (explosive)", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 5 each side · goblet ~16 kg (35 lb) · slow down, FAST up", rest:90, suggest:{weight:35, reps:5, rpe:7},
          note:"Stands in for the med-ball throw until Sri Lanka — no ball in this gym, as you found. Goblet a ~16 kg DB at the chest. Step wide, sit slowly into the outside hip with the trail leg straight — load it like a spring — then drive back up as FAST as the rep allows. Full reset between reps: five explosive singles, not a flow. The bar for success is intent and crispness, not load — this is still the only frontal-plane power in the week, and nothing airborne, no cutting." },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 10 each @ RPE 7–8 · 90° gate, wedge in · 80 kg (176 lb)", rest:90, suggest:{weight:176, reps:10, rpe:7},
          note:"Same as Monday: single leg on the sled, wedge in, ~3 s up and down, STOP at neutral, stop at the first hint of the heel spot. REPLACES the mobility-routine 3×15 today. (80 kg holds — this sled's next step is 90, which is +12.5% in a week and outside the tendon's ≤10% clock. The ninth and tenth reps ARE the progression.)" }
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
          target:"5 min easy · build 100 → 180 W", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"Seat high enough that the ankle stays quiet — push through the mid-foot, not the toes. Start around 100 W and drift up to ~180 by the end of the five minutes." },
        { name:"Bike tempo interval", sets:5, fields:["duration","rpe"],
          target:"5 × 2 min @ 280–290 W (RPE 7) · 2 min easy at 100–140 W between", rest:120,
          suggest:{duration:"2:00", rpe:7},
          note:"Watt targets, as requested — off your FTP of ~240 these sit at ~115–120%, a pace you could just about hold for six minutes flat out. Week 1 ran 275–290 with only the last rep touching 8, so the FIFTH REP is this week's progression; the wattage is not — do not chase 300. If rep 5 lands @9, that is the data: stop there and say so in the note. THE SPIN CLASS IS A FULL SUBSTITUTE for this whole session: log it as one entry with the class length and an overall RPE, and drag this card to the class day if it differs. (6 reps in week 3 if the RPEs hold.)" },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy · ~100 W", suggest:{duration:"3:00", rpe:3} }
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
          target:"5 min easy · build 100 → 180 W", warmup:true, suggest:{duration:"5:00", rpe:4} },
        { name:"Bike 30/30 — hard 30s", sets:10, fields:["duration","rpe"],
          target:"30 s @ 320–340 W / 30 s easy ~100 W · 5 reps × 2 sets", rest:180,
          suggest:{duration:"0:30", rpe:8},
          note:"Log the hard 30s only — 10 rows, 5 per set, 3 min easy spinning between sets. Watt targets as requested: week 1 ran 310–340 all @8 and you called it strong, so 320–340 W across, and the FIFTH REP per set is the progression — not more watts. A spin class replaces the whole session — one entry, class length, overall RPE. A METCON works for variety, but the constraint is absolute: nothing airborne — no jumps, no skipping, no burpees, no running — and nothing that bends the left ankle past 90° under load. (2×6 in week 3 if the RPEs hold.)" },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy · ~100 W", suggest:{duration:"3:00", rpe:3} }
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
