/* ============================================================
   ROUTINES DATA — this is the file you edit to change content.
   The engine (app.js) needs no changes for new routines.

   Routine fields:
     id          unique string
     name        display name
     short       compact name for the one-line daily summary on Upcoming,
                 where "Morning — hip opener" is four words too many
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
     onDemand    legacy flag, kept as the fallback for `sched`. Omit on new
                 routines and use `sched` instead.
     sched       when this routine is due. {freq:"daily"} → it appears on Today
                 every day and in the one-line daily summary on Upcoming.
                 {freq:"onDemand"} → it never appears on a schedule; you reach
                 it from Browse or the "On demand" row at the foot of Today.
                 {freq:"gym"} → due on the days program.js schedules a strength
                 session (the pre-lift prep); {freq:"weekly", days:[1,3,5]} →
                 fixed weekdays (0 = Sunday).
                 Every routine is its own card on Today — a BUCKET. Drag one
                 onto another there and they run as one (a stack), logged
                 separately; the buckets stay small so that is the norm.
                 Every routine is area "mobility & pt"; the dated strength and
                 cardio work is scheduled from program.js instead.
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
     paused   true → listed dimmed on the detail screen, never run, never
              counted (an item Carolyn has parked); flip it off to resume
     link        optional {label, url} — pictures or a video for the move; a link on
                 the detail screen only (the run screen is plain text)
   ============================================================ */
