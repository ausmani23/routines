/* ============================================================
   ROUTINES DATA — this is the file you edit to change content.
   The engine (app.js) needs no changes for new routines.

   Routine fields:
     id          unique string
     name        display name
     accent      per-routine color
     sub         subtitle on home + detail
     variants    optional array of variant names, e.g. ["Day A","Day B"] or
                 ["Standard","Extended"] → a selector appears on the detail
                 screen; blocks are filtered by their `variant` field
     variantTags optional captions under the variant buttons
     variantMode "alternate" → the app defaults to whichever variant you did
                 NOT complete last time (for A/B day schemes);
                 "pick" (default) → remembers your last manual choice
     defaultLevel  starting level index for leveled blocks (before any is set)
     onDemand    true → filed under the "On demand" column on the home screen
                 instead of the daily column. Omit for daily routines.
     blocks      the exercises, in order

   Block fields:
     group    optional section header shown above this block
     name     exercise name — also the progression key: blocks with the same
              name in one routine share a difficulty level
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
     levels   optional per-level detail text, overrides `detail`.
              Progression is PER EXERCISE: each leveled block gets its own
              L1/L2/L3 chips on the detail screen, persisted individually.
     variant  optional index into the routine's `variants` — this block only
              runs in that variant. Omit to run in every variant (that is how
              daily non-negotiables carry across A/B days).
     tag      optional small qualifier next to the name
   ============================================================ */
