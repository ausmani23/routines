/* ============================================================ STRENGTH ============================================================
   Set-by-set logging for the lifting days. Loaded AFTER app.js — it depends on
   db / saveDB / go / ping / mmss / $ from there, and on PROGRAM from program.js.

   Three things carry the design:
   - Every field proposes a value before anything is typed: last session's
     number for that set, else the program's `suggest`. A proposal is rendered
     dimmed and is NOT logged until the set is ticked or the field edited —
     the tick is the "did it as written" gesture.
   - Nothing is required. A blank set is simply not logged; the point is a
     record honest enough to program from, not a complete one.
   - Storage is ALWAYS in lbs (mirroring Hevy's weight_lbs column). kg exists
     only at the display surface — see the units section.
   ============================================================ */

/* ---------- shape of the stored log ----------
   db.strength.sessions: newest last.
     { w, sid, block, week, start, end, note, mins, exNotes,
       sets:[{ex, n, weight, reps, distance, duration, rpe}] }
   `sid` is the schedule slot it was logged against (see schedule.js) and may
   be absent — sessions logged before the calendar existed simply lack it, and
   anything opened from Browse has no slot to record.
   `ex` is the exercise name and `n` the set number, so history survives a
   workout being reordered or renamed.
   `mins` is the self-reported session length (he times on the Garmin — the
   app deliberately does not trust its own elapsed clock, which once claimed a
   long evening for a 70-minute workout because the tab stayed open).
   `exNotes` is {exerciseName: text} — per-lift notes, exported under the lift.

   Every key is optional — a set records only the fields its exercise declares
   (see FIELDS below), so a barbell set and a running interval share one shape.
   That shape deliberately mirrors Hevy's CSV columns (weight_lbs, reps,
   distance_miles, duration_seconds, rpe), which keeps import/export honest.
   Sessions logged before distance/duration existed simply lack those keys.

   db.strength.hist: flat imported history, [{ex, d:"YYYY-MM-DD", w, r}] —
   written only by the Hevy-CSV import on the Notes screen, read only by the
   per-lift history panel. Replaced wholesale on each import. */
function sessions(){ return (db.strength && db.strength.sessions) || []; }

/* ---------- what a set can record ----------
   An exercise declares `fields`; omitted means lifting. `labels` re-heads a
   column without inventing a new field type (the daily check-in uses it to
   show MINUTES / PAIN over duration / rpe). */
const FIELDS = {
  weight:   { label:"WEIGHT", ph:"wt",   mode:"decimal" },
  reps:     { label:"REPS",   ph:"reps", mode:"numeric" },
  distance: { label:"DIST",   ph:"m",    mode:"decimal" },
  duration: { label:"TIME",   ph:"m:ss", mode:"text"    },
  rpe:      { label:"RPE",    ph:"rpe",  mode:"decimal" }
};
const LIFT_FIELDS = ["weight","reps","rpe"];
function exFields(e){ return (e && e.fields) || LIFT_FIELDS; }
function fieldLabel(e,k){ return (e.labels && e.labels[k]) || FIELDS[k].label; }
function fieldPh(e,k){ return (e.phs && e.phs[k]) || FIELDS[k].ph; }

/* ---------- units ----------
   Canonical weight is lbs, always — the log, the export and `suggest` never
   change meaning when the toggle flips. kg exists only in what the weight
   fields show and accept, so he can flip mid-workout in a kg gym and every
   number (prev column, proposals, already-typed sets) converts in place. */
const LB_PER_KG = 2.20462;
function unitKg(){ return db.unit === "kg"; }
function wOut(v){                       // canonical lbs → what the field shows
  const n = parseFloat(v);
  if(v == null || v === "" || isNaN(n)) return v == null ? "" : String(v);
  return unitKg() ? String(Math.round(n/LB_PER_KG*10)/10) : String(v);
}
function wIn(v){                        // what was typed → canonical lbs
  const n = parseFloat(v);
  if(v === "" || isNaN(n)) return v;
  return unitKg() ? String(Math.round(n*LB_PER_KG*10)/10) : v;
}
function paintUnit(){ const b=$("#lUnit"); if(b) b.textContent = unitKg() ? "kg" : "lb"; }

/* One previous set, rendered for the PREV column. Weight+reps get the familiar
   "225×8" treatment; everything else is joined plainly. */
