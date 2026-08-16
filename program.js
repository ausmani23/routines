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
  block: "London — return to soccer, part 1",
  week: 2,
  weeks: 2,
  start: "2026-08-12",
  focus: "The back half of the block, re-planned around an acute LEFT retrocalcaneal bursitis that flared after C2: keep every gram of strength, move all conditioning onto the bike, and put nothing through the heel at speed until the sports-med visit.",
  note: "The bursitis is a compression problem at the same left-heel insertion as the Achilles work, and the treatment is Carolyn's existing rules applied harder: heel elevated, no dorsiflexion past neutral, pain is not productive. So this week: FULL-height heel lifts everywhere — the wean is scrapped, not paused — and no running, jumping, skipping or cutting of any kind until the doctor says otherwise. Lifting continues — and PROGRESSES: every set row comes pre-filled with this week's prescription, worked out from last week's RPEs (double progression — load moves only where the log earned it). Do it as written and just tick the set; the PREV column shows what you actually did last time. The quad-tendon and calf items hold flat on purpose: tendon tissue progresses on a weekly clock (≤10%), and the calf's neighbour is the thing that flared. Heavy slow calf work inside the 90° gate stays, capped at RPE 8. One caution: NSAIDs can mask symptoms for a day or two after the course ends, so read the first two clean mornings conservatively. On the two strength days the loaded calf raise still REPLACES the PT 3×15 — one or the other, never both. PT mini-pogos stay paused. Log the check-in every morning, before coffee.",

  /* Last tested Aug 2025: 1200 m in 4:26, and the Jul-Oct 2025 templates ran
     100% MAS at 130 m / 30 s → ~4.4 m/s. Discounted to 3.9 for a year without
     run training. Still a GUESS: the C3 running session that was going to
     measure it was replaced by bike work when the bursitis arrived, so the
     number carries over unmeasured into the next block. */
  mas: { value: 3.9, units: "m/s", source: "assumed", date: "2026-08-10",
         basis: "4.4 m/s tested Aug 2025, discounted for detraining; C3 measurement lost to the bursitis week" },

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
     session point at, so it follows its session rather than its position.

     Bursitis re-plan (Aug 16): d8 and d10 now point at the bike sessions
     (c-bike, c-bike2) instead of c-tempo and c-grid. The running workouts
     stay in `workouts` unscheduled so nothing keyed to them breaks — they
     come back when the sports-med visit clears running. */
  schedule: [
    { sid:"d1",  date:"2026-08-12", w:"s-post"  },
    { sid:"d2",  date:"2026-08-13", w:"c-run"   },
    { sid:"d4",  date:"2026-08-14", w:"s-uni"   },
    { sid:"d5",  date:"2026-08-15", w:"c-cod"   },
    { sid:"d3",  date:"2026-08-16", rest:true   },
    { sid:"d6",  date:"2026-08-17", w:"s-post"  },
    { sid:"d8",  date:"2026-08-18", w:"c-bike"  },
    { sid:"d9",  date:"2026-08-19", w:"s-uni"   },
    { sid:"d10", date:"2026-08-20", w:"c-bike2" },
    { sid:"d11", date:"2026-08-21", rest:true   }
  ],

  workouts: [
    /* ---------------------------------------------------------------- */
    {
      id: "checkin",
      name: "Morning check-in", short: "Check-in",
      accent: "#C9A227", unit: "check", cat: "check", sched: {freq:"daily"},
      sub: "Ten seconds, before you get going. This week it is watching the left heel — the bursitis — as much as the tendon.",
      exercises: [
        { name:"Morning stiffness & pain", sets:1,
          fields:["duration","rpe"], labels:{duration:"MINUTES", rpe:"PAIN"},
          phs:{duration:"min", rpe:"0-10"},
          target:"Minutes of stiffness on first getting up · pain 0–10",
          note:"Minutes, not a vibe: time how long from standing up to walking normally. The PAIN number this week is specifically the back of the LEFT heel — the bursitis spot — and note any visible swelling there in the session note. FULL-height heel lifts every day, no wean; once, this week, work out exactly which insert/setting 'full height' is and write it down here, so the sports-med doctor gets an accurate account. Any morning the heel is worse than the day before → skip that day's conditioning entirely." },
        { name:"New niggles scan", sets:1,
          fields:["rpe"], labels:{rpe:"WORST"}, phs:{rpe:"0-10"},
          target:"Anything new, anywhere? 0 = nothing",
          note:"Ten seconds, head to toe: is any spot new, or behaving differently than yesterday? Score the worst one 0–10 and NAME it in the session note — even a 1. This row exists because of the bursitis: a flare should reach the Sunday re-program through the export, not through remembering to mention it. 0 most mornings is the expected answer; the whole value is the morning it isn't." }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-post",
      name: "S1 · Posterior + push",
      accent: "#C97F5B", cat: "strength",
      sub: "Deadlift day. The heaviest session of the block — and lifting is the one thing the bursitis doesn't touch.",
      exercises: [
        /* Trap-bar jump squat pulled for the bursitis week: rapid ankle
           stretch-shortening under load is exactly the stimulus on pause.
           It returns, same name and suggest, when running is cleared. */
        { name:"Deadlift", sets:4,
          target:"4 × 4 @ RPE 7 · 285 lb", rest:180, suggest:{weight:285, reps:4, rpe:7},
          note:"Bar over mid-foot, hinge down to it with a long spine, lats set before the pull. Push the floor away and finish tall — no jerking it off the floor, no ramming the lockout. Reset your brace every rep. Every set ends with reps in the tank. (285 is this week's earned jump from 275 — last week ran RPE 7 across — and still sits under your 285×8 from July.)" },
        { name:"DB bench press", sets:4,
          target:"4 × 6–8 @ RPE 7–8 · 55s", rest:120, suggest:{weight:55, reps:6, rpe:7},
          note:"Flat bench. Feet planted, shoulder blades pinched back and tucked under you, and KEEP them there — the elbows track about 45° from the body, never flared to a T. Touch the chest under control, press slightly back toward the face. (The 55s are new — you closed the 50s at 10 @9 — so start at 6s and build back to 8s before the next jump.)" },
        { name:"Chest-supported row", sets:3,
          target:"3 × 8–10 @ RPE 7 · 65", rest:90, suggest:{weight:65, reps:8, rpe:7},
          note:"Chest GLUED to the pad the whole set — if the torso heaves, the weight is doing the rowing. Pull to the lower ribs, squeeze the blades together for a beat, lower slow. Chest-supported or 1-arm DB with a hand braced, never bent-over: the lumbar spine already worked hard today. (65 now, reset to 8s, after 60 ran away to 12 @9.5.)" },
        { name:"Eccentric leg extension", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 5 each · 4 s down · hold 170", rest:120, suggest:{weight:170, reps:5, rpe:8},
          note:"Lift the weight up with BOTH legs, then lower on the right leg alone over a slow, counted 4 seconds — the lowering is the entire exercise, so go heavier than one leg could lift. Full control at the top before each descent. If the top-outer corner of the kneecap complains, shorten the range rather than dropping the weight. (Held at 170 on purpose: tendons progress weekly, not per-session — bring all three sets in at RPE 8 and 180 goes in next week.)" },
        { name:"Standing calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 8 each @ RPE 7–8 · 90° gate, wedge in · hold 165", rest:90, suggest:{weight:165, reps:8, rpe:7},
          note:"Single leg on the LEG-PRESS sled (same machine as 12 Aug so history stays comparable), wedge under the forefoot. Press up smooth over ~3 seconds, lower the same — and STOP at neutral: the heel never drops past 90°, which is exactly what keeps the bursa out of its compression zone. Stop the set at the first hint of the back of the left heel. REPLACES the PT 3×15 today — do not do both. (Held flat this week on purpose: the tissue next door is the one that flared.)" }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "s-uni",
      name: "S2 · Unilateral + lateral",
      accent: "#B48EAD", cat: "strength",
      sub: "Single-leg strength and the frontal plane — the stuff soccer actually asks for.",
      exercises: [
        /* Single-leg box jump pulled for the bursitis week: single-leg
           takeoff is the highest Achilles-insertion dose in the block.
           Jumps return, with Paul Read's tall-and-upright cue, when the
           sports-med visit clears running. */
        { name:"Deficit rear-foot-elevated split squat", sets:3,
          target:"3 × 8 each @ RPE 7–8 · 50 lb", rest:150, suggest:{weight:50, reps:8, rpe:7},
          note:"Back foot laces-down on the bench, front foot on the deficit plate, far enough forward that the shin stays near vertical. Torso tall, drop straight down between the legs — not forward over the knee — and drive up through the whole front foot. Stop at the depth where the right knee starts talking rather than chasing full range. (Progressing by reps: 6s → 8s at the same 50, the gentler lever on a deficit; own 3 × 8 and next block opens at 55×6.)" },
        { name:"Pull-up", sets:3, fields:["reps","rpe"],
          target:"3 × 7 @ RPE 7–8", rest:120, suggest:{reps:7, rpe:7},
          note:"Dead hang to start each rep, then set the shoulder blades — down and back — BEFORE the arms bend. Pull the chest toward the bar, no kipping, and control the way down; the negative is half the exercise. (One more rep than last week; at a clean 3 × 8 we hang a DB or loaded backpack off you, which conveniently also travels.)" },
        { name:"Romanian deadlift", sets:3,
          target:"3 × 6–8 @ RPE 7–8 · 145", rest:150, suggest:{weight:145, reps:6, rpe:7},
          note:"Hips back, spine long, bar dragging up the thighs, knees soft and FIXED — the knees don't bend further as you descend, the hips just keep travelling back. Stop when the hamstrings run out of range rather than when the bar reaches the floor, and stand up by driving the hips through. (145 now, toward 6s; the limiter here is hamstring range, not strength, so it climbs steadily rather than leaping.)" },
        { name:"Overhead press", sets:3,
          target:"3 × 6–8 @ RPE 7–8 · 40s", rest:120, suggest:{weight:40, reps:6, rpe:7},
          note:"Dumbbells, seated or standing. Ribs DOWN and glutes squeezed before the press — the low back does not arch to finish a rep; if it does, the set is over. Press to a full lockout with the biceps by the ears, lower to the shoulders under control. (40s this week after the 35s closed at 10 @9 — start at 6s.)" },
        { name:"Long-lever hip iso hold", sets:3, fields:["duration","rpe"],
          target:"3 × 20 s each side", rest:60, suggest:{duration:"20", rpe:7},
          note:"Straight from the ARO program. Leg long, knee locked, toes pulled toward you; hold the heel at the height where the hip flexor burns but the low back stays quiet and pressed down — if the back arches, lower the leg an inch. Complete all holds on one side before switching. (20 s now, up from 15; the 25 lb DB on the lap returns when 3 × 25 s is comfortable.)" },
        { name:"Lateral lunge to med-ball throw", sets:3, fields:["reps","rpe"],
          target:"3 × 5 each side", rest:90, suggest:{reps:5, rpe:7},
          note:"14 lb ball. Step wide, sit into the outside hip with the trail leg straight — load it like a spring — then drive across and throw as hard as the wall can take. Full reset between reps; this is five explosive singles, not a flow. (Volume held flat on purpose — power progresses by intent and crispness, and with the cutting drills parked this is the only frontal-plane work in the week.)" },
        { name:"Seated calf raise", sets:3, fields:["weight","reps","rpe"],
          target:"3 × 10–12 @ RPE 7–8 · 90° gate · 70 lb", rest:90, suggest:{weight:70, reps:10, rpe:7},
          note:"Knees bent 90°, pad on the thighs, balls of the feet on the platform. Smooth 2–3 seconds up to a full squeeze, same speed down, and STOP at neutral — the heel never drops below the platform. Bent knee puts this through the soleus where the standing version hit gastroc. Stop at the first hint of the left-heel spot. REPLACES the PT 3×15 today. (Deliberately down to 70 from the ~95 that cramped the right leg and broke form — clean reps first, then climb back.)" }
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
      sub: "ON HOLD until the sports-med visit clears running — this is the session the bursitis flared after. Kept for when cutting comes back.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"8 min easy · RPE 4–5", warmup:true, suggest:{duration:"8:00", rpe:4},
          note:"FULL-height heel lifts — the wean is scrapped until the doctor says otherwise." },
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
      id: "c-bike",
      name: "C3 · Bike tempo intervals",
      accent: "#5B8FC9", unit: "drill", cat: "cardio",
      sub: "The MAS tempo day moved onto the bike — same engine work, zero load through the left heel.",
      exercises: [
        { name:"Easy spin", sets:1, fields:["duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"Seat high enough that the ankle stays quiet — push through the mid-foot, not the toes." },
        { name:"Bike tempo interval", sets:4, fields:["duration","rpe"],
          target:"4 × 2 min hard @ RPE 7 · 2 min easy spin between", rest:120,
          suggest:{duration:"2:00", rpe:7},
          note:"Same effort rule as the running version: a pace you could just about hold for six minutes flat out. If rep 4 lands at RPE 8+, that is the data — do not add a fifth. A spin class is an accepted substitute for this whole session: log it as one entry with the class length and an overall RPE. A rower works too, but only with a shortened catch — the full catch is a deep-dorsiflexion position, which is exactly what the bursa hates." },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy", suggest:{duration:"3:00", rpe:3} }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-bike2",
      name: "C4 · Bike 30/30s",
      accent: "#C95B7F", unit: "drill", cat: "cardio",
      sub: "The grid day's structure, moved onto the bike. No on-feet work at all this week — no dribbling, no shuffling, nothing.",
      exercises: [
        { name:"Easy spin", sets:1, fields:["duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4} },
        { name:"Bike 30/30 — hard 30s", sets:8, fields:["duration","rpe"],
          target:"30 s hard / 30 s easy × 4 reps × 2 sets", rest:180,
          suggest:{duration:"0:30", rpe:8},
          note:"Log the hard 30s only — 8 rows, 4 per set, 3 min easy spinning between sets. Same shape as the grass grids, so the aerobic thread of the block doesn't drop. If you'd rather do a METCON for variety, the constraint is absolute: nothing airborne — no jumps, no skipping, no burpees, no running — and nothing that dorsiflexes the left ankle under load." },
        { name:"Easy spin down", sets:1, fields:["duration","rpe"],
          target:"3–5 min easy", suggest:{duration:"3:00", rpe:3} }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "c-tempo",
      name: "C3 · MAS tempo intervals",
      accent: "#5B8FC9", unit: "drill", cat: "cardio",
      sub: "ON HOLD until the sports-med visit clears running. Still the session that will measure your MAS when it returns.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"FULL-height heel lifts." },
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
      sub: "ON HOLD until the sports-med visit clears running — wickets and accel-stops are exactly the loads the bursitis vetoes.",
      exercises: [
        { name:"Easy continuous run", sets:1, fields:["distance","duration","rpe"],
          target:"5 min easy · RPE 4", warmup:true, suggest:{duration:"5:00", rpe:4},
          note:"FULL-height heel lifts." },
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