const ROUTINES = [
{
  id:"hips", name:"Morning — hip opener", accent:"#9BB8D3",
  sub:"First thing on waking, before you load the spine. Everything here moves — ease in and out of each position, never hang at end range.",
  blocks:[
    {name:"Cat–cow", badge:"req", mode:"time", sec:60, dose:"60 sec · slow, breath-led",
     detail:"On hands and knees, wrists under shoulders, knees under hips. INHALE: drop the belly, lift the chest and tailbone, look gently up. EXHALE: press the floor away, round the whole spine toward the ceiling, tuck the chin and tailbone. Let each breath set the pace — one full breath per arch-and-round.",
     cue:"The wake-up call for the spine. After a night curled up, this is the gentlest way to take every segment through flexion and extension before anything bears load."},
    {name:"Dynamic supine twist", mode:"time", sec:45, sides:2, dose:"45 sec each side, moving",
     detail:"On your back, arms out in a T, knees bent, feet flat. Let both knees fall slowly toward the floor on one side while your head turns the other way. Pause one breath at the bottom, then draw the knees back up to center. Repeat for the whole 45 seconds — a slow pendulum, not a held stretch.",
     cue:"Rotation is the range the night takes away first. Moving in and out of it — rather than parking there — is what teaches the back it's safe."},
    {name:"Half-kneeling lunge", badge:"req", mode:"time", sec:45, sides:2, sets:2, dose:"45 sec each side × 2, rocking",
     detail:"Kneel on one knee (pad it if you like), front foot flat, torso tall. FIRST tuck the pelvis under — think belt buckle up toward the ribs — and squeeze the glute on the kneeling side. Keeping that, rock gently forward for 2–3 seconds until the front of the kneeling-side hip lengthens, then rock back. Repeat, breathing out on each rock forward.",
     cue:"Your favorite for a reason — it hits exactly where the night leaves you tight. The glute squeeze is what makes it work: without it you arch the low back instead of lengthening the psoas. Two rounds a side because more of a good thing is the whole point of the morning."},
    {name:"Couch stretch", badge:"opt", mode:"time", sec:45, sides:2, dose:"45 sec each side",
     detail:"Same half-kneeling shape, but the rear foot rides up against a wall or the sofa, bending the knee fully. Torso tall, pelvis tucked, same gentle rock forward and back. Back off until it's a stretch, not a fight.",
     cue:"The deeper version — it adds the quad to the hip flexor. Optional if the half-kneeling round already gets there. Skip on days it feels sharp."},
    {name:"Standing hip extension", mode:"reps", target:"10 per side", sides:2, est:35,
     dose:"10 per side, slow",
     detail:"Stand tall, one hand on a wall or counter for balance. Squeeze the glute and drive one leg straight back behind you a few inches — leg stays straight, torso stays upright, low back does NOT arch. Two seconds back, two seconds return. That small, strict range is correct; if it feels big, you're arching.",
     cue:"The active bookend: the lunge opened the front of the hip, this makes your own muscle hold the new range. That's what makes it stick past the first ten minutes."}
  ]
},
{
  id:"core", name:"Core — back-safe", accent:"#5BC9BC",
  sub:"Daily. The circuit is anti-movement — brace, don't crunch. The 10-min version adds a definition round: slow, controlled flexion for the mirror, skipped on any day the back is talking. Level up one exercise at a time — never the whole circuit.",
  variants:["5 min","10 min"], variantTags:["the circuit","+ definition round"], defaultLevel:0,
  blocks:[
    {group:"Round one", name:"Dead bug", mode:"time", sec:45, dose:"45 sec",
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
    {group:"Round two", name:"Dead bug", tag:"2nd round", mode:"time", sec:45, dose:"45 sec",
     cue:"Fatigue is when the back starts to lift — watch it. Doubled on purpose: closest thing here to your symptom.",
     levels:["Leg extends straight, opposite arm overhead.",
             "Hold a light dumbbell or book in both hands.",
             "Weighted, with a 3-sec pause at full extension."]},
    {name:"Bird dog", tag:"2nd round", mode:"time", sec:45, dose:"45 sec",
     cue:"Slow, hips level. Short on time? This is the one to drop — never the dead bugs.",
     levels:["Pause 3 seconds fully extended each rep.",
             "Add a slow elbow-to-knee draw-in between reps.",
             "From a bear hover — knees an inch off the floor, never resting down."]},
    {group:"Definition round", name:"Hollow body hold", variant:1, mode:"time", sec:45, sets:2, dose:"45 sec × 2",
     cue:"Doing double duty: the anti-extension anchor for the back, and the closest thing bodyweight has to a rectus builder. Low back stays pinned — if it lifts, raise the limbs. That is the whole difficulty dial.",
     levels:["Knees bent, shins parallel to the floor, arms reaching past the knees.",
             "Legs straight, heels a few inches up, arms by the hips.",
             "Full hollow: legs long and low, arms overhead by the ears."]},
    {name:"Reverse crunch", badge:"new", variant:1, mode:"time", sec:45, sets:2, dose:"45 sec × 2, slow",
     detail:"On your back, arms by your sides pressing the floor, knees bent to 90°. Exhale and curl the pelvis up so the knees draw toward the chest — the tailbone peels a few inches off the floor, nothing more. Lower over a slow 3 seconds without letting the feet touch down.",
     cue:"The vanity pick that's kindest to the disc: the spine flexes from the bottom up, unloaded, with you in full control of the speed. The 3-second lower is where the definition work happens. Skip on a day the back is talking.",
     levels:["Knees stay tucked tight, small curl, 3-sec lower.",
             "Slower still — 4 sec down — and the feet never touch between reps.",
             "Legs held straighter (harder lever), same slow lower."]},
    {name:"Weighted crunch", badge:"new", variant:1, mode:"time", sec:45, dose:"45 sec, small range",
     detail:"On your back, knees bent, feet flat, holding the book or light dumbbell on your chest. Exhale and curl the ribs toward the pelvis — shoulder blades peel off the floor, low back stays glued down. Two seconds up, squeeze, two seconds down. The range is a hand-span, not a sit-up.",
     cue:"Pure vanity, honestly held: a small, slow, loaded curl for the upper abs. The low back never leaves the floor, so the disc is a spectator. Skip on a day the back is talking.",
     levels:["No weight — hands on chest, slow tempo, hard exhale at the top.",
             "Book or light dumbbell held on the chest.",
             "Weight held above the chest on straight arms — same curl, longer lever."]},
    {name:"Side plank hip dips", badge:"new", variant:1, mode:"time", sec:30, sides:2, dose:"30 sec each side",
     detail:"Set up a full side plank from the feet, elbow under shoulder. Lower the bottom hip slowly toward the floor — an inch or two — then drive it back up past neutral, squeezing the waist. Continuous slow dips for the 30 seconds.",
     cue:"The oblique finisher — this is where the line down the side of the waist comes from, and the QL and lateral chain get trained in the bargain.",
     levels:["From the knees if the full version breaks form.",
             "Full side plank from the feet, slow dips.",
             "Top leg raised to hip height while dipping."]}
  ]
},
{
  id:"mobility", name:"Mobility — A / B", accent:"#B48EAD",
  sub:"Once a day, alternating. A is the QL and low back — both sides, evenly. B is hips, groin and the posterior chain that actually keeps the back quiet. Everything moves: ease in and out of each stretch rather than hanging at end range.",
  variants:["Day A — QL & back","Day B — hips & chain"],
  variantTags:["side bends & twists","strength that travels"],
  variantMode:"alternate", defaultLevel:0,
  blocks:[
    {name:"Cat–cow", mode:"time", sec:60, dose:"60 sec · slow, breath-led",
     detail:"On hands and knees. INHALE: belly drops, chest and tailbone lift. EXHALE: round the whole spine up, chin and tailbone tuck. Let the movement start at the pelvis and travel up the spine, one full breath per cycle.",
     cue:"Unhurried. This is the on-ramp, not a stretch."},

    {group:"Neck & upper back — desk antidote", name:"Thread the needle", badge:"new", mode:"time", sec:30, sides:2, dose:"30 sec each side, flowing",
     detail:"Still on hands and knees from cat–cow. Slide one arm under the body, palm up, along the floor until that shoulder and ear settle toward the mat. Pause one breath, then unwind and sweep the same arm up toward the ceiling, letting your eyes follow the hand. Flow between the two — under, then up — for the 30 seconds, then swap arms.",
     cue:"This is the move for the trap/neck tweaks. Hours at the desk stiffen the upper back until it stops rotating, and the neck ends up doing every turn alone — that is what gives out. Following the hand with the eyes is the point: it rehearses exactly the look-up-and-over that hurt, driven by the upper back instead of the neck."},

    {name:"Chin tucks", badge:"new", mode:"reps", target:"8 reps · 3 sec", est:40,
     dose:"8 reps, hold 3 sec each",
     detail:"Sitting or standing tall. Without nodding up or down, glide the chin straight back — think double chin — until the back of the neck feels long. Hold 3 seconds, release gently. The movement is small and horizontal; if something is nodding, it's too big.",
     cue:"The direct antidote to the hunch: forward-head sitting puts the traps and levator on duty all day holding the head up, and that overworked corner is what keeps tweaking. This wakes the deep neck muscles that should be doing the job. A small daily dose beats stretching it after it's already angry."},

    {name:"Half-kneeling lunge", mode:"time", sec:45, sides:2, dose:"45 sec each side, rocking",
     detail:"Kneel on one knee, front foot flat, torso tall. Tuck the pelvis under, squeeze the glute on the kneeling side, then rock gently forward 2–3 seconds and back. Keep the tuck the whole time.",
     cue:"Runs on both days now — it earns its place. The tuck-then-rock is the whole exercise; lunging without it just cranks the low back."},

    {group:"Day A — open up", variant:0, name:"Standing extension",
     mode:"reps", target:"5 reps · 3 sec", est:35,
     dose:"5 reps, hold 3 sec each",
     detail:"Stand, hands on the back of your hips like a frame. Lean gently back over your hands, hold 3 seconds, return to tall. Sitting parks you in flexion for hours; this is the direct antidote.",
     cue:"Small range. Extend through the whole spine, don't hinge at one segment."},

    {variant:0, name:"Dynamic supine twist", mode:"time", sec:30, sides:2, dose:"30 sec each side, moving",
     detail:"On your back, arms in a T, knees bent. Lower both knees slowly toward one side while the head turns the other way, pause a breath, draw them back to center, repeat. Then the other side.",
     cue:"Let gravity take the knees down — never press them with a hand. In and out of the stretch, not parked in it."},

    {group:"Day A — the QL work", variant:0, name:"Side-reach child's pose",
     mode:"time", sec:45, sides:2, dose:"45 sec each way, walking in and out",
     detail:"Hips to heels, arms long. Walk both hands over to one side until you feel a long pull down the opposite flank, ribs to hip. Take two slow breaths there, walk halfway back, then reach over again. Then swap sides.",
     cue:"Breathe into the stretched side — you should feel those ribs expand under tension. Even time both ways."},

    {variant:0, name:"Dynamic QL side bend", mode:"time", sec:45, sides:2,
     dose:"45 sec each side, flowing",
     detail:"Stand tall, one arm overhead. Push the same-side hip OUT to the side as you lean away, ride the bend for 2–3 seconds, then come back to tall. Repeat in a slow rhythm for the 45 seconds, then swap arms.",
     cue:"The hip shift is the whole exercise — without it you're only stretching lat. Moving in and out beats hanging: the QL responds better to rhythm than to a static pull."},

    {variant:0, name:"90/90 seated rotation", mode:"time", sec:45, sides:2, dose:"45 sec per side",
     detail:"Seated, both knees bent to 90° — one leg in front, one to the side. Rotate the torso slowly through range over the front leg, pause at end range, come back. No forcing.",
     cue:"Rotation feeds the QL from a different angle than the side bend — and it is the hip range soccer actually asks for."},

    {group:"Day A — upstream causes", variant:0, name:"Figure-4 glute stretch",
     mode:"time", sec:45, sides:2, dose:"45 sec per side, pulsing",
     detail:"On your back, one ankle crossed over the opposite knee. Pull the far thigh gently toward you for 3–4 seconds, release an inch, pull again — a slow pulse rather than one long hang.",
     cue:"A tight glute refers straight up into the QL. This is often where the tightness actually lives. Your hip flexors are already covered by the morning opener."},

    {variant:0, name:"Glute bridge", badge:"opt", mode:"reps", target:"10 reps · 2 sec", est:45,
     dose:"10 reps, 2 sec hold at the top",
     detail:"On your back, feet flat close to the hips. Drive the hips up until the body is a straight line from knees to shoulders, squeeze two seconds, lower with control.",
     cue:"Finishes the sequence by switching the glutes back on. Squeeze the glutes, not the low back; ribs stay down. Optional — Day B loads the glutes properly, and skip it any day the low back feels touchy."},

    {group:"Day B — open the hips", variant:1, name:"Adductor rock-back", badge:"new", mode:"time", sec:45, sides:2, dose:"45 sec per side",
     detail:"On hands and knees, extend one leg straight out to the side, foot flat, toes forward. Rock the hips slowly back toward the heel and return.",
     cue:"Groin range for cutting and for the Copenhagen work. Slow rocking, never a static end-range hang."},

    {variant:1, name:"Figure-4 glute stretch", mode:"time", sec:45, sides:2, dose:"45 sec per side, pulsing",
     detail:"On your back, one ankle crossed over the opposite knee. Pull the far thigh gently toward you for 3–4 seconds, release an inch, pull again — a slow pulse rather than one long hang.",
     cue:"Tight glutes refer straight up into the low back."},

    {group:"Day B — posterior chain", variant:1, name:"Single-leg RDL", badge:"new",
     mode:"reps", target:"8 reps", sides:2, est:45,
     dose:"8 per side, slow",
     cue:"Posterior chain strength is the best-evidenced thing you can do for this back — and it is your own observation too: the back is good when you have been diligent about it. This is the travel version.",
     levels:["Bodyweight. Hinge at the hip, back leg reaching straight behind, spine long. Fingertips on a wall for balance.",
             "Holding the 40 lb load in the opposite hand, no wall.",
             "40 lb, slower — 4 sec down — and pause an inch off the bottom."]},

    {variant:1, name:"Copenhagen adduction", badge:"new", mode:"time", sec:30, sides:2,
     dose:"30 sec per side",
     cue:"Highest-yield groin item there is — one exercise, roughly 40% fewer groin problems in the trial. Build it every session for the first 6–8 weeks, then it becomes maintenance.",
     levels:["Short lever: side-lying, bottom knee on the floor, TOP KNEE resting on a chair or bed. Lift the hips.",
             "Half lever: top shin on the support, hips driven up, bottom leg hovering.",
             "Full long lever: top ANKLE on the support, bottom leg lifted to meet it."]},

    {variant:1, name:"Single-leg glute bridge", badge:"opt", mode:"reps", target:"12 reps", sides:2, est:40,
     dose:"12 per side, 2 sec at the top",
     detail:"On your back, one foot flat, other knee hugged in. Drive the hips up, ribs down, hold two seconds.",
     cue:"Squeeze the glute, not the low back. If you feel it in the hamstring cramping, walk the foot closer in."},

    {variant:1, name:"Hamstring bridge walkout", badge:"new", mode:"reps", target:"6 reps", est:55,
     dose:"6 reps, 5 sec lowering",
     cue:"Stands in for the Nordic curl while you have no anchor. Low dose is enough — a few hard eccentric reps a week is the effective dose in the trials.",
     levels:["From a glute bridge, walk the heels out a step at a time and back in, hips held high.",
             "Walk out to near-straight legs, then lower the hips over 5 sec.",
             "Heels on a towel or socks on a smooth floor — slide out slowly, 5 sec, and drag back."]}
  ]
},
{
  id:"tendon", name:"PT — tendon, foot & knee", accent:"#E5A33C",
  sub:"Daily, alternating A / B. The tendon non-negotiables run on both days; the second half rotates.",
  variants:["Day A — foot","Day B — spring"],
  variantTags:["ankle & arch","knee, groin, pogo"],
  variantMode:"alternate", defaultLevel:0,
  blocks:[
    {group:"The tendon — every day", name:"Isometric calf holds", badge:"req", mode:"time", sec:35, sides:2,
     dose:"1 hold per side, 30–45 sec, bent knee",
     detail:"Standing, single leg, knee slightly bent. Rise onto the ball of the foot and hold at ~60–70% effort.",
     cue:"Use proactively, not just after flares. Treat it as tendon-stiffness work and a primer — the evidence for it as a painkiller in the Achilles specifically has not held up."},

    {name:"Calf raises", badge:"req", mode:"reps", target:"15 reps", sets:3, est:100, defaultLevel:2,
     dose:"3 × 15, 90° gate with the wedge, set 3 at RPE 9",
     cue:"90° at the ankle only — no dorsiflexion past neutral, wedge in. Alternate straight-knee and bent-knee sets. 3 × 15 is the dose; the levels change how HARD 15 reps are, never how many. If you can grind out 25, you are training calf endurance, not the tendon — add load, don't add reps. First week on a new level, watch the next-morning stiffness rather than chasing RPE 9.",
     levels:["Both legs, bodyweight. 3 sec up, 3 sec down, full contraction at the top. The floor — drop here on a bad morning.",
             "Single leg, bodyweight, 15 per side. The fallback for a trip where the load didn't come with you: one leg roughly doubles what two legs carry.",
             "Single leg with the ~40 lb load, 15 per side, 3 sec up / 3 sec down, set 3 landing at RPE 9. The RPE is the target; the weight is whatever reaches it.",
             "Single leg, ~40 lb, slower: 4 sec up, 2 sec hold at the top, 4 sec down. Same 15 reps, much more time at high strain. This is the rung to use when 40 lb stops being enough — time under load is the lever you still control.",
             "Single leg, loaded past 40 lb if you can improvise it — books in a pack, water. 8–10 per side. Tell Carolyn before this one: it is the first rung that leaves her rep prescription."]},

    {name:"Banded inversion (tib posterior)", badge:"req", mode:"reps", target:"15 reps", sides:2, sets:2, est:50,
     dose:"2×15 per foot (3×15 gym days)",
     detail:"Band around inside of forefoot (big-toe side), anchored to your outside. Pull foot INWARD — sole turns toward midline. 2 sec in, hold, 2 sec back.",
     cue:"Primary treatment for the medial point, not a supplement. Historically your most under-delivered item — that is why it runs on both days."},

    {group:"Day A — ankle & arch", variant:0, name:"Banded eversion (peroneals)",
     mode:"reps", target:"15 reps", sides:2, sets:2, est:50,
     dose:"2×15 per foot",
     detail:"Band around outside of forefoot (little-toe side), anchored to your inside. Push foot OUTWARD — sole turns away from midline. Slow and controlled.",
     cue:"Lateral ankle stability for soccer and uneven ground. This is the item that pushes Day A past 10 min — if you need the time back, drop to 1×15 per foot. It is the only thing on this day neither your card nor Carolyn flags as non-negotiable."},

    {variant:0, name:"Short foot (arch)", badge:"opt", mode:"reps", target:"10 holds × 5 sec", sides:2, est:50,
     dose:"1 × 10 holds, 5 sec each, per foot",
     detail:"Barefoot. Without curling toes (toes stay flat), draw the ball of the foot toward the heel. Arch lifts ~0.5 cm.",
     cue:"Also covered by the inversion band work + Kayanos. Don't let this one balloon the routine."},

    {variant:0, name:"Knee-to-wall test", badge:"opt", mode:"reps", target:"measure LEFT", est:40,
     dose:"Record LEFT inches + end-feel",
     detail:"Toe near wall, drive knee forward to touch, heel flat. Brief contact — measure, don't stretch. Note whether the stop is a painless BONY block or a painful/stiff tendon limit.",
     cue:"Track LEFT vs your own quiet-day baseline (~5.5\"), NOT the R–L gap. Green: ≥5.0\" + painless bony end-feel · Yellow: 3.5–5.0\", or pain at end range · Red: <3.5\", or sharp pain."},

    {group:"Day B — knee, groin & spring", variant:1, name:"Mini-pogos", badge:"new",
     mode:"time", sec:20, sets:2,
     dose:"2 × 20 sec, both feet",
     cue:"SKIP THIS THE DAY YOU PLAY AND THE DAY AFTER — the match already was your spring session, and these want 48 hours between. The block exists to fill the four or five days you don't play, so a match is never the only spring loading you get. Heel loud on landing → stay at this level. Heel lifts in.",
     levels:["Both feet, small and low. Short ground contact, action at the ankle, knees nearly straight.",
             "Both feet, then add 10 sec per side single-leg after each set.",
             "Both feet, 15 sec per side single-leg, then a few low forward bounds."]},

    {variant:1, name:"Quad tendon loading", badge:"new", mode:"time", sec:45, sets:2,
     dose:"2 × 45 sec, ~70% effort",
     cue:"For the right knee. Fingertip tenderness at the top-outer corner of the kneecap is the vastus lateralis part of the quad tendon insertion — so load the quad, don't chase the IT band. Rule: pain ≤3–4/10 while loading and back to normal next morning means keep going. Over that twice in a week, drop a level for a week.",
     levels:["Wall sit, back flat on the wall, thighs around 60° — shallower if the knee grumbles. Both feet.",
             "Band looped behind the knees, Spanish-squat style, torso upright.",
             "Single-leg wall sit, or a split-squat hold with the back foot on a chair.",
             "Move off the isometric: slow split squats or step-downs, 3 sec down / 3 sec up, 3 × 8. Isometrics settle a tendon; heavy slow reps are what rebuild it."]},

    {variant:1, name:"Single-leg balance", badge:"opt", mode:"time", sec:30, sides:2,
     dose:"30 sec per side",
     detail:"Stand on one foot, slight knee bend, tripod foot, quiet the wobble.",
     cue:"Progress: stable floor → towel/pillow → eyes closed. Cheapest ankle-sprain insurance there is, but it also runs in your warm-up — skip it here on a tight day."}
  ]
},
{
  id:"ql", name:"QL flare — extra dose", accent:"#7FA8C9", onDemand:true,
  sub:"For when the right QL is actually cranky — the full card, on top of Mobility Day A, up to twice a day. Slow nasal breathing throughout: the QL grips, it doesn't tear.",
  blocks:[
    {group:"1 — Open up", name:"Cat–cow", mode:"time", sec:60, dose:"60 sec · slow, breath-led",
     detail:"Hands and knees. Arch on the inhale, round on the exhale. Let the movement start at the pelvis and travel up.",
     cue:"Unhurried. This is the on-ramp, not a stretch."},
    {name:"Supine twist", mode:"time", sec:60, sides:2, dose:"60 sec per side · longer on the right",
     detail:"On your back, arms in a T. Draw the right knee across the body to the left, turn your head right. Repeat other side.",
     cue:"Let gravity do it. Don't press the knee down with your hand."},

    {group:"2 — The QL work (right priority)", name:"Side-reach child's pose", mode:"time", sec:45, sets:2,
     dose:"45 sec × 2 · both hands walked LEFT",
     detail:"Hips to heels, walk both hands over to the left until you feel a long pull down the right side, ribs to hip.",
     cue:"Breathe into the stretched side — you should feel the right ribs expand under tension."},
    {name:"Standing QL side bend", tag:"right", mode:"time", sec:30, sets:2, dose:"30 sec × 2 right",
     detail:"Stand tall, right arm overhead, lean left. Push the right hip out to the right to lengthen the QL rather than just the lat.",
     cue:"The hip shift is the whole exercise. Without it you're only stretching lat."},
    {name:"Standing QL side bend", tag:"left", mode:"time", sec:30, dose:"30 sec × 1 left",
     detail:"Stand tall, left arm overhead, lean right. Push the left hip out to lengthen the QL.",
     cue:"One round on the quiet side keeps it even."},
    {name:"90/90 seated rotation", mode:"time", sec:45, sides:2, dose:"45 sec per side",
     detail:"Seated, knees bent, rotate the torso slowly through range. Pauses at end range, no forcing.",
     cue:"Rotation feeds the QL from a different angle than the side bend."},

    {group:"3 — The upstream causes", name:"Half-kneeling hip flexor lunge", mode:"time", sec:45, sides:2,
     dose:"45 sec per side",
     detail:"Half-kneel, tuck the pelvis under (posterior tilt) BEFORE shifting forward. Squeeze the back glute.",
     cue:"The tuck comes first. Lunging without it just cranks the low back."},
    {name:"Figure-4 glute stretch", mode:"time", sec:45, sides:2, dose:"45 sec per side",
     detail:"On your back, right ankle over left knee, pull the left thigh toward you.",
     cue:"Tight glute on one side commonly refers straight up into the QL. Green: firm pull that eases. Yellow: sharp catch — back off to 70%, hold longer. Red: shooting into the glute or down the leg, or numbness — stop, get it looked at."}
  ]
},
{
  id:"warmup", name:"Pre-soccer warm-up", accent:"#8FBF6B", onDemand:true,
  sub:"Do in full before every game or session. Kayanos + heel lifts, flat ground. Collagen 15 g + vitamin C ~30–45 min before; hydrate.",
  blocks:[
    {group:"1 — Easy jog (build)", name:"Jog — relaxed shuffle", mode:"time", sec:90,
     dose:"~90 sec · ~40%",
     detail:"Relaxed shuffle to start.",
     cue:"Tall, quiet midfoot landings, cadence ~170–180. No heel-thumping."},
    {name:"Jog — conversational", mode:"time", sec:90,
     dose:"~90 sec · ~60%",
     detail:"Ease to conversational pace.",
     cue:"Tall, quiet midfoot landings. No heel-thumping."},
    {name:"Jog — purposeful", mode:"time", sec:60,
     dose:"final minute · ~75%",
     detail:"Purposeful (not a stride) in the final minute.",
     cue:"Smooth gear change, still relaxed."},

    {group:"2 — BW calf raises", name:"Calf raises — straight knee", mode:"reps", target:"10 reps", est:50,
     dose:"10 straight-knee",
     detail:"Fingertips on support. Rise 1–2 s, brief hold, lower 2–3 s.",
     cue:"Drive through big toe + 2nd toe, ankles stacked, full range."},
    {name:"Calf raises — bent knee", mode:"reps", target:"10 reps", est:50,
     dose:"10 bent-knee",
     detail:"Hold ~20–30° knee bend, same tempo: rise 1–2 s, brief hold, lower 2–3 s.",
     cue:"Drive through big toe + 2nd toe, ankles stacked, full range."},

    {group:"3 — Single-leg isometric holds", name:"Single-leg isometric hold", mode:"time", sec:30, sides:2,
     dose:"1 per leg · 30 s · bent knee · ~60–70%",
     detail:"Rise to mid-range height on one leg, hold dead still 30 s, lower slowly. Switch. This is your analgesic primer — quiets the tendon.",
     cue:"Load through the big-toe line, ankle steady, mid-range not max. Pain rises → lower the height."},

    {group:"4 — Single-leg balance", name:"Single-leg balance", mode:"time", sec:30, sides:2,
     dose:"30 s per side",
     detail:"One leg, slight knee bend, tripod foot, quiet the wobble.",
     cue:"Long toes (don't claw), arch gently lifted, eyes forward."},

    {group:"5 — Mini-pogos", name:"Mini-pogos — both feet", mode:"time", sec:20,
     dose:"both feet · 20 s",
     detail:"Small, fast, low hops on the balls of the feet, knees nearly straight, action at the ankle, short ground contact.",
     cue:"Tall, quiet, springy — land and leave the same spot. First impact check: heel loud here → keep it very gentle today."},
    {name:"Mini-pogos — single leg", mode:"time", sec:10, sides:2,
     dose:"10 s per side",
     detail:"Same hop, one leg. Small, fast, low, short ground contact.",
     cue:"Tall, quiet, springy. Heel loud → keep it very gentle today."},

    {group:"6 — Build-ups + movement prep", name:"Build-ups", mode:"reps", target:"2–3 strides", est:210,
     dose:"2–3 @ 60–75%, one ~85% over 20 m",
     detail:"Smoothly build, hold a few strides, ease down; full walk-back between. For a game, add 2–3 strides with gentle ROUNDED direction changes to prime cutting — no sharp plants.",
     cue:"Relaxed face and hands, smooth gear changes. Not 100%."}
  ]
}
];