function fmtPrev(e, p){
  if(!p) return "—";
  const f = exFields(e), out = [];
  if(f.includes("weight") && f.includes("reps")) out.push(`${p.weight?wOut(p.weight):"bw"}×${p.reps||"—"}`);
  else if(f.includes("weight") && p.weight) out.push(wOut(p.weight));
  else if(f.includes("reps") && p.reps) out.push(p.reps);
  if(f.includes("distance") && p.distance) out.push(`${p.distance}m`);
  if(f.includes("duration") && p.duration) out.push(p.duration);
  /* "/" not " · ": this column is ~70px on a phone and a run needs to fit
     distance, time and RPE in it without ellipsing. */
  let s = out.join("/") || "—";
  if(f.includes("rpe") && p.rpe) s += ` @${p.rpe}`;
  return s;
}

/* Most recent session of this workout — for the card's "last done" line. */
function lastSession(wid){
  const s = sessions().filter(x=>x.w===wid);
  return s.length ? s[s.length-1] : null;
}
/* Most recent logged sets for one exercise, from ANY workout, so a lift that
   moves between days (or gets added ad hoc on the road) keeps its history. */
function lastSetsFor(name){
  const all = sessions();
  for(let i=all.length-1; i>=0; i--){
    const hit = all[i].sets.filter(s=>s.ex===name);
    if(hit.length) return { when:all[i].end||all[i].start, sets:hit };
  }
  return null;
}
function setAt(hist, n){ return hist && hist.sets.find(s=>s.n===n); }
/* The most recent per-exercise note left for this lift, for the "last note"
   line — this is the other half of "my notes vanished": they saved fine, but
   nothing ever showed them back. */
function lastExNote(name){
  const all = sessions();
  for(let i=all.length-1; i>=0; i--){
    if(all[i].exNotes && all[i].exNotes[name]) return all[i].exNotes[name];
  }
  return null;
}

/* What a field proposes before anything is typed: last session's value for
   this set number, else the program's `suggest`. Canonical units (lbs). */
function suggestFor(e, k, p){
  if(p && p[k]) return String(p[k]);
  if(e.suggest && e.suggest[k] != null) return String(e.suggest[k]);
  return "";
}

function programWeek(){
  if(!PROGRAM.start) return PROGRAM.week||1;
  const started = dayOf(new Date(PROGRAM.start+"T00:00:00").getTime());
  const w = Math.floor((dayOf(Date.now())-started)/(7*DAY)) + 1;
  return Math.max(1, w);
}
function workingSets(w){ return w.exercises.reduce((a,e)=>a+(e.warmup?0:(e.sets||0)),0); }

/* ---------- the card ----------
   Rendered into whichever list screen asked for it — Today, Upcoming or
   Browse. `opts.sid` is the scheduled slot it came from (null when it came
   from Browse), `opts.done` marks it finished for that day, `opts.when` adds a
   scheduling line. Mirrors cardHTML in app.js so both kinds of card can sit in
   one list. */
function workoutCardHTML(w, opts){
  opts = opts || {};
  const last = lastSession(w.id);
  const n = workingSets(w), ex = w.exercises.length;
  const unit = w.unit || "lift";   // "drill" on conditioning days, "check" on the check-in
  return `
    <button class="card${opts.done?" is-done":""}" data-w="${w.id}"
      ${opts.sid?`data-sid="${opts.sid}"`:""} style="--accent:${w.accent||'#C97F5B'}">
      ${opts.done?`<span class="tickmark">✓</span>`:""}
      <h2>${w.name}</h2><div class="sub">${w.sub||""}</div>
      <div class="meta">
        ${ex ? `<span><b>${ex}</b> ${unit}${ex===1?"":"s"}</span>
                ${n?`<span class="moves"><b>${n}</b> ${n===1?"set":"sets"}</span>`:""}`
             : `<span><b>Open</b> log as you go</span>`}
      </div>
      ${opts.when?`<div class="whenline">${esc(opts.when)}</div>`:""}
      <div class="did">${last
        ? `Last done <b>${fmtLast(dayOf(last.end||last.start))}</b> · <b>${last.sets.length}</b> sets logged`
        : "Not yet logged"}</div>
    </button>`;
}

/* ---------- session state ----------
   `ex` is a working copy of the programmed exercises so sets can be added and
   substitutions made without touching PROGRAM. `entries` is keyed
   "exIndex|setIndex" and is the single source of truth for what is typed —
   the DOM is rebuilt from it on every structural change. A rendered proposal
   is NOT in `entries`; only typing or ticking puts it there. */
let lift = { w:null, sid:null, ex:[], entries:{}, exNotes:{}, histOpen:{}, startedAt:0 };

