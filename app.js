/* ============================================================ ENGINE ============================================================
   Data lives in routines.js (const ROUTINES). This file should not need
   edits for content changes.
   Load-bearing invariants:
   - Wall-clock timing: position derives from Date.now() vs state.endsAt
     (resync()), never from counting ticks. Don't refactor to a decrement.
   - Audio must be unlocked by a user gesture (unlockAudio on Start).
   - Cues for timed runs are scheduled ahead on the AudioContext clock
     (scheduleAhead), so they fire even if JS is throttled in background.
   ============================================================ */
const $ = s => document.querySelector(s);
const PREP = 5;
let state = { routine:null, variant:0, moves:0, seq:[], i:0, left:0, up:0, total:0, running:false,
  tick:null, wake:null, endsAt:null, startedAt:0 };

/* ---------- persistence ----------
   One localStorage key.
   exLevels: per-routine, per-exercise level (keyed by block name, so repeated
             blocks like "Dead bug — 2nd round" share one level).
   levels:   legacy routine-wide level — kept only as a migration fallback.
   variantSel/variantDone: chosen and last-completed variant per routine.
   log: completion timestamps (epoch ms) per routine id. */
const DB_KEY = "routines.v1";
function loadDB(){
  const def = { sound:true, voice:true, levels:{}, exLevels:{}, variantSel:{}, variantDone:{}, log:{} };
  try{ return Object.assign(def, JSON.parse(localStorage.getItem(DB_KEY)||"{}")); }
  catch(e){ return def; }
}
const db = loadDB();
function saveDB(){ try{ localStorage.setItem(DB_KEY, JSON.stringify(db)); }catch(e){} }
let sound = db.sound !== false, voice = db.voice !== false;

const DAY = 864e5;
function dayOf(ts){ const d=new Date(ts); return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(); }
function stats(id){
  const ts = db.log[id]||[];
  if(!ts.length) return null;
  const days=[...new Set(ts.map(dayOf))].sort((a,b)=>b-a);
  let streak=0;
  const today=dayOf(Date.now());
  if(days[0]===today || days[0]===today-DAY){
    streak=1;
    for(let i=1;i<days.length;i++){ if(days[i]===days[i-1]-DAY) streak++; else break; }
  }
  return { count:ts.length, lastDay:days[0], streak };
}
function fmtLast(lastDay){
  const diff=Math.round((dayOf(Date.now())-lastDay)/DAY);
  return diff===0?"today":diff===1?"yesterday":`${diff} days ago`;
}

const NOSLEEP_MP4 = "data:video/mp4;base64,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";

/* ---------- audio ----------
   Cues for timed segments are SCHEDULED AHEAD on the AudioContext clock, so they
   still fire if the phone locks or the tab is backgrounded and JS stops ticking. */
let actx=null, scheduled=[];
function ctx(){
  actx = actx || new (window.AudioContext||window.webkitAudioContext)();
  if(actx.state==="suspended") actx.resume();
  return actx;
}
function toneAt(when, freq, dur, vol){
  if(!sound) return;
  try{
    const c=ctx(), o=c.createOscillator(), g=c.createGain();
    o.type="sine"; o.frequency.value=freq;
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(.0001, when+dur);
    o.connect(g); g.connect(c.destination);
    o.start(when); o.stop(when+dur);
    scheduled.push(o);
  }catch(e){}
}
function ping(freq=880, dur=.09, vol=.22){ try{ toneAt(ctx().currentTime+.01, freq, dur, vol); }catch(e){} }
function clearScheduled(){ scheduled.forEach(o=>{ try{o.stop();}catch(e){} }); scheduled=[]; }