const ROUTINES = [
{
  id:"hips", name:"Morning — hip opener", short:"Hips", accent:"#9BB8D3", sched:{freq:"daily"},
  sub:"First thing on waking, before you load the spine. Three full rounds of the three moves (Aug 2026, your ask), 40 sec a position to keep it at 8 minutes flat. Everything here moves — ease in and out of each position, never hang at end range.",
  blocks:[
    {group:"Round one", name:"Cat–cow", badge:"req", mode:"time", sec:40, dose:"40 sec · slow, breath-led",
     detail:"On hands and knees, wrists under shoulders, knees under hips. INHALE: drop the belly, lift the chest and tailbone, look gently up. EXHALE: press the floor away, round the whole spine toward the ceiling, tuck the chin and tailbone. Let each breath set the pace — one full breath per arch-and-round.",
     cue:"The wake-up call for the spine. After a night curled up, this is the gentlest way to take every segment through flexion and extension before anything bears load."},
    {name:"Dynamic supine twist", mode:"time", sec:40, dose:"40 sec · alternating sides",
     detail:"On your back, arms out in a T, knees bent, feet flat. Let both knees fall slowly toward the floor on one side while your head turns the other way. Pause one breath at the bottom, then draw them up through center and straight over to the other side. One continuous slow pendulum.",
     cue:"Rotation is the range the night takes away first. One continuous movement — not a held left, then a held right — is what teaches the back it's safe."},
    {name:"Half-kneeling lunge", badge:"req", mode:"time", sec:40, sides:2, dose:"40 sec each side, rocking",
     detail:"Kneel on one knee (pad it if you like), front foot flat, torso tall. FIRST tuck the pelvis under — think belt buckle up toward the ribs — and squeeze the glute on the kneeling side. Keeping that, rock gently forward for 2–3 seconds until the front of the kneeling-side hip lengthens, then rock back. Repeat, breathing out on each rock forward.",
     cue:"Your favorite for a reason — it hits exactly where the night leaves you tight. The glute squeeze is what makes it work: without it you arch the low back instead of lengthening the psoas."},
    {group:"Round two", name:"Cat–cow", tag:"2nd round", badge:"req", mode:"time", sec:40, dose:"40 sec · slow, breath-led",
     cue:"Same as before, a little deeper now that the spine has warmed to the idea."},
    {name:"Dynamic supine twist", tag:"2nd round", mode:"time", sec:40, dose:"40 sec · alternating sides",
     cue:"The second pass is where the range actually shows up. Same slow pendulum."},
    {name:"Half-kneeling lunge", tag:"2nd round", badge:"req", mode:"time", sec:40, sides:2, dose:"40 sec each side, rocking",
     cue:"Tuck first, then rock. The hip should give noticeably more than it did in round one."},
    {group:"Round three", name:"Cat–cow", tag:"3rd round", badge:"req", mode:"time", sec:40, dose:"40 sec · slow, breath-led",
     cue:"Last pass — the spine should feel like one connected piece by now, not segments."},
    {name:"Dynamic supine twist", tag:"3rd round", mode:"time", sec:40, dose:"40 sec · alternating sides",
     cue:"The freest of the three. Let the knees travel as far as gravity takes them."},
    {name:"Half-kneeling lunge", tag:"3rd round", badge:"req", mode:"time", sec:40, sides:2, dose:"40 sec each side, rocking",
     cue:"The closer. Three rounds a side, each finding a looser hip than the last."}
  ]
},
{
  id:"core", name:"Core — back-safe", short:"Core", accent:"#5BC9BC", sched:{freq:"daily"},
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
  id:"mobility", name:"Mobility — A / B", short:"Mobility", accent:"#B48EAD", sched:{freq:"daily"},
  sub:"Once a day, alternating. A is the QL and low back; B is hips, groin and the posterior chain. Everything moves: ease in and out of each stretch rather than hanging at end range. (Sep 2026: the tendon PT that rode here for a week is back on its own card, and the lift prep is its own card on gym days — drag them onto this one on Today for a single long run.)",
  variants:["Day A — QL & back","Day B — hips & chain"],
  variantTags:["side bends & twists","strength that travels"],
  variantMode:"alternate", defaultLevel:0,
  blocks:[
    {name:"Cat–cow", mode:"time", sec:45, dose:"45 sec · slow, breath-led",
     detail:"On hands and knees. INHALE: belly drops, chest and tailbone lift. EXHALE: round the whole spine up, chin and tailbone tuck. Let the movement start at the pelvis and travel up the spine, one full breath per cycle.",
     cue:"Unhurried. This is the on-ramp, not a stretch — and the morning routine now runs three rounds of it, so a shorter pass here is plenty."},

    {group:"Neck & upper back — desk antidote", name:"Thread the needle", badge:"new", mode:"time", sec:30, sides:2, dose:"30 sec each side, flowing",
     detail:"Still on hands and knees from cat–cow. Slide one arm under the body, palm up, along the floor until that shoulder and ear settle toward the mat. Pause one breath, then unwind and sweep the same arm up toward the ceiling, letting your eyes follow the hand. Flow between the two — under, then up — for the 30 seconds, then swap arms.",
     cue:"This is the move for the trap/neck tweaks. Hours at the desk stiffen the upper back until it stops rotating, and the neck ends up doing every turn alone — that is what gives out. Following the hand with the eyes is the point: it rehearses exactly the look-up-and-over that hurt, driven by the upper back instead of the neck."},

    {name:"Chin tucks", badge:"new", mode:"reps", target:"8 reps · 3 sec", est:40,
     dose:"8 reps, hold 3 sec each",
     detail:"Sitting or standing tall. Without nodding up or down, glide the chin straight back — think double chin — until the back of the neck feels long. Hold 3 seconds, release gently. The movement is small and horizontal; if something is nodding, it's too big.",
     cue:"The direct antidote to the hunch: forward-head sitting puts the traps and levator on duty all day holding the head up, and that overworked corner is what keeps tweaking. This wakes the deep neck muscles that should be doing the job. A small daily dose beats stretching it after it's already angry."},

    {name:"Toe sit with neck turns", badge:"new", mode:"time", sec:60, dose:"60 sec · slow turns",
     detail:"Kneel and sit back onto your heels with the toes tucked under, torso tall, hands resting on the thighs. Settle as much weight into the heels as the feet allow. From there, turn the head slowly to look over one shoulder, pause a breath, then over the other — smooth, unhurried turns for the whole minute. If the toes are too intense, tuck only as far as they tolerate and build up.",
     cue:"Your own invention, and a good two-for-one: the sit takes the knees to deep flexion and loads the toes and arches, while the head turns work the neck rotation the desk steals. Ease off the depth rather than the time if the knees complain."},

    {group:"Day A — open up", variant:0, name:"Standing extension",
     mode:"reps", target:"5 reps · 3 sec", est:35,
     dose:"5 reps, hold 3 sec each",
     detail:"Stand, hands on the back of your hips like a frame. Lean gently back over your hands, hold 3 seconds, return to tall. Sitting parks you in flexion for hours; this is the direct antidote.",
     cue:"Small range. Extend through the whole spine, don't hinge at one segment."},

    {variant:0, name:"Dynamic supine twist", mode:"time", sec:45, dose:"45 sec · alternating sides",
     detail:"On your back, arms in a T, knees bent. Lower both knees slowly toward one side while the head turns the other way, pause a breath, then bring them up through center and over to the other side. Keep the pendulum going for the full minute.",
     cue:"Let gravity take the knees down — never press them with a hand. One continuous movement, not a held side then a swap."},

    {group:"Day A — the QL work", variant:0, name:"Side-reach child's pose",
     mode:"time", sec:45, sides:2, dose:"45 sec each way, walking in and out",
     detail:"Hips to heels, arms long. Walk both hands over to one side until you feel a long pull down the opposite flank, ribs to hip. Take two slow breaths there, walk halfway back, then reach over again. Then swap sides.",
     cue:"Breathe into the stretched side — you should feel those ribs expand under tension. Even time both ways."},

    {variant:0, name:"Dynamic QL side bend", mode:"time", sec:60,
     dose:"60 sec · alternating sides, flowing",
     detail:"Stand tall. Reach one arm overhead, push the same-side hip OUT as you lean away, ride the bend for 2–3 seconds, come back to tall — then swap arms and bend the other way. Keep alternating in a slow rhythm for the 90 seconds.",
     cue:"The hip shift is the whole exercise — without it you're only stretching lat. Alternating beats hanging: the QL responds better to rhythm than to a static pull."},

    {variant:0, name:"90/90 seated rotation", mode:"time", sec:60, dose:"60 sec · alternating sides",
     detail:"Seated, both knees bent to 90° — one leg in front, one to the side. Rotate the torso slowly through range over the front leg, pause at end range, then swing both knees through center to the other side and rotate over that leg. Keep switching for the minute. No forcing.",
     cue:"Rotation feeds the QL from a different angle than the side bend — and the knee swing through center is the hip range soccer actually asks for."},

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
             "Heels on a towel or socks on a smooth floor — slide out slowly, 5 sec, and drag back."]},
  ]
},
{
  id:"tendon", name:"PT — tendon, foot & knee", short:"PT", accent:"#E5A33C", sched:{freq:"daily"},
  sub:"Carolyn's tendon, foot and knee work, alternating A/B; the every-day tendon group runs on both days. Its own card again (Sep 2026) — on Today, drag it onto Mobility or Core for one long run. The PAUSED items (mini-pogos, knee-to-wall) are listed at the foot but never run; they return around her week 5 (~mid-Sep).",
  variants:["Day A — foot & ankle","Day B — knee"],
  variantTags:["ankle & arch","wall sits & balance"],
  variantMode:"alternate", defaultLevel:0,
  blocks:[
    {group:"The tendon — every day", name:"Isometric calf holds", badge:"req", mode:"time", sec:35, sides:2,
     dose:"1 hold per side, 30–45 sec, bent knee",
     detail:"Standing, single leg, knee slightly bent. Rise onto the ball of the foot and hold at ~60–70% effort.",
     cue:"Use proactively, not just after flares. Treat it as tendon-stiffness work and a primer — the evidence for it as a painkiller in the Achilles specifically has not held up."},

    {name:"Calf raises", badge:"req", mode:"reps", target:"15 reps", sets:3, est:100, defaultLevel:2,
     dose:"3 × 15, 90° gate with the wedge · SKIP on lift days — the gym raise replaces it · day after lifting, set 3 @ RPE 7",
     cue:"Bursitis (Aug 2026, eased Aug 23): on the LEFT, cap every set at RPE 8 — raised from 7 after a pain-free week, since these cause you no trouble and Carolyn wants them kept — and still stop at the first hint of the back-of-heel spot; the right keeps the normal prescription. 90° at the ankle only — no dorsiflexion past neutral, wedge in. Alternate straight-knee and bent-knee sets. 3 × 15 is the dose; the levels change how HARD 15 reps are, never how many. If you can grind out 25, you are training calf endurance, not the tendon — add load, don't add reps. First week on a new level, watch the next-morning stiffness rather than chasing RPE 9. Rolling volume: on a gym day the program's loaded raise REPLACES this outright; the day AFTER loaded gym raises, do this but land set 3 at RPE 7, not 9 — same rule as the day after a match.",
     levels:["Both legs, bodyweight. 3 sec up, 3 sec down, full contraction at the top. The floor — drop here on a bad morning.",
             "Single leg, bodyweight, 15 per side. The fallback for a trip where the load didn't come with you: one leg roughly doubles what two legs carry.",
             "Single leg with the ~40 lb load, 15 per side, 3 sec up / 3 sec down, set 3 landing at RPE 9. The RPE is the target; the weight is whatever reaches it.",
             "Single leg, ~40 lb, slower: 4 sec up, 2 sec hold at the top, 4 sec down. Same 15 reps, much more time at high strain. This is the rung to use when 40 lb stops being enough — time under load is the lever you still control.",
             "Single leg, loaded past 40 lb if you can improvise it — books in a pack, water. 8–10 per side. Tell Carolyn before this one: it is the first rung that leaves her rep prescription."]},

    {name:"Banded inversion (tib posterior)", badge:"req", mode:"reps", target:"15 reps", sides:2, sets:2, est:50,
     dose:"2×15 per foot (3×15 gym days)",
     detail:"Band around inside of forefoot (big-toe side), anchored to your outside. Pull foot INWARD — sole turns toward midline. 2 sec in, hold, 2 sec back.",
     cue:"Primary treatment for the medial point, not a supplement. Historically your most under-delivered item — that is why it runs on both days. Bursitis (Aug 2026): these have been causing a little pain — Carolyn's rule (Aug 21): first shrink the range or band tension until they're pain-free; if they can't be made pain-free, they may continue only under 3/10 AND with nothing lingering afterwards — over either line, cut them until the next check-in."},

    {group:"Day A — ankle & arch", variant:0, name:"Banded eversion (peroneals)",
     mode:"reps", target:"15 reps", sides:2, sets:2, est:50,
     dose:"2×15 per foot",
     detail:"Band around outside of forefoot (little-toe side), anchored to your inside. Push foot OUTWARD — sole turns away from midline. Slow and controlled.",
     cue:"Lateral ankle stability for soccer and uneven ground. This is the item that pushes Day A past 10 min — if you need the time back, drop to 1×15 per foot. It is the only thing on this day neither your card nor Carolyn flags as non-negotiable. Bursitis (Aug 2026): same rule as the inversion work — pain-free range first; under 3/10 and nothing lingering, or cut it."},

    {variant:0, name:"Short foot (arch)", badge:"opt", mode:"reps", target:"10 holds × 5 sec", sides:2, est:50,
     dose:"1 × 10 holds, 5 sec each, per foot",
     detail:"Barefoot. Without curling toes (toes stay flat), draw the ball of the foot toward the heel. Arch lifts ~0.5 cm.",
     cue:"Also covered by the inversion band work + Kayanos. Don't let this one balloon the routine."},

    {group:"Day B — knee", variant:1, name:"Quad tendon loading", badge:"req", mode:"time", sec:45,
     dose:"45 sec, ~70% effort · set 1 of 2",
     cue:"For the right knee. Fingertip tenderness at the top-outer corner of the kneecap is the vastus lateralis part of the quad tendon insertion — so load the quad, don't chase the IT band. Rule: pain ≤3–4/10 while loading and back to normal next morning means keep going. Over that twice in a week, drop a level for a week. The second set comes after the balance work — the gap between them is deliberate.",
     levels:["Wall sit, back flat on the wall, thighs around 60° — shallower if the knee grumbles. Both feet.",
             "Band looped behind the knees, Spanish-squat style, torso upright.",
             "Single-leg wall sit, or a split-squat hold with the back foot on a chair.",
             "Move off the isometric: slow split squats or step-downs, 3 sec down / 3 sec up, 3 × 8. Isometrics settle a tendon; heavy slow reps are what rebuild it."]},

    {variant:1, name:"Single-leg balance", badge:"opt", mode:"time", sec:30, sides:2,
     dose:"30 sec per side",
     detail:"Stand on one foot, slight knee bend, tripod foot, quiet the wobble.",
     cue:"Progress: stable floor → towel/pillow → eyes closed. Cheapest ankle-sprain insurance there is. Here it earns a second job: the recovery gap between the two wall-sit sets."},

    {variant:1, name:"Quad tendon loading", tag:"2nd round", badge:"req", mode:"time", sec:45,
     dose:"45 sec, ~70% effort · set 2 of 2",
     cue:"Set two, recovered rather than straight off the back of set one. Same level, same 70% effort, same pain rule.",
     levels:["Wall sit, back flat on the wall, thighs around 60° — shallower if the knee grumbles. Both feet.",
             "Band looped behind the knees, Spanish-squat style, torso upright.",
             "Single-leg wall sit, or a split-squat hold with the back foot on a chair.",
             "Move off the isometric: slow split squats or step-downs, 3 sec down / 3 sec up, 3 × 8. Isometrics settle a tendon; heavy slow reps are what rebuild it."]},

    /* Parked by the bursitis (Aug 2026). `paused` keeps them off the run and
       out of the totals; delete the flag when Carolyn clears them. */
    {variant:0, paused:true, name:"Knee-to-wall test", badge:"opt", mode:"reps", target:"measure LEFT", est:40,
     dose:"PAUSED — bursitis (Aug 2026). Skip.",
     detail:"Toe near wall, drive knee forward to touch, heel flat. Brief contact — measure, don't stretch. Note whether the stop is a painless BONY block or a painful/stiff tendon limit.",
     cue:"PAUSED for the bursitis: this test drives the left ankle to end-range loaded dorsiflexion — exactly the position that compresses the bursa — so the measurement itself is a provocation right now. It returns, same baseline and traffic lights, when the sports-med visit clears it. (Old rule for reference: track LEFT vs your quiet-day ~5.5\", not the R–L gap. Green: ≥5.0\" + painless bony end-feel · Yellow: 3.5–5.0\" or pain at end range · Red: <3.5\" or sharp pain.)"},

    {variant:1, paused:true, name:"Mini-pogos", badge:"new",
     mode:"time", sec:20, sets:2,
     dose:"PAUSED — bursitis (Aug 2026). Skip.",
     cue:"PAUSED until the sports-med visit — no plyometrics of any kind while the bursa is angry; the strength program's jumps are pulled for the same reason. Remove the pause and resume at your old level when running is cleared. Old rule: SKIP THIS THE DAY YOU PLAY AND THE DAY AFTER — the match already was your spring session, and these want 48 hours between. The block exists to fill the four or five days you don't play, so a match is never the only spring loading you get. Heel loud on landing → stay at this level. Heel lifts in.",
     levels:["Both feet, small and low. Short ground contact, action at the ankle, knees nearly straight.",
             "Both feet, then add 10 sec per side single-leg after each set.",
             "Both feet, 15 sec per side single-leg, then a few low forward bounds."]}
  ]
},
{
  id:"pregym", name:"Pre-gym — lift prep", short:"Pre-gym", accent:"#8FBFA6", sched:{freq:"gym"},
  sub:"The three moves before a lift, on the days the calendar has one — it follows the session if you drag the session. General prep, injury prevention, nothing more. Do it last, so it leads straight into the bar: on Today, drag it onto whatever you're doing first.",
  blocks:[
    {name:"Squat-to-stand", mode:"reps", target:"6 reps", est:45,
     dose:"6 slow reps",
     detail:"Feet shoulder-width. Hinge down and take hold of your toes with the legs near-straight, then pull the hips down into a deep squat — chest up, knees pushed out by the elbows. Pause a breath, lift the hips back up to the hamstring stretch, and stand tall.",
     cue:"Ankles, hips and T-spine in one move. Bursitis (Aug 2026): the bottom of the squat is deep dorsiflexion, the bursa's compression zone — do these in shoes with the heel lifts in, and stop the descent where the back of the left heel stays quiet."},
    {name:"World's greatest stretch", mode:"time", sec:80,
     dose:"80 sec · alternating sides",
     detail:"Step into a long lunge, both hands to the floor inside the front foot. Sink the hips for a breath, then rotate the inside arm up toward the ceiling, eyes following the hand. Step back, swap legs, keep alternating.",
     cue:"Hips, groin and upper-back rotation in one package — the closest thing to a general warm-up for everything the bar will ask."},
    {name:"Scapular wall slides", mode:"reps", target:"8 reps", est:40,
     dose:"8 slow reps",
     detail:"Back against a wall, arms in a goalpost, forearms and backs of the wrists as close to the wall as they'll go. Slide the arms up overhead and back down without the low back arching away from the wall.",
     cue:"Primes the shoulders and upper back for pressing, rowing and pull-ups without loading anything. If the wrists can't reach the wall, work where you are — that range is part of what this trains."}
  ]
},
{
  id:"ql", name:"QL flare — extra dose", short:"QL", accent:"#7FA8C9", onDemand:true, sched:{freq:"onDemand"},
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
  id:"warmup", name:"Pre-soccer warm-up", short:"Warm-up", accent:"#8FBF6B", onDemand:true, sched:{freq:"onDemand"},
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
},
{
  id:"postrun", name:"Post-run — stretch", short:"Post-run", accent:"#C98F8F", sched:{freq:"onDemand"},
  sub:"After any run, while still warm — 5 minutes standard, the 10-minute version when there's time or the run was long. Your Aug 2026 ask, built for the return to running. ONE HARD RULE for the bursitis: no straight-knee calf stretching and nothing that pulls the LEFT ankle past 90° — the classic heel-drop stretch is exactly the compression everything else avoids. Everything moves; nothing hangs at end range.",
  variants:["5 min","10 min"], variantTags:["the core","+ trunk & soleus"],
  blocks:[
    {group:"The core four", name:"Standing quad stretch", mode:"time", sec:40, sides:2, dose:"40 sec per side, pulsing",
     detail:"Standing on one leg (fingertips on a wall), catch the other ankle behind you. Knees together, pelvis tucked under — then pull gently for 3–4 seconds, release an inch, pull again. A slow pulse, not one long hang.",
     cue:"The quads just absorbed every landing. The pelvic tuck is what points the stretch at the quad instead of the low back."},
    {name:"Half-kneeling lunge", mode:"time", sec:40, sides:2, dose:"40 sec each side, rocking",
     detail:"Kneel on one knee, front foot flat, torso tall. Tuck the pelvis under, squeeze the glute on the kneeling side, then rock gently forward 2–3 seconds and back. Keep the tuck the whole time.",
     cue:"Running shortens the hip flexors rep by rep. Same move as the morning routine — here it undoes the run instead of the night."},
    {name:"Standing hamstring hinge", mode:"time", sec:40, sides:2, dose:"40 sec per side, easing in and out",
     detail:"One heel forward on the ground, leg long, toes up. Hands on the back hips, hinge the chest forward over the long leg with a FLAT back until the hamstring speaks, ease back out. Slow repeats, never bouncing.",
     cue:"Hinge from the hip, not the spine — the stretch should live behind the thigh, not in the low back. Toes-up is enough; don't yank the foot toward you."},
    {name:"Figure-4 glute stretch", mode:"time", sec:40, sides:2, dose:"40 sec per side, pulsing",
     detail:"On your back, one ankle crossed over the opposite knee. Pull the far thigh gently toward you for 3–4 seconds, release an inch, pull again — a slow pulse rather than one long hang.",
     cue:"The glutes and deep rotators do the stabilising every stride. Same pulse as everywhere else in the system."},

    {group:"The extension — trunk & soleus", variant:1, name:"Adductor rock-back", mode:"time", sec:45, sides:2, dose:"45 sec per side",
     detail:"On hands and knees, extend one leg straight out to the side, foot flat, toes forward. Rock the hips slowly back toward the heel and return.",
     cue:"The groin takes more of a run than it gets credit for. Slow rocking, never a static end-range hang."},
    {variant:1, name:"Dynamic QL side bend", mode:"time", sec:60, dose:"60 sec · alternating sides, flowing",
     detail:"Stand tall. Reach one arm overhead, push the same-side hip OUT as you lean away, ride the bend for 2–3 seconds, come back to tall — then swap arms and bend the other way.",
     cue:"The trunk carried you the whole way. The hip shift is the whole exercise."},
    {variant:1, name:"90/90 seated rotation", mode:"time", sec:60, dose:"60 sec · alternating sides",
     detail:"Seated, both knees bent to 90° — one leg in front, one to the side. Rotate the torso slowly through range over the front leg, pause at end range, then swing both knees through center to the other side. No forcing.",
     cue:"Rotation unwinds what a straight-line run winds up."},
    {variant:1, name:"Bent-knee soleus stretch", tag:"RIGHT only", mode:"time", sec:40, dose:"40 sec · right leg ONLY",
     detail:"Facing a wall, RIGHT foot back a half-step, both knees bent, right heel down. Sink the hips down and slightly forward until the stretch lands low in the right calf, ease in and out.",
     cue:"RIGHT LEG ONLY while the bursitis heals — on the left this exact position is the compression that flared it, so the left calf gets its length from the 90°-gated raises instead. When Carolyn clears end-range dorsiflexion, the left side rejoins."}
  ]
}
];