/* `sid` is the scheduled slot this was opened from, so the same workout on two
   different days ticks off independently. Null when opened from Browse. */
function openLift(id, sid){
  const w = PROGRAM.workouts.find(x=>x.id===id); if(!w) return;
  lift.w = w;
  lift.sid = sid || null;
  lift.ex = (w.exercises||[]).map(e=>Object.assign({}, e, {sets:e.sets||3}));
  lift.entries = {};
  lift.exNotes = {};
  lift.histOpen = {};
  lift.startedAt = Date.now();
  if(typeof setNoteCtx === "function") setNoteCtx({ kind:"workout", id:w.id, name:w.name });
  document.documentElement.style.setProperty("--signal", w.accent||"#C97F5B");
  $("#lName").textContent = w.name;
  $("#lSub").textContent = w.sub || "";
  $("#lNote").value = "";
  const dur = $("#lDur"); if(dur) dur.value = "";
  /* Surface last time's session note on the way in — a note you can't ever
     see again is a note that "didn't save". */
  const last = lastSession(w.id), lp = $("#lPrev");
  if(lp){
    lp.hidden = !(last && last.note);
    lp.textContent = last && last.note ? `Last time — “${last.note}”` : "";
  }
  paintUnit();
  renderLift();
  go("lift");
}

function entry(e,s){ return lift.entries[`${e}|${s}`] || (lift.entries[`${e}|${s}`] = {}); }

/* RPE can only be 0–10 (the check-in reuses the column as a pain score, which
   is what keeps 0 in range) — so it is a dropdown, not a keyboard. */
function rpeSelect(e, ei, si, val, sugg){
  const shown = val || sugg;
  let opts = `<option value=""${shown===""?" selected":""}>${esc(fieldPh(e,"rpe"))}</option>`;
  for(let v=0; v<=10; v+=0.5){
    const s = (v%1) ? v.toFixed(1) : String(v);
    opts += `<option value="${s}"${shown===s?" selected":""}>${s}</option>`;
  }
  return `<select class="fld${!val && shown ? " sugg":""}" data-e="${ei}" data-s="${si}" data-k="rpe"
    aria-label="${esc(fieldLabel(e,"rpe"))}, set ${si+1}">${opts}</select>`;
}

/* ---------- per-lift history ----------
   Tap a lift's name for the Hevy-style view: rep records, estimated 1RM
   (Epley) over time, recent sessions. Reads the in-app log plus whatever the
   Hevy import supplied. Matching is by normalised name, so Hevy's
   "Deadlift (Barbell)" and the program's "Deadlift" are one lift. */