/* Schedule every cue from segment `i` forward until a rep-gated segment or the end. */
function scheduleAhead(i, firstEndsAt){
  clearScheduled();
  if(!sound) return;
  let c; try{ c=ctx(); }catch(e){ return; }
  let t = c.currentTime + Math.max(0,(firstEndsAt-Date.now())/1000);
  for(let k=i+1; k<state.seq.length; k++){
    const prev=state.seq[k-1];
    if(prev.mode==="reps") return;
    toneAt(t-3,880,.07,.16); toneAt(t-2,880,.07,.16); toneAt(t-1,880,.07,.16);
    toneAt(t,660,.13,.2);
    const s=state.seq[k];
    if(s.mode==="reps") return;
    t += s.sec;
  }
  toneAt(t-3,880,.07,.16); toneAt(t-2,880,.07,.16); toneAt(t-1,880,.07,.16);
  toneAt(t,760,.14,.25); toneAt(t+.15,1010,.22,.25);
}
/* iOS mutes Web Audio when the ringer switch is on silent. Looping a silent
   HTML5 <audio> track during a run promotes the audio session to "media
   playback" (like a music app), which the mute switch doesn't silence.
   Runs only while a routine is active; started from the Start-tap gesture. */
let silentEl=null;
function silentWavURL(){ // 0.5 s of silence, 8 kHz mono 16-bit, built in memory
  const rate=8000, n=rate/2, buf=new ArrayBuffer(44+n*2), v=new DataView(buf);
  const w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVEfmt ");
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,rate,true); v.setUint32(28,rate*2,true);
  v.setUint16(32,2,true); v.setUint16(34,16,true);
  w(36,"data"); v.setUint32(40,n*2,true);
  return URL.createObjectURL(new Blob([buf],{type:"audio/wav"}));
}
function mediaSession(on){
  try{
    if(on){
      if(!silentEl){ silentEl=new Audio(silentWavURL()); silentEl.loop=true; }
      silentEl.play().catch(()=>{});
    }else if(silentEl){
      // grace period so the end-of-routine chime isn't re-muted mid-play
      setTimeout(()=>{ if(!state.running && silentEl) silentEl.pause(); }, 2500);
    }
  }catch(e){}
}

function say(t){ if(!voice||!window.speechSynthesis) return;
  try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=1.02; speechSynthesis.speak(u);}catch(e){} }
function unlockAudio(){ try{ ctx(); if(window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance("")); }catch(e){} }

/* ---------- keeping the screen on ----------
   Wake Lock is the real mechanism but needs a secure context (https:// or localhost).
   Opened as a local file it silently does nothing — hence the looping-video fallback,
   which holds the screen on in Safari and older Android browsers. */
let awakeMode="none";
async function keepAwake(on){
  const v=$("#nosleep");
  if(on){
    try{
      if("wakeLock" in navigator && window.isSecureContext){
        state.wake = await navigator.wakeLock.request("screen");
        awakeMode="wakelock";
      }
    }catch(e){ state.wake=null; }
    if(!state.wake){
      try{ if(!v.src) v.src=NOSLEEP_MP4; await v.play(); awakeMode="video"; }
      catch(e){ awakeMode="none"; }
    }
  }else{
    try{ if(state.wake){ state.wake.release(); state.wake=null; } }catch(e){}
    try{ v.pause(); }catch(e){}
  }
  paintAwakeStatus();
}
function paintAwakeStatus(){
  const el=$("#awakeStatus"); if(!el) return;
  if(window.isSecureContext && "wakeLock" in navigator)
    el.textContent = "Screen-lock prevention: on (wake lock).";
  else if(!window.isSecureContext)
    el.textContent = "Opened as a local file, so the browser won't grant a wake lock. A looping-video fallback is used instead. Host the file over https for the reliable version.";
  else
    el.textContent = "This browser has no wake lock; a looping-video fallback is used instead.";
}
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible" && state.running){ keepAwake(true); resync(); }
});

function go(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on", s.id===id));
  window.scrollTo(0,0);
  if(id!=="run"){ stopTick(); keepAwake(false); clearScheduled(); mediaSession(false); state.running=false; }
  if(id==="home") applySWReload();   // a deploy that landed mid-routine applies here
}
document.addEventListener("click", e=>{ const b=e.target.closest("[data-go]"); if(b) go(b.dataset.go); });

