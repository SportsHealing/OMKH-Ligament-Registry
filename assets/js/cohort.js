/* Invented cohort for the admin analytics demo. Not clinical evidence.
   Built in the browser from a fixed seed, so every visitor sees the same cases.
   About 300 made-up cases. Names, hospitals, surgeons and NHS numbers are invented.
   NHS numbers use the 999 test range and never match a patient in REG.patients.
   Group differences are small and random on purpose. They do not reflect any real finding.
   Needs data.js to load first. */
(function () {
  var REG = window.REG;
  var TODAY = new Date(REG.today + "T12:00:00");

  // Seeded generator (mulberry32). Same seed, same cohort.
  var seed = 20300612;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / Math.pow(2, 32);
  }
  function norm() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }
  function weighted(pairs) { var r = rnd(), s = 0; for (var i = 0; i < pairs.length; i++) { s += pairs[i][1]; if (r < s) return pairs[i][0]; } return pairs[pairs.length - 1][0]; }
  function iso(dt) { return dt.toISOString().slice(0, 10); }
  function addDays(s, n) { var x = new Date(s + "T12:00:00"); x.setDate(x.getDate() + n); return iso(x); }
  function addYears(s, n) { var x = new Date(s + "T12:00:00"); x.setFullYear(x.getFullYear() + n); return iso(x); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var GRAFTS = ["Hamstring autograft", "Patellar tendon autograft", "Quadriceps tendon autograft", "Allograft"];
  var FEM = ["Suspensory button", "Interference screw", "Cross pin"];
  var TIB = ["Interference screw", "Suspensory button", "Screw and post"];
  var OTHER = ["Meniscus repair", "Meniscectomy", "Lateral extra-articular tenodesis (LET)", "Cartilage procedure"];
  var NONE = "None";
  var NOT_REC = "Not recorded";
  var AGE_BANDS = ["Under 20", "20 to 29", "30 to 39", "40 and over"];
  var SEXES = ["Female", "Male", "Not stated"];
  var TPS = [["pre", "Before surgery", 0], ["y1", "1 year", 1], ["y2", "2 years", 2], ["y5", "5 years", 5]];
  var HOSPITALS = REG.hospitals.concat(["Westbrook Placeholder Hospital", "Southmere Mock Infirmary"]);
  var SURGEONS = REG.surgeons.concat(["Ms Test Surgeon D", "Mr Test Surgeon E"]);
  var FIRST_F = ["Amy", "Bethan", "Chloe", "Ellie", "Fatima", "Hannah", "Isla", "Jess", "Kate", "Leah", "Maya", "Niamh", "Olivia", "Priya", "Rosie", "Sophie", "Tara", "Zara", "Aisha", "Grace"];
  var FIRST_M = ["Adam", "Ben", "Callum", "Dan", "Ethan", "Finn", "George", "Harry", "Imran", "Jack", "Kieran", "Liam", "Mo", "Nathan", "Owen", "Rhys", "Sam", "Tom", "Yusuf", "Kwame"];
  var LAST = ["Sample", "Example", "Demo", "Testwell", "Mockford", "Placeholder", "Dummy", "Specimen", "Trialson", "Fakely", "Pretend", "Protoby", "Madeup", "Notreal", "Draftley"];

  function ageBand(a) { return a < 20 ? AGE_BANDS[0] : a < 30 ? AGE_BANDS[1] : a < 40 ? AGE_BANDS[2] : AGE_BANDS[3]; }
  function yearsBetween(a, b) { var x = new Date(a + "T12:00:00"), y = new Date(b + "T12:00:00"); var n = y.getFullYear() - x.getFullYear(); if (y.getMonth() < x.getMonth() || (y.getMonth() === x.getMonth() && y.getDate() < x.getDate())) n--; return n; }

  function nhsCheck(nine) { var s = 0; for (var i = 0; i < 9; i++) s += Number(nine[i]) * (10 - i); var c = 11 - (s % 11); return c === 11 ? 0 : c; }
  var used = {};
  REG.patients.forEach(function (p) { used[p.nhs.replace(/\s+/g, "")] = true; });
  function nhs() {
    for (;;) {
      var nine = "999" + String(Math.floor(rnd() * 1e6)).padStart(6, "0");
      var c = nhsCheck(nine);
      if (c === 10) continue;
      var n = nine + c;
      if (used[n]) continue;
      used[n] = true;
      return n.slice(0, 3) + " " + n.slice(3, 6) + " " + n.slice(6);
    }
  }

  /* Score model. Each measure: mean at each time point (pre, 1y, 2y, 5y), how strongly it follows IKDC, own noise.
     Order follows REG.measures: IKDC, KOOS pain, symptoms, daily living, sport, quality of life, pain score, SANE. */
  var MODEL = [
    { mean: [48, 77, 82, 83], k: 1, sd: 6, max: 100 },
    { mean: [66, 86, 89, 89], k: 0.7, sd: 6, max: 100 },
    { mean: [60, 81, 84, 84], k: 0.7, sd: 7, max: 100 },
    { mean: [78, 93, 95, 95], k: 0.5, sd: 5, max: 100 },
    { mean: [38, 68, 75, 75], k: 1, sd: 9, max: 100 },
    { mean: [32, 63, 70, 71], k: 1, sd: 9, max: 100 },
    { mean: [5.2, 2.2, 1.7, 1.8], k: -0.08, sd: 1.1, max: 10 },
    { mean: [42, 77, 83, 84], k: 0.9, sd: 8, max: 100 }
  ];
  // Small invented shifts in IKDC points after surgery. Kept mild on purpose.
  var SHIFT = { "Allograft": -2, "Meniscectomy": -1.5, "Cartilage procedure": -2.5, "Lateral extra-articular tenodesis (LET)": 1, "40 and over": -1.5 };
  var MISS = { pre: 0.08, y1: 0.18, y2: 0.28, y5: 0.42 };

  function makeScores(c) {
    var u = norm() * 8, shift = 0, out = {};
    [c.graft, c.ageBand].concat(c.other).forEach(function (k) { if (SHIFT[k]) shift += SHIFT[k]; });
    TPS.forEach(function (t, ti) {
      var due = addYears(c.surgery.date, t[2]);
      if (t[0] === "pre") due = addDays(c.surgery.date, -21 - Math.floor(rnd() * 40));
      else if (new Date(addDays(due, 60) + "T12:00:00") > TODAY) return; // not yet due
      if (rnd() < MISS[t[0]]) return; // not returned
      var ikdc = MODEL[0].mean[ti] + (ti ? shift : 0) + u + norm() * MODEL[0].sd;
      var v = MODEL.map(function (m, i) {
        if (i > 0 && rnd() < 0.03) return null; // one score left blank
        var x = i === 0 ? ikdc : m.mean[ti] + m.k * (ikdc - MODEL[0].mean[ti]) + norm() * m.sd;
        return Math.round(clamp(x, 0, m.max));
      });
      out[t[0]] = { date: t[0] === "pre" ? due : addDays(due, Math.floor(rnd() * 50)), v: v };
    });
    return out;
  }

  var cases = [];
  var start = new Date("2021-01-04T12:00:00").getTime(), end = new Date("2030-04-20T12:00:00").getTime();
  for (var i = 0; i < 300; i++) {
    var sex = weighted([["Female", 0.44], ["Male", 0.55], ["Not stated", 0.01]]);
    var age = Math.round(clamp(15 + Math.abs(norm()) * 11 + rnd() * 6, 15, 58));
    var sdate = iso(new Date(start + rnd() * (end - start)));
    var dob = addDays(addYears(sdate, -age), -Math.floor(rnd() * 360));
    var graft = weighted([[GRAFTS[0], 0.5], [GRAFTS[1], 0.22], [GRAFTS[2], 0.18], [GRAFTS[3], 0.1]]);
    var fem = graft === GRAFTS[1] ? weighted([[FEM[1], 0.8], [FEM[0], 0.2]]) : weighted([[FEM[0], 0.72], [FEM[1], 0.22], [FEM[2], 0.06]]);
    var tib = weighted([[TIB[0], 0.7], [TIB[1], 0.2], [TIB[2], 0.1]]);
    var other = [];
    var men = rnd();
    if (men < 0.25) other.push(OTHER[0]); else if (men < 0.4) other.push(OTHER[1]);
    if (rnd() < 0.18) other.push(OTHER[2]);
    if (rnd() < 0.08) other.push(OTHER[3]);
    var first = sex === "Male" ? pick(FIRST_M) : sex === "Female" ? pick(FIRST_F) : pick(FIRST_F.concat(FIRST_M));
    var hosp = pick(HOSPITALS);
    var c = {
      id: "c" + String(i + 1).padStart(3, "0"), invented: true,
      name: first + " " + pick(LAST), sex: sex, dob: dob, nhs: nhs(),
      hospital: hosp, surgeon: SURGEONS[HOSPITALS.indexOf(hosp) % SURGEONS.length],
      knee: rnd() < 0.5 ? "Right" : "Left",
      age: age, ageBand: ageBand(age), graft: graft, femFix: fem, tibFix: tib, other: other.length ? other : [NONE],
      surgery: { date: sdate }
    };
    c.scores = makeScores(c);
    cases.push(c);
  }

  // Map a demo patient from REG (or App.patients()) into the same shape.
  function graftGroup(g) { g = (g || "").toLowerCase(); return /hamstring/.test(g) ? GRAFTS[0] : /patellar|btb/.test(g) ? GRAFTS[1] : /quadriceps/.test(g) ? GRAFTS[2] : /allograft/.test(g) ? GRAFTS[3] : NOT_REC; }
  function fixGroup(f, list) { if (!f) return NOT_REC; for (var i = 0; i < list.length; i++) if (f.toLowerCase().indexOf(list[i].toLowerCase()) === 0) return list[i]; return f; }
  function fromReg(p) {
    var s = p.surgery, other = [];
    if (s) {
      var m = (s.meniscus || "").toLowerCase(), cart = (s.cartilage || "").toLowerCase(), extra = (s.other || "").toLowerCase();
      if (/repair/.test(m)) other.push(OTHER[0]);
      if (/meniscectomy/.test(m)) other.push(OTHER[1]);
      if (/tenodesis|\blet\b/.test(m + " " + extra)) other.push(OTHER[2]);
      if (/microfracture|chondroplasty|graft|implant/.test(cart + " " + extra)) other.push(OTHER[3]);
      if (!other.length) other.push(s.meniscus || s.cartilage ? NONE : NOT_REC);
    }
    var age = yearsBetween(p.dob, s ? s.date : REG.today);
    var sc = {};
    TPS.forEach(function (t) { if (p.scores && p.scores[t[0]]) sc[t[0]] = p.scores[t[0]]; });
    return {
      id: p.id, invented: false, name: p.name, sex: p.sex, dob: p.dob, nhs: p.nhs, hospital: p.hospital, surgeon: p.surgeon, knee: p.knee,
      age: age, ageBand: ageBand(age), graft: s ? graftGroup(s.graft) : "", femFix: s ? fixGroup(s.femFix, FEM) : "", tibFix: s ? fixGroup(s.tibFix, TIB) : "",
      other: s ? other : [], surgery: s ? { date: s.date } : null, revision: p.revision || null, scores: sc
    };
  }

  window.COHORT = {
    note: "Invented data. Not clinical evidence.",
    cases: cases, fromReg: fromReg,
    all: function (regPatients) { return (regPatients || REG.patients).map(fromReg).concat(cases); },
    GRAFTS: GRAFTS, FEM: FEM, TIB: TIB, OTHER: OTHER, NONE: NONE, NOT_REC: NOT_REC, AGE_BANDS: AGE_BANDS, SEXES: SEXES, TPS: TPS, HOSPITALS: HOSPITALS
  };
})();