function normEx(s){
  return String(s).toLowerCase().replace(/\(.*?\)/g," ").replace(/[^a-z0-9]+/g," ").trim();
}
function historyFor(name){
  const key = normEx(name), byDay = {};
  const add = (d,w,r)=>{ if(!isNaN(w)&&!isNaN(r)&&r>0) (byDay[d]=byDay[d]||[]).push({w,r}); };
  sessions().forEach(s=>{
    s.sets.forEach(x=>{
      if(normEx(x.ex)===key) add(isoDay(s.end||s.start), parseFloat(x.weight), parseInt(x.reps,10));
    });
  });
  /* history.js — the baked-in past (Hevy + the Paul Read log), committed to
     the repo as bare [ex, date, lbs, reps] rows. See make_history.py. */
  (typeof HISTORY !== "undefined" ? HISTORY : []).forEach(h=>{
    if(normEx(h[0])===key) add(h[1], h[2], h[3]);
  });
  /* …plus anything pasted in through the Notes-screen Hevy import since the
     last regeneration. Overlap with HISTORY is harmless: records and the
     trend are max-per-day, so duplicates change nothing. */
  ((db.strength && db.strength.hist)||[]).forEach(h=>{
    if(normEx(h.ex)===key) add(h.d, h.w, h.r);
  });
  return Object.keys(byDay).sort().map(d=>({d, sets:byDay[d]}));
}
function e1rm(w,r){ return w*(1+r/30); }   // Epley — same estimate Hevy uses
function sparkHTML(vals){
  if(vals.length<2) return "";
  const W=280, H=40, min=Math.min(...vals), max=Math.max(...vals), span=(max-min)||1;
  const pts = vals.map((v,i)=>
    `${(i/(vals.length-1)*W).toFixed(1)},${(H-4-(v-min)/span*(H-8)).toFixed(1)}`);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
    aria-hidden="true"><polyline points="${pts.join(" ")}"/></svg>`;
}
function histHTML(e){
  const days = historyFor(e.name);
  if(!days.length) return `<div class="hist">No logged history for this lift yet —
    it starts filling in the first time you log it (or import your Hevy CSV on the Notes screen).</div>`;
  const u = unitKg() ? "kg" : "lb";
  /* best weight for each rep count, and the best estimated 1RM overall */
  const repBest = {};
  let best = null;
  days.forEach(day=>day.sets.forEach(s=>{
    if(!repBest[s.r] || s.w > repBest[s.r]) repBest[s.r] = s.w;
    if(!best || e1rm(s.w,s.r) > e1rm(best.w,best.r)) best = s;
  }));
  const recs = Object.keys(repBest).map(Number).sort((a,b)=>a-b).slice(0,12)
    .map(r=>`<span><b>${r}</b> × ${wOut(repBest[r])}</span>`).join("");
  const trend = days.map(day=>Math.max(...day.sets.map(s=>e1rm(s.w,s.r))));
  const recent = days.slice(-3).reverse().map(day=>
    `<div class="hist-day"><s>${day.d}</s> ${day.sets.map(s=>`${wOut(s.w)}×${s.r}`).join(", ")}</div>`).join("");
  return `<div class="hist">
    <div class="big">Est. 1RM <b>${wOut(Math.round(e1rm(best.w,best.r)))} ${u}</b>
      <s>from ${wOut(best.w)}×${best.r} · ${days.length} session${days.length>1?"s":""}</s></div>
    ${sparkHTML(trend)}
    <p class="hist-cap">Best weight per rep count (${u})</p>
    <div class="reprec">${recs}</div>
    ${recent}
  </div>`;
}

function renderLift(){
  $("#lBody").innerHTML = lift.ex.map((e,ei)=>{
    const hist = lastSetsFor(e.name);
    const f = exFields(e);
    /* `target` overrides the composed line — a run's prescription ("2 min @
       RPE 7") doesn't decompose into reps/rpe/load the way a lift's does. */
    const target = e.target || [e.reps?`${e.reps} reps`:"", e.rpe?`RPE ${e.rpe}`:"", e.load||""]
      .filter(Boolean).join(" · ");
    const rows = Array.from({length:e.sets}, (_,si)=>{
      const en = entry(ei,si), p = setAt(hist, si+1);
      const inputs = f.map(k=>{
        if(k==="rpe") return rpeSelect(e, ei, si, en.rpe||"", suggestFor(e,"rpe",p));
        const meta = FIELDS[k];
        const typed = en[k]||"", sugg = suggestFor(e,k,p);
        const raw = typed || sugg;
        const shown = k==="weight" ? wOut(raw) : raw;
        const ph = (p && p[k]) || fieldPh(e,k);
        return `<input class="fld${!typed && sugg ? " sugg":""}" data-e="${ei}" data-s="${si}" data-k="${k}"
          inputmode="${meta.mode}" placeholder="${esc(ph)}" value="${esc(shown)}"
          aria-label="${esc(fieldLabel(e,k))}, set ${si+1}">`;
      }).join("");
      return `<div class="setrow${en.done?" logged":""}" style="--nf:${f.length}">
        <div class="sn">${si+1}</div>
        <div class="prev">${esc(fmtPrev(e,p))}</div>
        ${inputs}
        <button class="tick-set" data-done="${ei}|${si}" aria-pressed="${!!en.done}">✓</button>
      </div>`;
    }).join("");
    const prevNote = lastExNote(e.name);
    const heads = f.map(k=>{
      const lbl = fieldLabel(e,k);
      return (k==="weight" && !(e.labels && e.labels.weight))
        ? `${esc(lbl)} · ${unitKg()?"KG":"LB"}` : esc(lbl);
    });
    return `<div class="lift-ex">
      <div class="lift-head">
        <button class="nm" data-hist="${ei}" aria-expanded="${!!lift.histOpen[ei]}">${esc(e.name)}${e.warmup?` <span class="badge opt">warm-up</span>`:""}<s class="histgo">${lift.histOpen[ei]?"▾":"▸"}</s></button>
        ${e.added?`<button class="exdel" data-del="${ei}" aria-label="Remove ${esc(e.name)}">✕</button>`:""}
      </div>
      ${target?`<div class="dose">${esc(target)}</div>`:""}
      ${e.note?`<div class="cue">${esc(e.note)}</div>`:""}
      ${hist?`<div class="histline">Last time · ${fmtLast(dayOf(hist.when))}</div>`:""}
      ${prevNote?`<div class="cue exn-prev">Last note · ${esc(prevNote)}</div>`:""}
      ${lift.histOpen[ei]?histHTML(e):""}
      <div class="sethead" style="--nf:${f.length}"><div class="sn">SET</div><div class="prev">PREV</div>
        ${heads.map(h=>`<div>${h}</div>`).join("")}<div></div></div>
      ${rows}
      <button class="addset" data-add="${ei}">+ set</button>
      <input class="exnote" data-xn="${ei}" placeholder="Note for this exercise — machine, grip, pain…"
        value="${esc(lift.exNotes[ei]||"")}" aria-label="Note for ${esc(e.name)}">
    </div>`;
  }).join("") + `
    <div class="addex">
      <input id="exName" placeholder="Add an exercise…" aria-label="New exercise name">
      <button id="exAdd">Add</button>
    </div>`;

  $("#lBody").querySelectorAll(".fld").forEach(el=>{
    el.oninput = ()=>{
      const k = el.dataset.k, v = el.value.trim();
      entry(+el.dataset.e, +el.dataset.s)[k] = (k==="weight") ? wIn(v) : v;
      el.classList.remove("sugg");
    };
  });
  $("#lBody").querySelectorAll("[data-done]").forEach(el=>{
    el.onclick = ()=>{ const [ei,si] = el.dataset.done.split("|").map(Number); toggleSet(ei,si); };
  });
  $("#lBody").querySelectorAll("[data-add]").forEach(el=>{
    el.onclick = ()=>{ lift.ex[+el.dataset.add].sets++; renderLift(); };
  });
  $("#lBody").querySelectorAll("[data-del]").forEach(el=>{
    el.onclick = ()=>{ removeExercise(+el.dataset.del); };
  });
  $("#lBody").querySelectorAll("[data-hist]").forEach(el=>{
    el.onclick = ()=>{ const i=+el.dataset.hist; lift.histOpen[i]=!lift.histOpen[i]; renderLift(); };
  });
  $("#lBody").querySelectorAll(".exnote").forEach(el=>{
    el.oninput = ()=>{ lift.exNotes[+el.dataset.xn] = el.value; };
  });
  $("#exAdd").onclick = addExercise;
  $("#exName").onkeydown = e => { if(e.key==="Enter"){ e.preventDefault(); addExercise(); } };
  const n = loggedSets().length;
  $("#btnLiftDone").textContent = n ? `Finish & log · ${n} ${n===1?"set":"sets"}` : "Finish";
}

/* Ticking a set is also the "as proposed" shortcut: anything still blank
   inherits the proposal (last session's number, else the program's suggest),
   so a set done as written is one tap. */
function toggleSet(ei,si){
  const e = lift.ex[ei], en = entry(ei,si);
  if(en.done){ en.done = false; renderLift(); return; }
  const p = setAt(lastSetsFor(e.name), si+1);
  exFields(e).forEach(k=>{ const s = suggestFor(e,k,p); if(!en[k] && s) en[k] = s; });
  en.done = true;
  renderLift();
  ping(760,.09,.18);
}

function addExercise(){
  const el = $("#exName"), name = el.value.trim();
  if(!name) return;
  lift.ex.push({ name, sets:3, added:true });
  el.value = "";
  renderLift();
  const cards = $("#lBody").querySelectorAll(".lift-ex");
  if(cards.length) cards[cards.length-1].scrollIntoView({block:"center"});
}
/* Removing an exercise has to shift every entry above it down a slot, or the
   typed numbers would silently re-attach to the wrong lift. Same for the
   per-exercise notes. */
function removeExercise(ei){
  lift.ex.splice(ei,1);
  const next = {};
  Object.keys(lift.entries).forEach(k=>{
    const [e,s] = k.split("|").map(Number);
    if(e === ei) return;
    next[`${e>ei?e-1:e}|${s}`] = lift.entries[k];
  });
  lift.entries = next;
  const notes = {};
  Object.keys(lift.exNotes).forEach(k=>{
    const e = +k;
    if(e === ei) return;
    notes[e>ei?e-1:e] = lift.exNotes[k];
  });
  lift.exNotes = notes;
  lift.histOpen = {};
  renderLift();
}

/* ---------- finishing ----------
   A set counts as logged if it has any typed or ticked content. Proposals
   showing in untouched fields are NOT content — they never reach `entries` —
   so a workout you open and abandon stores nothing. */
function loggedSets(){
  const out = [];
  lift.ex.forEach((e,ei)=>{
    const f = exFields(e);
    for(let si=0; si<e.sets; si++){
      const en = lift.entries[`${ei}|${si}`];
      if(!en || !f.some(k=>en[k])) continue;
      const rec = { ex:e.name, n:si+1 };
      f.forEach(k=>{ rec[k] = en[k]||""; });
      out.push(rec);
    }
  });
  return out;
}
function finishLift(){
  const sets = loggedSets();
  const note = $("#lNote").value.trim();
  const exNotes = {};
  lift.ex.forEach((e,ei)=>{
    const t = (lift.exNotes[ei]||"").trim();
    if(t) exNotes[e.name] = t;
  });
  const hasExNotes = Object.keys(exNotes).length > 0;
  /* Session length is self-reported (Garmin), never the app's elapsed clock. */
  const durEl = $("#lDur");
  const mins = durEl ? parseInt(durEl.value, 10) : NaN;
  if(sets.length || note || hasExNotes){
    db.strength = db.strength || { sessions:[] };
    const s = {
      w: lift.w.id, sid: lift.sid, wName: lift.w.name, block: PROGRAM.block, week: programWeek(),
      start: lift.startedAt, end: Date.now(), note, sets
    };
    if(hasExNotes) s.exNotes = exNotes;
    if(mins > 0) s.mins = mins;
    db.strength.sessions.push(s);
    saveDB();
  }
  showDone(lift.w.name,
    sets.length ? `${sets.length} sets logged${mins>0?` · ${mins} min`:""}.` : "Nothing logged — session discarded.",
    sets.length ? "Ready for Sunday." : "");
}

/* ---------- export ----------
   Markdown rather than JSON: it is what actually gets pasted into a
   conversation on Sunday, and it stays readable in the repo afterwards.

   A stored set carries only the keys its exercise declared, and the exercise
   definition is long gone by export time — so format from what is actually
   present rather than from a assumed shape. "1200 m in 4:26 @8", "225×8 @7",
   "45s". Weights export as stored — lbs — whatever the display toggle says. */
function fmtLoggedSet(x){
  const has = k => x[k] != null && x[k] !== "";
  const out = [];
  if(has("weight") || has("reps")) out.push(`${x.weight||"bw"}×${has("reps")?x.reps:"?"}`);
  if(has("distance")) out.push(`${x.distance} m`);
  if(has("duration")) out.push(has("distance") ? `in ${x.duration}` : x.duration);
  return (out.join(" ") || "—") + (has("rpe") ? ` @${x.rpe}` : "");
}
function strengthExportMD(sinceDays){
  const cut = sinceDays ? Date.now() - sinceDays*DAY : 0;
  const ss = sessions().filter(s=>(s.end||s.start) >= cut);
  if(!ss.length) return "_No strength sessions logged._\n";
  return ss.map(s=>{
    const d = new Date(s.end||s.start);
    const head = `### ${d.toISOString().slice(0,10)} — ${s.wName||s.w} (${s.block||"?"}, week ${s.week||"?"})`
      + (s.mins ? ` · ${s.mins} min` : "");
    const byEx = [];
    s.sets.forEach(x=>{
      let g = byEx.find(y=>y.ex===x.ex);
      if(!g) byEx.push(g = {ex:x.ex, sets:[]});
      g.sets.push(x);
    });
    /* exercises that only got a note still deserve a line */
    if(s.exNotes) Object.keys(s.exNotes).forEach(ex=>{
      if(!byEx.find(y=>y.ex===ex)) byEx.push({ex, sets:[]});
    });
    const body = byEx.map(g=>{
      let line = `- **${g.ex}**` + (g.sets.length ? ` — ${g.sets.map(fmtLoggedSet).join(", ")}` : "");
      const n = s.exNotes && s.exNotes[g.ex];
      if(n) line += `\n  - _${n.replace(/\s*\n\s*/g," / ")}_`;
      return line;
    }).join("\n");
    return head + "\n" + body + (s.note?`\n\n> ${s.note}`:"");
  }).join("\n\n") + "\n";
}

onClick("#btnLiftDone", finishLift);
onClick("#lUnit", ()=>{
  db.unit = unitKg() ? "lb" : "kg";
  saveDB();
  paintUnit();
  if(lift.w && state.screen==="lift") renderLift();
});

/* app.js renders Today before this file has loaded, so its workout cards come
   out empty. Render it once more now that workoutCardHTML exists. */
if(typeof renderHome === "function") renderHome();
