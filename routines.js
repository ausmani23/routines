/* ============================================================
   ROUTINES DATA — this is the file you edit to change content.
   The engine (app.js) needs no changes for new routines.

   Routine fields:
     id          unique string
     name        display name
     accent      per-routine color
     sub         subtitle on home + detail
     levelNames  optional array → difficulty selector appears
     levelTags   optional captions under level buttons
     defaultLevel  index used the first time (persisted after that)
     blocks      the exercises, in order

   Block fields:
     group    optional section header shown above this block
     name     exercise name
     badge    req | new | opt | rec  → labeled pill
     mode     "time" (counts down, auto-advances) | "reps" (waits for a tap)
     sec      seconds per segment (time mode)
     target   dial label (reps mode), e.g. "12–15 reps"
     sides    2 → runs Left then Right
     sets     n → repeats the whole block n times
     est      reps mode only: rough seconds, for the home-screen estimate
     dose     the prescription line
     detail   how-to shown during the move
     cue      the italic coaching note
     levels   optional per-level detail text, overrides `detail`
     tag      optional small qualifier next to the name
   ============================================================ */
const ROUTINES = [
{
  id:"tendon", name:"Morning — tendon & foot", accent:"#E5A33C",
  sub:"Every morning. Non-negotiable.",
  blocks:[
    {group:"Step 1 — Prep", name:"Foam roll calves", mode:"time", sec:120, sides:2,
     dose:"2 min per leg",
     detail:"Roll the meaty part of the calf — gastroc and soleus. Stay on the muscle belly, away from the lower third where the tendon begins."},

    {group:"Step 2 — Tendon", name:"Isometric calf holds", badge:"req", mode:"time", sec:40, sides:2, sets:2,
     dose:"2–3 holds per side, 30–45 sec, bent knee",
     detail:"Standing, single leg, knee slightly bent. Rise onto the ball of the foot and hold at ~60–70% effort. Let the analgesic effect settle in.",
     cue:"Manages the symptom. Use proactively, not just after flares."},

    {name:"Single-leg calf raises", badge:"new", mode:"reps", target:"12–15 reps", sides:2, sets:2, est:75,
     dose:"2–3 × 12–15 per side, bodyweight, slow",
     detail:"Flat surface. 3 sec up, 3 sec down, full contraction at the top. Bodyweight only in the morning — heavy loaded raises stay at the gym (A/C days).",
     cue:"Skip on a RED morning, like any loaded calf work. The morning bodyweight version is your reliable floor; it doesn't replace the heavy gym sets."},

    {group:"Step 3 — Ankle / foot control", name:"Banded inversion (tib posterior)", badge:"req",
     mode:"reps", target:"15 reps", sides:2, sets:2, est:60,
     dose:"2×15 per foot (3×15 gym days)",
     detail:"Band around inside of forefoot (big-toe side), anchored to your outside. Pull foot INWARD — sole turns toward midline. 2 sec in, hold, 2 sec back.",
     cue:"Supports the arch, controls the overpronation that overloads the insertion."},

    {name:"Banded eversion (peroneals)", mode:"reps", target:"15 reps", sides:2, sets:2, est:60,
     dose:"2×15 per foot",
     detail:"Band around outside of forefoot (little-toe side), anchored to your inside. Push foot OUTWARD — sole turns away from midline. Slow and controlled.",
     cue:"Lateral ankle stability for soccer and uneven ground."},

    {name:"Short foot (arch)", badge:"opt", mode:"reps", target:"10 holds × 5 sec", sides:2, est:50,
     dose:"1 × 10 holds, 5 sec each, per foot — or gym days only",
     detail:"Barefoot. Without curling toes (toes stay flat), draw the ball of the foot toward the heel. Arch lifts ~0.5 cm.",
     cue:"Also covered by the inversion band work + Kayanos. Don't let this one balloon the routine — skip it on non-gym days."},

    {group:"Step 4 — Balance (if time)", name:"Single-leg balance", badge:"rec", mode:"time", sec:45, sides:2,
     dose:"30–60 sec per side",
     detail:"Stand on one foot, reach free foot forward / sideways / behind. Progress: stable floor → towel/pillow → eyes closed."}
  ]
},
{
  id:"core", name:"Core — back-safe", accent:"#5BC9BC",
  sub:"Daily. Anti-movement: brace against motion, never crunch through it.",
  levelNames:["Level 1","Level 2","Level 3"], levelTags:["start here","","check in"], defaultLevel:0,
  blocks:[
    {name:"Dead bug", mode:"time", sec:45, dose:"45 sec",
     cue:"The most on-target move here — it trains the sit-to-stand mechanism directly. If the back lifts, you've gone too far.",
     levels:["Leg extends straight, opposite arm overhead.",
             "Hold a light dumbbell or book in both hands.",
             "Weighted, with a 3-sec pause at full extension."]},
    {name:"Bird dog", mode:"time", sec:45, dose:"45 sec",
     cue:"Extensor endurance without jamming into end-range extension the way a Superman would.",
     levels:["Pause 3 seconds fully extended each rep.",
             "Add a slow elbow-to-knee draw-in between reps.",
             "From a bear hover — knees an inch off the floor, never resting down."]},
    {name:"Front plank", mode:"time", sec:45, dose:"45 sec",
     cue:"Quality over duration — the moment the hips drop, stop and reset rather than grinding out the clock.",
     levels:["RKC style: max tension, pull elbows toward toes.",
             "RKC + lift one foot a few inches, alternating.",
             "Long-lever: elbows creep forward past the head."]},
    {name:"Side plank", mode:"time", sec:30, sides:2, dose:"30 sec each side",
     cue:"Don't let the hips sink. Shorter and clean beats longer and sagging.",
     levels:["Full side plank from the feet.",
             "From the feet, top leg raised to hip height.",
             "Top leg raised + slow hip dips."]},
    {name:"Dead bug", tag:"2nd round", mode:"time", sec:45, dose:"45 sec",
     cue:"Fatigue is when the back starts to lift — watch it. Doubled on purpose: closest thing here to your symptom.",
     levels:["Leg extends straight, opposite arm overhead.",
             "Hold a light dumbbell or book in both hands.",
             "Weighted, with a 3-sec pause at full extension."]},
    {name:"Bird dog", tag:"2nd round", mode:"time", sec:45, dose:"45 sec",
     cue:"Slow, hips level. Short on time? This is the one to drop — never the dead bugs.",
     levels:["Pause 3 seconds fully extended each rep.",
             "Add a slow elbow-to-knee draw-in between reps.",
             "From a bear hover — knees an inch off the floor, never resting down."]}
  ]
},
{
  id:"hips", name:"Morning — hip flexors", accent:"#9BB8D3",
  sub:"First thing, before you load the spine. Undoes the overnight shortening.",
  blocks:[
    {name:"Half-kneeling lunge", mode:"time", sec:45, sides:2, dose:"45 sec each side",
     detail:"Kneeling knee down, front foot flat. Squeeze the glute on the kneeling side, tuck the pelvis, then ease forward.",
     cue:"The glute squeeze is what makes it work — without it you arch the low back instead of lengthening the psoas."},
    {name:"Couch stretch", badge:"opt", mode:"time", sec:45, sides:2, dose:"45 sec each side",
     detail:"Rear foot up against a wall or sofa, torso tall. Back off until it's a stretch, not a fight.",
     cue:"Optional if the half-kneeling version already gets there. Skip on days it feels sharp."},
    {name:"Glute bridge", mode:"time", sec:45, dose:"45 sec",
     detail:"On your back, feet flat, drive hips up and hold. Ribs down, don't arch into it.",
     cue:"Wakes up the muscle on the other side of the pelvis — the one that keeps the tilt corrected once you stand."},
    {name:"Standing reset", mode:"time", sec:20, dose:"20 sec",
     detail:"Stand tall, ribs stacked over pelvis, breathe out fully twice.",
     cue:"Take the new position into standing before you walk off with the old one."}
  ]
}
];
