/* ============================================================ CONFIG ============================================================
   The one file that makes this copy of the app THIS person's. Everything
   else in the shell (app.js, lift.js, schedule.js, drag.js, styles.css,
   index.html, sw.js) is byte-identical across the sibling apps and is
   synced from the routines repo with claude_workspace/sync-shell.sh —
   never edited in a sibling.

   dbKey and the CACHE name in sw.js must differ from every sibling: all the
   apps are served from adanerusmani.com, and localStorage is per-origin,
   so a shared key would merge two people's logs. */
const APP = {
  name: "Routines",
  dbKey: "routines.v1",
  exportTitle: "Routines export",            // heading of the weekly markdown
  exportFile:  "routines-export",            // download filename prefix
  exportHint:  "drop it in the repo's feedback/ folder",
  notesLabel:  "For Sunday",
  notesIntro:  "Anything the next re-program should take into account. Kept on this device " +
               "until you export — the app has no server, so Sunday's hand-off is the Copy button.",
  areas: {                                   // per-area label/caption overrides (see schedule.js AREAS)
    mobility: { label:"Mobility & PT", cap:"daily, non-negotiable" },
    cardio:   { label:"Cardio",        cap:"running and cutting" }
  },
  history: true,
  /* No 5/10/15-min chips on the detail screen: the daily work is filed in
     buckets (hips, core, mobility, PT, pre-gym) and stacked on Today instead. */
  budgets: false,                             // show the Hevy-CSV import; history.js carries the baked past
  textScale: 1                               // body zoom — 1.15 on the larger-type apps
};