function mmss(t){ const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,"0")}`; }
function fmtMin(t){ return `${Math.round(t/60)} min`; }

/* ---------- per-exercise levels & routine variants ---------- */
function exLevel(r,b){
  if(!b.levels) return 0;
  const ex = db.exLevels[r.id]||{};
  let v = ex[b.name];
  if(v==null) v = b.defaultLevel;           // per-exercise starting point
  if(v==null) v = db.levels[r.id];          // migrate old routine-wide level
  if(v==null) v = r.defaultLevel||0;
  return Math.min(Math.max(v,0), b.levels.length-1);
}
function setExLevel(r,b,v){ (db.exLevels[r.id] = db.exLevels[r.id]||{})[b.name]=v; saveDB(); }
function activeBlocks(r,v){ return r.blocks.filter(b=>b.variant==null || b.variant===v); }
function defaultVariant(r){
  if(!r.variants) return 0;
  if(r.variantMode==="alternate"){
    const last = db.variantDone[r.id];
    return last==null ? 0 : (last+1)%r.variants.length;
  }
  const sel = db.variantSel[r.id];
  return (sel!=null && sel<r.variants.length) ? sel : 0;
}
function blockSeconds(b){
  const n=(b.sides||1)*(b.sets||1);
  return (b.mode==="reps" ? (b.est||60)*n : b.sec*n);
}
/* Optional blocks are reported separately so the headline time reflects the
   work that actually has to happen — the 10-min-per-session budget. */
function routineSeconds(r, v){
  return activeBlocks(r, v==null?defaultVariant(r):v)
    .filter(b=>b.badge!=="opt").reduce((a,b)=>a+blockSeconds(b),0);
}
function optionalSeconds(r, v){
  return activeBlocks(r, v==null?defaultVariant(r):v)
    .filter(b=>b.badge==="opt").reduce((a,b)=>a+blockSeconds(b),0);
}
function badgeHTML(b){
  if(!b.badge) return "";
  const map={req:["req","non-negotiable"],new:["new","new"],opt:["opt","optional"],rec:["rec","recommended"]};
  const m=map[b.badge]; return m?`<span class="badge ${m[0]}">${m[1]}</span>`:"";
}
function didHTML(id){
  const st=stats(id);
  if(!st) return `<div class="did">Not yet logged</div>`;
  return `<div class="did">Last done <b>${fmtLast(st.lastDay)}</b> · <b>${st.count}×</b> total` +
    (st.streak>1?` · <span class="streak">${st.streak}-day streak</span>`:"") + `</div>`;
}
function cardHTML(r){
  const v = defaultVariant(r), time = fmtMin(routineSeconds(r,v));
  /* Skip the variant chip when the variant is just named for its length
     (core's "5 min"), so the card doesn't read "5 min · 5 min". */
  const showVariant = r.variants && r.variants[v] !== time;
  return `
    <button class="card" data-r="${r.id}" style="--accent:${r.accent}">
      <h2>${r.name}</h2><div class="sub">${r.sub}</div>
      <div class="meta"><span><b>${time}</b>${optionalSeconds(r,v)?` +${fmtMin(optionalSeconds(r,v))} opt`:""}</span>
      <span class="moves"><b>${activeBlocks(r,v).length}</b> moves</span>
      ${showVariant?`<span><b>${r.variants[v]}</b>${r.variantMode==="alternate"?" next":""}</span>`:""}</div>
      ${didHTML(r.id)}
    </button>`;
}
function renderHome(){
  const daily = ROUTINES.filter(r=>!r.onDemand), demand = ROUTINES.filter(r=>r.onDemand);
  $("#cards").innerHTML = !demand.length ? daily.map(cardHTML).join("") : `
    <div class="cols">
      <div><p class="col-h">Daily <s>5× a week is a win</s></p>${daily.map(cardHTML).join("")}</div>
      <div><p class="col-h">On demand <s>when it's called for</s></p>${demand.map(cardHTML).join("")}</div>
    </div>`;
  $("#cards").querySelectorAll("[data-r]").forEach(el=>{ el.onclick=()=>openDetail(el.dataset.r); });
}
function nowStr(){ $("#clockNow").textContent = new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}); }

function openDetail(id){
  const r = ROUTINES.find(x=>x.id===id);
  state.routine=r;
  state.variant=defaultVariant(r);
  renderDetail(); go("detail");
}
function renderDetail(){
  const r=state.routine;
  $("#dName").textContent=r.name; $("#dSub").textContent=r.sub;
  document.documentElement.style.setProperty("--signal", r.accent);

  if(r.variants){
    $("#dLevels").innerHTML = `<div class="levels">` + r.variants.map((n,i)=>
      `<button class="lvl" data-v="${i}" aria-pressed="${i===state.variant}"><b>${n}</b><s>${(r.variantTags&&r.variantTags[i])||"&nbsp;"}</s></button>`).join("") + `</div>`;
    $("#dLevels").querySelectorAll("[data-v]").forEach(el=>{ el.onclick=()=>{
      state.variant=+el.dataset.v;
      if(r.variantMode!=="alternate"){ db.variantSel[r.id]=state.variant; saveDB(); }
      renderDetail(); }; });
  } else $("#dLevels").innerHTML = `<p class="label">The circuit</p>`;

  const blocks=activeBlocks(r,state.variant);
  $("#dSteps").innerHTML = blocks.map((b,i)=>{
    const dose = b.dose || (b.sides? `${b.sec}s × ${b.sides}` : `${b.sec}s`);
    const lvl = exLevel(r,b);
    const line = b.levels? b.levels[lvl] : (b.detail||"");
    const chips = b.levels? `<div class="exlvls">`+b.levels.map((_,li)=>
      `<button class="exl" data-ex="${i}" data-l="${li}" aria-pressed="${li===lvl}">L${li+1}</button>`).join("")+`</div>` : "";
    return (b.group?`<p class="group">${b.group}</p>`:"") +
      `<div class="step"><div class="n">${i+1}</div><div class="body">
        <div class="nm">${b.name}${b.tag?` <span style="color:var(--dimmer);font-weight:400">· ${b.tag}</span>`:""}${badgeHTML(b)}</div>
        <div class="dose">${dose}${b.mode==="reps"?" · tap to advance":""}</div>
        <div class="lv">${line}</div>
        ${b.cue?`<div class="cue">${b.cue}</div>`:""}
        ${chips}</div></div>`;
  }).join("");
  $("#dSteps").querySelectorAll(".exl").forEach(el=>{ el.onclick=()=>{
    setExLevel(r, blocks[+el.dataset.ex], +el.dataset.l); renderDetail(); }; });
  const opt=optionalSeconds(r,state.variant);
  $("#btnStart").textContent = `Start routine · ${fmtMin(routineSeconds(r,state.variant))}` +
    (opt?` +${fmtMin(opt)} opt`:"");
}

function buildSeq(){
  const r=state.routine, seq=[], blocks=activeBlocks(r,state.variant);
  state.moves=blocks.length;
  seq.push({type:"prep", mode:"time", sec:PREP, name:"Get set", label:blocks[0].name});
  blocks.forEach((b,bi)=>{
    const line = b.levels? b.levels[exLevel(r,b)] : (b.detail||"");
    const sides=b.sides||1, sets=b.sets||1;
    for(let st=0; st<sets; st++){
      for(let s=0; s<sides; s++){
        seq.push({
          type:"work", mode:b.mode||"time", sec:b.sec, target:b.target,
          name:b.name, tag:b.tag, detail:line, cue:b.cue, block:bi,
          side: sides>1 ? (s===0?"Left":"Right") : "",
          set: sets>1 ? `Set ${st+1} of ${sets}` : ""
        });
      }
    }
  });
  return seq;
}

function startRoutine(){
  unlockAudio(); mediaSession(true);
  state.seq=buildSeq(); state.i=0;
  state.total=routineSeconds(state.routine, state.variant);
  renderBeads(); loadStep(0);
  state.running=true; keepAwake(true); go("run"); startTick();
}
function renderBeads(){
  $("#beads").innerHTML = state.seq.map((s,i)=>
    `<div class="bead" data-b="${i}" ${s.type==="prep"?'style="flex:.3"':""}><i></i></div>`).join("");
}
function paintBeads(){
  state.seq.forEach((s,i)=>{
    const el=$(`.bead[data-b="${i}"]`); if(!el) return;
    const bar=el.querySelector("i");
    if(i<state.i){ el.classList.add("done"); bar.style.width="100%"; }
    else if(i===state.i){ el.classList.remove("done");
      bar.style.width = s.mode==="reps" ? "50%" : (100*(s.sec-state.left)/s.sec)+"%"; }
    else { el.classList.remove("done"); bar.style.width="0"; }
  });
}
const C = 2*Math.PI*110;
function paintRing(){
  const s=state.seq[state.i], ring=$("#ring");
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = (s && s.mode==="reps") ? 0 : C*(1-(s? state.left/s.sec : 0));
}
function isReps(){ const s=state.seq[state.i]; return s && s.mode==="reps"; }

function loadStep(i, opts){
  opts = opts || {};
  state.i=i; const s=state.seq[i];
  state.left = s.mode==="reps" ? 0 : s.sec;
  state.up = 0;
  state.endsAt = s.mode==="reps" ? null : Date.now() + s.sec*1000;
  state.startedAt = Date.now();
  if(s.mode!=="reps" && !opts.silent) scheduleAhead(i, state.endsAt);
  const reps = s.mode==="reps";

  $("#ringwrap").classList.toggle("tap", reps);
  $("#tRemain").classList.toggle("reps", reps);
  $("#tRemain").textContent = reps ? s.target : s.sec;
  $("#tSide").textContent = s.side || "";
  $("#tElapsed").textContent = reps ? "tap when done" : (s.set||"");

  $("#phase").textContent = s.type==="prep" ? "Starting"
      : `Move ${s.block+1} of ${state.moves}${s.set?" · "+s.set:""}${s.tag?" · "+s.tag:""}`;
  $("#rName").textContent = s.type==="prep" ? "Get set" : s.name;
  $("#rLvl").textContent  = s.type==="prep" ? `Up next: ${s.label}` : (s.detail||"");
  $("#rCue").textContent  = s.type==="prep" ? "" : (s.cue||"");

  const nx=state.seq[i+1];
  $("#rNext").innerHTML = nx ? `Next · <b>${nx.name}${nx.side?" — "+nx.side:""}</b>` : "Last one";

  const main=$("#btnPause");
  main.classList.toggle("reps", reps);
  main.classList.remove("paused");
  main.textContent = reps ? "Done — next" : "Pause";

  paintRing(); paintBeads();
  if(opts.silent) return;
  if(s.type==="work"){
    const spoken = s.side ? `${s.name}. ${s.side}.` : s.name;
    say(reps ? `${spoken} ${s.target}.` : spoken);
  }
  if(s.mode==="reps") ping(s.type==="prep"?520:660,.13,.2);
}
function advance(){
  if(state.i >= state.seq.length-1) finish();
  else loadStep(state.i+1);
}

/* Rebuild position from the wall clock. Called every tick and whenever the app
   comes back to the foreground, so a locked screen or a backgrounded tab
   catches up instead of drifting behind. */
function resync(){
  let guard=0;
  while(state.running && !isReps() && state.endsAt && Date.now()>=state.endsAt && guard++<400){
    if(state.i >= state.seq.length-1){ finish(); return; }
    const over = Date.now() - state.endsAt;
    loadStep(state.i+1, {silent:true});
    if(state.endsAt) state.endsAt -= over;
  }
  if(isReps()){
    state.up = Math.floor((Date.now()-state.startedAt)/1000);
    $("#tElapsed").textContent = `${mmss(state.up)} · tap when done`;
  }else if(state.endsAt){
    const left = Math.max(0, Math.ceil((state.endsAt-Date.now())/1000));
    if(left!==state.left){ state.left=left; $("#tRemain").textContent=left; }
    paintRing(); paintBeads();
  }
}
function startTick(){
  stopTick();
  state.tick=setInterval(()=>{ if(state.running) resync(); },200);
}
function stopTick(){ if(state.tick){ clearInterval(state.tick); state.tick=null; } }
function finish(){
  stopTick(); state.running=false; keepAwake(false); clearScheduled();
  ping(760,.14,.25); setTimeout(()=>ping(1010,.22,.25),150); say("Done.");
  const r=state.routine, id=r.id;
  (db.log[id] = db.log[id]||[]).push(Date.now());
  if(r.variants) db.variantDone[id]=state.variant;
  saveDB();
  const st=stats(id);
  $("#doneName").textContent = r.name;
  let sub = `${state.moves} moves complete.`;
  if(r.variants){
    sub = `${r.variants[state.variant]} — ${sub}`;
    if(r.variantMode==="alternate")
      sub += ` Next time: ${r.variants[(state.variant+1)%r.variants.length]}.`;
  }
  $("#doneSub").textContent = sub;
  $("#doneStreak").textContent = st.streak>1 ? `${st.streak}-day streak.` : "Logged for today.";
  renderHome();
  go("done");
}

$("#btnStart").onclick = startRoutine;
$("#btnAgain").onclick = startRoutine;
$("#ringwrap").onclick = ()=>{ if(isReps()){ clearScheduled(); ping(700,.1,.2); advance(); } };
$("#btnPause").onclick = ()=>{
  if(isReps()){ ping(700,.1,.2); advance(); return; }
  state.running=!state.running;
  $("#btnPause").textContent = state.running?"Pause":"Resume";
  $("#btnPause").classList.toggle("paused", !state.running);
  if(state.running){
    state.endsAt = Date.now() + state.left*1000;
    scheduleAhead(state.i, state.endsAt);
    keepAwake(true);
  }else{
    clearScheduled();
  }
};
$("#btnNext").onclick = ()=>{ clearScheduled(); advance(); };
$("#btnPrev").onclick = ()=>{
  clearScheduled();
  if(!isReps() && state.left < state.seq[state.i].sec - 2) loadStep(state.i);
  else if(state.i>0) loadStep(state.i-1);
  else loadStep(0);
};
function paintToggles(){
  const s=$("#tgSound"), v=$("#tgVoice");
  s.setAttribute("aria-pressed",sound); s.textContent = sound?"Beeps on":"Beeps off";
  v.setAttribute("aria-pressed",voice); v.textContent = voice?"Voice on":"Voice off";
}
$("#tgSound").onclick = ()=>{ sound=!sound; db.sound=sound; saveDB(); paintToggles();
  if(sound){unlockAudio();ping();} };
$("#tgVoice").onclick = ()=>{ voice=!voice; db.voice=voice; saveDB(); paintToggles(); };

/* offline: cache-first service worker (only meaningful over https)
   The worker serves cached files, so after a deploy the page in front of you is
   still running the old JS/CSS until it reloads. Reload as soon as the new
   worker takes control — but never mid-routine, since that would kill a running
   timer. Deferred reloads fire on the way back to the home screen. */
let swReloadPending = false;
function applySWReload(){ if(swReloadPending && !state.running) location.reload(); }
if("serviceWorker" in navigator && window.isSecureContext){
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", ()=>{
    if(!hadController || swReloadPending) return;  // first install: nothing stale to refresh
    swReloadPending = true;
    applySWReload();
  });
  window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}

renderHome(); nowStr(); setInterval(nowStr,20000); paintAwakeStatus(); paintToggles();
