/* Admin dashboard demo. Signed in as Test Administrator B. */
(function () {
  var A = App, esc = A.esc, fmt = A.fmt, ME = REG.user.admin;

  function parseDate(s) {
    var m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(s || "");
    if (!m) return null;
    var dd = +m[1], mm = +m[2], yy = +m[3], x = new Date(yy, mm - 1, dd, 12);
    if (x.getFullYear() !== yy || x.getMonth() !== mm - 1 || x.getDate() !== dd) return null;
    return yy + "-" + String(mm).padStart(2, "0") + "-" + String(dd).padStart(2, "0");
  }
  function counts() {
    var ps = A.patients(), c = { consent: 0, overdue: 0, op: 0, triage: 0 }, tri = A.load().triage;
    ps.forEach(function (p) {
      var st = A.status(p);
      if (p.consent.status === "pending") c.consent++;
      if (st.overdue.length || st.partial.length || st.dueSoon) c.overdue++;
      if (st.opForm === "incomplete") c.op++;
      if (!p.surgery && !tri[p.id]) c.triage++;
    });
    return c;
  }
  function field(id, label, hint, attrs, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' + (hint ? '<span class="hint" id="' + id + '-hint">' + hint + '</span>' : '') +
      '<input id="' + id + '" ' + (attrs || 'type="text"') + (hint ? ' data-hint="' + id + '-hint" aria-describedby="' + id + '-hint"' : '') + ' value="' + esc(val || "") + '"></div>';
  }
  function selectField(id, label, opts, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '"><option value="">Choose</option>' + opts.map(function (o) { return '<option' + (o === val ? " selected" : "") + '>' + esc(o) + '</option>'; }).join("") + '</select></div>';
  }
  var summary = '<div class="error-summary" tabindex="-1" hidden><h2>There is a problem</h2><ul></ul></div>';

  function today() {
    var c = counts();
    var rows = REG.clinic.map(function (a) {
      var p = A.patient(a.id), st = A.status(p), miss = [];
      if (p.consent.status !== "given") miss.push('<span class="tag due">Consent</span>');
      if (!p.surgery && !A.load().triage[p.id]) miss.push('<span class="tag due">Triage</span>');
      if (st.opForm === "incomplete") miss.push('<span class="tag due">Op form</span>');
      if (st.overdue.length || st.partial.length) miss.push('<span class="tag err">Scores</span>');
      if (st.dueSoon) miss.push('<span class="tag due">Scores due</span>');
      return '<tr><td class="mono">' + a.time + '</td><td><strong>' + esc(p.name) + '</strong><br><span class="mono small">' + esc(p.nhs) + '</span></td><td>' + esc(a.reason) + '</td><td>' + (miss.join(" ") || '<span class="tag ok">Complete</span>') + '</td><td><a href="#triage/' + p.id + '">Triage</a><br><a href="clinician.html#patient/' + p.id + '">Record</a></td></tr>';
    }).join("");
    return '<div class="view-title"><h1>Today\'s clinic</h1><p class="muted mono" style="margin:0">' + fmt(REG.today) + '. Northfield Demo Hospital.</p></div>' +
      '<p class="info an-admin-note">As an administrator you can see all patients and all data, from every hospital and surgeon. <a href="#all">See all patients</a> or <a href="#trends">look at score trends</a>.</p>' +
      '<div class="grid" style="margin-bottom:20px">' +
      '<a class="card list-link" href="#consent"><span><strong style="font-size:28px">' + c.consent + '</strong><br>Missing consent</span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#overdue"><span><strong style="font-size:28px">' + c.overdue + '</strong><br>Scores due or overdue</span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#status"><span><strong style="font-size:28px">' + c.op + '</strong><br>Unfinished op forms</span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#triage"><span><strong style="font-size:28px">' + c.triage + '</strong><br>Triage to take</span><span aria-hidden="true">&rarr;</span></a></div>' +
      '<section class="card"><div class="view-title" style="margin-bottom:8px"><h2 style="margin:0">Appointments</h2><a class="btn btn-small" href="#register">Register new patient</a></div><div class="scroll"><table><caption class="visually-hidden">Today\'s appointments</caption><thead><tr><th scope="col">Time</th><th scope="col">Patient</th><th scope="col">Reason</th><th scope="col">Missing</th><th scope="col">Open</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function register(done) {
    if (done) {
      var p = A.patient(done);
      if (!p) return '<h1>Not found</h1><a href="#register">Register a patient</a>';
      return '<div class="phone"><div class="info" role="status"><h1 style="font-size:28px">Patient registered</h1><p><strong>' + esc(p.name) + '</strong>, NHS <span class="mono">' + esc(p.nhs) + '</span>. Saved in this demo tab only.</p></div>' +
        '<div class="btn-row" style="margin-top:20px"><a class="btn" href="#triage/' + p.id + '">Take triage history</a><a class="btn btn-secondary" href="clinician.html#list">See in patient list</a><a href="#register">Register another</a></div></div>';
    }
    return '<h1>Register a new patient</h1><p class="muted">Every field is required unless it says optional. Use invented details only.</p>' +
      '<form id="reg" class="card" novalidate style="max-width:760px">' + summary +
      '<div class="two">' + field("fname", "First name", "", 'type="text" autocomplete="off"') + field("lname", "Last name", "", 'type="text" autocomplete="off"') + '</div>' +
      field("dob", "Date of birth", "For example 27/03/2004", 'type="text" inputmode="numeric" class="short" autocomplete="off"') +
      selectField("sex", "Sex", ["Female", "Male", "Not stated"]) +
      field("nhs", "NHS number", "10 digits. In this demo it must start 999, for example 999 757 4915.", 'type="text" inputmode="numeric" class="short" autocomplete="off"') +
      field("phone", "Mobile number (optional)", "For reminders. For example 07700 900123.", 'type="tel" class="short" autocomplete="off"') +
      field("email", "Email (optional)", "", 'type="email" autocomplete="off"') +
      '<fieldset id="knee-fs"><legend>Which knee?</legend><div class="choices-inline"><label class="choice"><input type="radio" name="knee" id="knee-0" value="Right">Right</label><label class="choice"><input type="radio" name="knee" id="knee-1" value="Left">Left</label></div></fieldset>' +
      selectField("hosp", "Hospital", REG.hospitals, REG.hospitals[0]) + selectField("cons", "Consultant", REG.surgeons) +
      '<div class="btn-row"><button class="btn" type="submit">Save patient</button><a href="#today">Cancel</a></div></form>';
  }

  function triage(id) {
    var ps = A.patients(), tri = A.load().triage;
    if (!id) {
      return '<h1>Triage history</h1><p>Take a short history before the consultant sees the patient.</p><div class="card">' + ps.map(function (p) {
        return '<a class="list-link" href="#triage/' + p.id + '"><span><strong>' + esc(p.name) + '</strong><br><span class="mono small">' + esc(p.nhs) + '</span></span>' + (tri[p.id] ? '<span class="tag ok">Taken</span>' : p.surgery ? '<span class="tag na">Not needed</span>' : '<span class="tag due">To take</span>') + '</a>';
      }).join("") + '</div>';
    }
    var p = A.patient(id);
    if (!p) return '<h1>Not found</h1><a href="#triage">Back to triage</a>';
    var t = tri[id] || {};
    if (t.saved && !/edit/.test(location.hash)) {
      return '<p><a href="#triage">Triage</a> / ' + esc(p.name) + '</p><div class="card" style="max-width:760px"><h1 style="font-size:30px">Triage taken</h1><dl class="facts"><dt>Injury date</dt><dd class="mono">' + esc(t.date) + '</dd><dt>How</dt><dd>' + esc(t.how) + '</dd><dt>Sport</dt><dd>' + esc(t.sport) + '</dd><dt>Gave way</dt><dd>' + esc(t.gave) + '</dd><dt>Earlier surgery</dt><dd>' + esc(t.prev) + '</dd></dl>' +
        '<div class="btn-row" style="margin-top:16px"><a class="btn" href="clinician.html#patient/' + id + '">Open the record</a><a href="#triage/' + id + '/edit">Change answers</a><a href="#today">Back to today</a></div></div>';
    }
    return '<p class="muted" style="margin:0"><a href="#triage">Triage</a> / ' + esc(p.name) + '</p><h1>Triage history</h1><p><strong>' + esc(p.name) + '</strong>, NHS <span class="mono">' + esc(p.nhs) + '</span>, ' + esc(p.knee) + ' knee.</p>' +
      '<form id="tri" class="card" novalidate style="max-width:760px">' + summary +
      field("tdate", "Date of injury", "For example 02/04/2030", 'type="text" inputmode="numeric" class="short" autocomplete="off"', t.date) +
      '<div class="field"><label for="thow">How did it happen?</label><span class="hint" id="thow-hint">In the patient\'s words. One or two sentences.</span><textarea id="thow" data-hint="thow-hint" aria-describedby="thow-hint">' + esc(t.how || "") + '</textarea></div>' +
      selectField("tsport", "Main sport and level", ["Football, club", "Rugby, club", "Netball, club", "Skiing, recreational", "Other sport", "No regular sport"], t.sport) +
      '<fieldset id="tgave-fs"><legend>Has the knee given way since?</legend><div class="choices-inline"><label class="choice"><input type="radio" name="tgave" id="tgave-0" value="Yes"' + (t.gave === "Yes" ? " checked" : "") + '>Yes</label><label class="choice"><input type="radio" name="tgave" id="tgave-1" value="No"' + (t.gave === "No" ? " checked" : "") + '>No</label></div></fieldset>' +
      '<fieldset id="tprev-fs"><legend>Any earlier surgery on this knee?</legend><div class="choices-inline"><label class="choice"><input type="radio" name="tprev" id="tprev-0" value="Yes"' + (t.prev === "Yes" ? " checked" : "") + '>Yes</label><label class="choice"><input type="radio" name="tprev" id="tprev-1" value="No"' + (t.prev === "No" ? " checked" : "") + '>No</label></div></fieldset>' +
      '<div class="btn-row"><button class="btn" type="submit">Save triage</button><a href="#triage">Cancel</a></div></form>';
  }

  function status() {
    var show = A.load().statusFilter || "all", tri = A.load().triage;
    var rows = A.patients().map(function (p) {
      var st = A.status(p);
      var cells = [
        p.consent.status === "given" ? ["ok", "Given"] : ["due", p.consent.status === "withdrawn" ? "Withdrawn" : "Missing"],
        p.surgery || tri[p.id] ? ["ok", "Done"] : ["due", "Missing"],
        p.scores.pre ? ["ok", "Done"] : ["due", "Missing"],
        st.opForm === "complete" ? ["ok", "Done"] : st.opForm === "na" ? ["na", "No surgery"] : ["due", "Unfinished"],
        p.revision ? ["na", "Revised"] : st.overdue.length ? ["err", st.overdue.length + " overdue"] : st.partial.length ? ["due", "Part missing"] : st.dueSoon ? ["due", "Due now"] : ["ok", "Up to date"]
      ];
      var bad = cells.some(function (c) { return c[0] === "due" || c[0] === "err"; });
      return { bad: bad, html: '<tr><th scope="row"><a href="clinician.html#patient/' + p.id + '">' + esc(p.name) + '</a><br><span class="mono small">' + esc(p.nhs) + '</span></th>' + cells.map(function (c) { return '<td><span class="tag ' + c[0] + '">' + esc(c[1]) + '</span></td>'; }).join("") + (st.opForm === "incomplete" ? '<td><a href="clinician.html#opform/' + p.id + '">Ask surgeon</a></td>' : '<td></td>') + '</tr>' };
    }).filter(function (r) { return show === "all" || r.bad; });
    return '<h1>Data status</h1><div class="filters"><div class="field"><label for="sfilter">Show</label><select id="sfilter"><option value="all"' + (show === "all" ? " selected" : "") + '>All patients</option><option value="bad"' + (show === "bad" ? " selected" : "") + '>Only records with gaps</option></select></div></div>' +
      '<p class="muted" role="status">' + rows.length + ' records shown.</p><div class="card" style="padding:8px 16px"><div class="scroll"><table><caption class="visually-hidden">Data status by patient</caption><thead><tr><th scope="col">Patient</th><th scope="col">Consent</th><th scope="col">Triage</th><th scope="col">Pre-op scores</th><th scope="col">Op form</th><th scope="col">Follow-up</th><th scope="col">Action</th></tr></thead><tbody>' + rows.map(function (r) { return r.html; }).join("") + '</tbody></table></div></div>';
  }

  function overdue() {
    var s = A.load(), hosp = s.hospFilter || "";
    var items = [];
    A.patients().forEach(function (p) {
      if (hosp && p.hospital !== hosp) return;
      var st = A.status(p);
      st.overdue.forEach(function (o) { items.push([p, o.label + " scores", "Was due " + fmt(o.due), "err"]); });
      st.partial.forEach(function (o) { items.push([p, o.label + " " + o.missing + " score", "Not returned", "due"]); });
      if (st.dueSoon) items.push([p, st.dueSoon.label + " scores", "Due " + fmt(st.dueSoon.date), "due"]);
      if (st.preopDue) items.push([p, "Before-surgery scores", "Needed before surgery", "due"]);
    });
    return '<h1>Overdue follow-ups</h1><div class="filters"><div class="field"><label for="hfilter">Hospital</label><select id="hfilter"><option value="">All hospitals</option>' + REG.hospitals.map(function (h) { return '<option' + (h === hosp ? " selected" : "") + '>' + esc(h) + '</option>'; }).join("") + '</select></div></div>' +
      '<form id="bulk"><p class="muted" role="status">' + items.length + ' items.</p><div class="card" style="padding:8px 16px"><div class="scroll"><table><caption class="visually-hidden">Scores due or overdue</caption><thead><tr><th scope="col">Select</th><th scope="col">Patient</th><th scope="col">What</th><th scope="col">When</th><th scope="col">Reminder</th></tr></thead><tbody>' +
      items.map(function (it, i) { var p = it[0], sent = s.reminders[p.id]; return '<tr><td><input type="checkbox" class="pick" id="pick-' + i + '" value="' + p.id + '" aria-label="Select ' + esc(p.name) + '" style="width:24px;height:24px"></td><td><a href="clinician.html#patient/' + p.id + '">' + esc(p.name) + '</a><br><span class="mono small">' + esc(p.nhs) + '</span></td><td>' + esc(it[1]) + '</td><td><span class="tag ' + it[3] + '">' + esc(it[2]) + '</span></td><td>' + (sent ? '<span class="tag ok">Sent ' + fmt(sent) + '</span>' : '<button class="btn btn-secondary btn-small" type="button" data-remind="' + p.id + '">Send a reminder</button>') + '</td></tr>'; }).join("") +
      '</tbody></table></div></div><div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Send reminders to selected</button></div></form>';
  }

  function consent() {
    var s = A.load(), f = s.consentFilter || "all";
    var ps = A.patients().filter(function (p) { return f === "all" || p.consent.status === f; });
    return '<h1>Consent tracker</h1><div class="filters"><div class="field"><label for="cfilter">Status</label><select id="cfilter">' + [["all", "All"], ["pending", "Missing"], ["given", "Given"], ["withdrawn", "Withdrawn"]].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === f ? " selected" : "") + '>' + o[1] + '</option>'; }).join("") + '</select></div></div>' +
      '<p class="muted" role="status">' + ps.length + ' patients shown.</p><div class="card" style="padding:8px 16px"><div class="scroll"><table><caption class="visually-hidden">Consent by patient</caption><thead><tr><th scope="col">Patient</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col">Research use</th><th scope="col">Action</th></tr></thead><tbody>' +
      ps.map(function (p) {
        var c = p.consent, tag = c.status === "given" ? "ok" : c.status === "withdrawn" ? "na" : "due";
        return '<tr><td><a href="clinician.html#patient/' + p.id + '">' + esc(p.name) + '</a><br><span class="mono small">' + esc(p.nhs) + '</span></td><td><span class="tag ' + tag + '">' + (c.status === "pending" ? "Missing" : c.status === "given" ? "Given" : "Withdrawn") + '</span></td><td class="mono">' + (c.date ? fmt(c.date) : "") + '</td><td>' + (c.research ? "Yes" : "No") + '</td><td>' + (c.status === "pending" ? '<button class="btn btn-small" type="button" data-consent="' + p.id + '">Record consent given</button>' : c.status === "withdrawn" ? '<span class="muted small">Keep record closed</span>' : '') + '</td></tr>';
      }).join("") + '</tbody></table></div></div><p class="small muted" style="margin-top:12px">In a real service consent would be signed by the patient. Here the button only changes the demo.</p>';
  }

  function remind(ids) {
    var s = A.load();
    ids.forEach(function (id) { s.reminders[id] = REG.today; });
    A.save();
    ids.forEach(function (id) { A.logAccess(id, ME, "Sent a score reminder"); });
  }
  function rerender() { window.dispatchEvent(new HashChangeEvent("hashchange")); }


  /* ===== Analytics. Admin sees every patient. Invented cohort from cohort.js plus the demo patients. ===== */
  var C = window.COHORT, MEAS = A.MEASURES, TPX = C.TPS, NOTE = C.note, MIN_N = 5;
  var FLAG = '<p class="an-flag" role="note"><strong>' + NOTE + '</strong> Built from about 300 made-up cases and the demo patients.</p>';
  function cohort() { return C.all(A.patients()); }
  function operated() { return cohort().filter(function (c) { return c.surgery; }); }
  function an() { var s = A.load(); if (!s.an) s.an = {}; return s.an; }
  function setAn(k, v) { an()[k] = v; A.save(); }
  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function r1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function valuesAt(list, tp, mi) { var out = []; list.forEach(function (c) { var s = c.scores[tp]; if (s && s.v[mi] != null) out.push(s.v[mi]); }); return out; }
  function sel(id, label, opts, val, hint) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' + (hint ? '<span class="hint" id="' + id + '-hint">' + hint + '</span>' : '') + '<select id="' + id + '" data-an="' + id + '"' + (hint ? ' aria-describedby="' + id + '-hint"' : '') + '>' +
      opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("") + '</select></div>';
  }
  function measureOpts() { return MEAS.map(function (m, i) { return [String(i), m.name + (m.lowerBetter ? " (lower is better)" : "")]; }); }
  function scaleWords(m) { return m.min + " to " + m.max + ", " + (m.lowerBetter ? "lower" : "higher") + " is better"; }
  function otherText(c) { return c.other.join(", "); }

  // Six series styles: colour token, line dash, marker, bar pattern. Colour is never the only cue.
  var STY = [
    { c: "var(--an-1)", dash: "", mk: "circle", pat: "solid", name: "solid fill, circle marker" },
    { c: "var(--an-2)", dash: "10 6", mk: "square", pat: "diag", name: "diagonal stripes, square marker" },
    { c: "var(--an-3)", dash: "3 5", mk: "triangle", pat: "dots", name: "dots, triangle marker" },
    { c: "var(--an-4)", dash: "14 5 3 5", mk: "diamond", pat: "cross", name: "cross hatch, diamond marker" },
    { c: "var(--an-5)", dash: "2 3", mk: "circle-o", pat: "horiz", name: "horizontal stripes, open circle" },
    { c: "var(--an-6)", dash: "8 3 2 3 2 3", mk: "square-o", pat: "vert", name: "vertical stripes, open square" }
  ];
  var chartNo = 0;
  function patternDefs(pfx) {
    return '<defs>' + STY.map(function (s, i) {
      var id = pfx + "-p" + i, inner = "";
      if (s.pat === "diag") inner = '<path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="var(--surface)" stroke-width="2"></path>';
      if (s.pat === "dots") inner = '<circle cx="4" cy="4" r="1.6" fill="var(--surface)"></circle>';
      if (s.pat === "cross") inner = '<path d="M0,0 L8,8 M8,0 L0,8" stroke="var(--surface)" stroke-width="1.4"></path>';
      if (s.pat === "horiz") inner = '<path d="M0,4 H8" stroke="var(--surface)" stroke-width="2"></path>';
      if (s.pat === "vert") inner = '<path d="M4,0 V8" stroke="var(--surface)" stroke-width="2"></path>';
      return '<pattern id="' + id + '" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' + s.c + '"></rect>' + inner + '</pattern>';
    }).join("") + '</defs>';
  }
  function marker(s, x, y, r) {
    var open = /-o$/.test(s.mk), f = open ? 'fill="var(--surface)" stroke="' + s.c + '" stroke-width="2.5"' : 'fill="' + s.c + '"';
    if (/circle/.test(s.mk)) return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + f + '></circle>';
    if (/square/.test(s.mk)) return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" ' + f + '></rect>';
    if (s.mk === "triangle") return '<path d="M' + x + ',' + (y - r - 1) + ' L' + (x + r + 1) + ',' + (y + r) + ' L' + (x - r - 1) + ',' + (y + r) + 'Z" ' + f + '></path>';
    return '<path d="M' + x + ',' + (y - r - 1) + ' L' + (x + r + 1) + ',' + y + ' L' + x + ',' + (y + r + 1) + ' L' + (x - r - 1) + ',' + y + 'Z" ' + f + '></path>';
  }
  function swatch(i, kind, pfx) {
    var s = STY[i];
    if (kind === "bars") return '<svg class="an-sw" width="28" height="16" aria-hidden="true" focusable="false"><rect x="1" y="1" width="26" height="14" rx="2" fill="url(#' + pfx + '-p' + i + ')" stroke="' + s.c + '"></rect></svg>';
    return '<svg class="an-sw" width="34" height="16" aria-hidden="true" focusable="false"><line x1="1" y1="8" x2="33" y2="8" stroke="' + s.c + '" stroke-width="3" stroke-dasharray="' + s.dash + '"></line>' + marker(s, 17, 8, 4) + '</svg>';
  }

  /* One chart for one measure. series: [{name, pts: [{mean, n} or null per time point]}]. kind: "lines" or "bars". */
  function chart(series, mi, kind, opts) {
    opts = opts || {};
    var m = MEAS[mi], pfx = "anc" + (++chartNo), W = opts.w || 820, H = opts.h || 360, L = 52, R = 16, T = opts.noHead ? 16 : 30, B = opts.nRow ? 62 : 42;
    var pw = W - L - R, ph = H - T - B, step = m.max === 10 ? 2 : 25, nT = TPX.length, band = pw / nT;
    function y(v) { return T + ph - (v / m.max) * ph; }
    var s = '<svg class="chart an-chart" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-labelledby="' + pfx + '-t ' + pfx + '-d">';
    s += '<title id="' + pfx + '-t">' + esc(opts.title || m.name) + '</title><desc id="' + pfx + '-d">' + esc(opts.desc || "") + '</desc>' + patternDefs(pfx);
    for (var g = 0; g <= m.max; g += step) s += '<line class="grid-line" x1="' + L + '" y1="' + y(g) + '" x2="' + (W - R) + '" y2="' + y(g) + '"' + (g ? ' stroke-dasharray="2 4"' : '') + '></line><text x="' + (L - 8) + '" y="' + (y(g) + 5) + '" text-anchor="end">' + g + '</text>';
    if (!opts.noHead) s += '<text x="' + L + '" y="16">' + esc(m.short) + ', ' + (m.lowerBetter ? "lower" : "higher") + ' is better</text>';
    TPX.forEach(function (t, i) { s += '<text x="' + (L + band * (i + 0.5)) + '" y="' + (H - B + 24) + '" text-anchor="middle">' + (opts.noHead && !i ? "Before" : t[1]) + '</text>'; });
    if (opts.nRow) TPX.forEach(function (t, i) { s += '<text x="' + (L + band * (i + 0.5)) + '" y="' + (H - B + 46) + '" text-anchor="middle">n = ' + opts.nRow[i] + '</text>'; });
    if (kind === "bars") {
      var k = series.length, gw = band * 0.78, bw = gw / k;
      series.forEach(function (se, si) {
        se.pts.forEach(function (p, i) {
          var x = L + band * i + (band - gw) / 2 + bw * si;
          if (!p) { s += '<text class="an-na" x="' + (x + bw / 2) + '" y="' + (y(0) - 6) + '" text-anchor="middle">-</text>'; return; }
          s += '<rect x="' + (x + 1) + '" y="' + y(p.mean) + '" width="' + Math.max(1, bw - 2) + '" height="' + Math.max(1, y(0) - y(p.mean)) + '" fill="url(#' + pfx + '-p' + si + ')" stroke="' + STY[si].c + '"></rect>';
          if (opts.labels) s += '<text class="val" x="' + (x + bw / 2) + '" y="' + (y(p.mean) - 7) + '" text-anchor="middle">' + (m.max === 10 && !opts.int ? r1(p.mean) : Math.round(p.mean)) + '</text>';
        });
      });
    } else {
      series.forEach(function (se, si) {
        var st = STY[si], seg = [], segs = [];
        se.pts.forEach(function (p, i) { if (p) seg.push([L + band * (i + 0.5), y(p.mean)]); else if (seg.length) { segs.push(seg); seg = []; } });
        if (seg.length) segs.push(seg);
        segs.forEach(function (sg) { s += '<polyline points="' + sg.map(function (q) { return q.join(","); }).join(" ") + '" fill="none" stroke="' + st.c + '" stroke-width="3" stroke-dasharray="' + st.dash + '" stroke-linejoin="round"></polyline>'; });
        se.pts.forEach(function (p, i) {
          if (!p) return;
          var cx = L + band * (i + 0.5);
          s += marker(st, cx, y(p.mean), 6);
          if (opts.labels) s += '<text class="val" x="' + cx + '" y="' + (y(p.mean) - 12) + '" text-anchor="middle">' + (m.max === 10 && !opts.int ? r1(p.mean) : Math.round(p.mean)) + '</text>';
        });
      });
    }
    return s + '</svg>';
  }
  function legend(series, kind) {
    return '<ul class="an-legend" aria-label="Key">' + series.map(function (se, i) { return '<li>' + swatch(i, kind, "anc" + chartNo) + '<span>' + esc(se.name) + (se.total != null ? ' <span class="muted">(n = ' + se.total + ')</span>' : '') + '</span></li>'; }).join("") + '</ul>';
  }
  function describe(series, mi) {
    var m = MEAS[mi];
    return series.map(function (se) { return se.name + ": " + se.pts.map(function (p, i) { return TPX[i][1] + " " + (p ? r1(p.mean) + " (n " + p.n + ")" : "not shown"); }).join(", "); }).join(". ") + ". " + m.name + ", " + scaleWords(m) + ".";
  }

  // ===== All patients =====
  var PAGE = 50;
  function allRows(q, src) {
    q = (q || "").trim().toLowerCase(); var qd = q.replace(/\s+/g, "");
    return cohort().filter(function (c) {
      if (src === "demo" && c.invented) return false;
      if (src === "invented" && !c.invented) return false;
      if (!q) return true;
      return c.name.toLowerCase().indexOf(q) >= 0 || (qd && c.nhs.replace(/\s+/g, "").indexOf(qd) >= 0);
    });
  }
  function allBody(list, shown) {
    return list.slice(0, shown).map(function (c) {
      var n = TPX.filter(function (t) { return c.scores[t[0]]; }).length;
      return '<tr><th scope="row"><a href="#bypatient/' + c.id + '">' + esc(c.name) + '</a><br><span class="mono small">' + esc(c.nhs) + '</span></th><td>' + (c.invented ? '<span class="tag na">Invented cohort</span>' : '<span class="tag ok">Demo record</span>') + '</td><td class="num">' + c.age + '</td><td>' + esc(c.sex) + '</td><td>' + esc(c.hospital) + '<br><span class="small muted">' + esc(c.surgeon) + '</span></td><td>' + (c.surgery ? esc(c.graft) + '<br><span class="mono small">' + fmt(c.surgery.date) + '</span>' : '<span class="tag na">No surgery yet</span>') + '</td><td class="num">' + n + '</td></tr>';
    }).join("");
  }
  function allPatients() {
    var st = an(), q = st.q || "", src = st.src || "all", list = allRows(q, src), shown = Math.min(list.length, st.shown || PAGE);
    return '<div class="view-title"><div><h1>All patients</h1><p class="muted" style="margin:0">Every patient in the registry, from every hospital and surgeon. Not filtered by surgeon.</p></div></div>' + FLAG +
      '<div class="filters"><div class="field"><label for="asearch">Search by name or NHS number</label><input id="asearch" type="search" autocomplete="off" value="' + esc(q) + '"></div>' +
      sel("asrc", "Show", [["all", "All records"], ["demo", "Demo records only"], ["invented", "Invented cohort only"]], src) + '</div>' +
      '<p class="muted" role="status" id="acount">' + countText(shown, list.length) + '</p>' +
      '<div class="card" style="padding:8px 16px"><div class="scroll"><table><caption class="visually-hidden">All patients</caption><thead><tr><th scope="col">Patient</th><th scope="col">Source</th><th scope="col" class="num">Age at surgery</th><th scope="col">Sex</th><th scope="col">Hospital and surgeon</th><th scope="col">Graft and date</th><th scope="col" class="num">Score sets</th></tr></thead><tbody id="abody">' + allBody(list, shown) + '</tbody></table></div></div>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn btn-secondary" type="button" id="amore"' + (shown >= list.length ? " hidden" : "") + '>Show 50 more</button></div>';
  }
  function countText(shown, total) { return total ? "Showing " + shown + " of " + total + " patients." : "No patients match. Check the spelling or the NHS number."; }

  // ===== Scores by time point, whole cohort =====
  function timeline() {
    var st = an(), mi = st.tm != null ? +st.tm : 0, list = operated(), m = MEAS[mi];
    var pts = TPX.map(function (t) { var v = valuesAt(list, t[0], mi); return v.length ? { mean: mean(v), n: v.length } : null; });
    var series = [{ name: "Whole cohort", pts: pts }];
    var tbl = '<div class="scroll"><table class="ruled"><caption>Mean score (n) at each time point, whole cohort</caption><thead><tr><th scope="col">Score</th>' + TPX.map(function (t) { return '<th scope="col" class="num">' + t[1] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      MEAS.map(function (mm, i) { return '<tr><th scope="row">' + esc(mm.name) + '<br><span class="small muted">' + scaleWords(mm) + '</span></th>' + TPX.map(function (t) { var v = valuesAt(list, t[0], i); return '<td class="num">' + (v.length ? '<strong>' + r1(mean(v)) + '</strong> <span class="muted">(' + v.length + ')</span>' : '-') + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>';
    return '<div class="view-title"><div><h1>Scores by time point</h1><p class="muted" style="margin:0">Mean of every returned score at each time point. ' + list.length + ' patients have had surgery.</p></div></div>' + FLAG +
      '<div class="filters">' + sel("tm", "Score to chart", measureOpts(), mi) + '</div>' +
      '<section class="card an-fig"><figure><h2 class="an-h">' + esc(m.name) + ', whole cohort</h2>' + chart(series, mi, "bars", { labels: true, nRow: pts.map(function (p) { return p ? p.n : 0; }), title: "Mean " + m.name + " by time point, whole cohort", desc: "Invented data. " + describe(series, mi) }) +
      '<figcaption>Bars show the mean. n is the number of patients who returned this score. Patients drop out over time, so each bar is a different group.</figcaption></figure></section>' +
      '<section class="card" style="margin-top:20px">' + tbl + '<p class="small muted" style="margin:12px 0 0">A dash means no scores yet. Five-year scores exist only for operations before mid 2025.</p></section>';
  }

  // ===== Scores for one patient =====
  function matches(q) { return allRows(q, "all").filter(function (c) { return c.surgery || Object.keys(c.scores).length; }); }
  function matchList(q) {
    if (!q.trim()) return '<p class="muted">Type at least two letters of a name, or part of an NHS number.</p>';
    var list = matches(q);
    if (!list.length) return '<p>No patients match. Check the spelling or the NHS number.</p>';
    return '<p class="muted">' + list.length + (list.length === 1 ? " match" : " matches") + (list.length > 12 ? ". Showing the first 12." : ".") + '</p><ul class="an-results">' + list.slice(0, 12).map(function (c) { return '<li><a class="list-link" href="#bypatient/' + c.id + '"><span><strong>' + esc(c.name) + '</strong><br><span class="mono small">' + esc(c.nhs) + '</span></span><span class="small muted">' + esc(c.hospital) + '</span></a></li>'; }).join("") + '</ul>';
  }
  function byPatient(id) {
    var st = an(), q = st.pq || "", c = id ? cohort().filter(function (x) { return x.id === id; })[0] : null;
    var h = '<div class="view-title"><div><h1>Scores by patient</h1><p class="muted" style="margin:0">Find any patient and see their scores over time.</p></div></div>' + FLAG +
      '<div class="card an-search"><div class="field" style="margin:0"><label for="psearch">Search by name or NHS number</label><span class="hint" id="psearch-hint">For example Megan Sample or 999 526 0182.</span><input id="psearch" type="search" autocomplete="off" aria-describedby="psearch-hint" aria-controls="presults" value="' + esc(q) + '"></div><div id="presults" aria-live="polite">' + (q ? matchList(q) : "") + '</div></div>';
    if (!id) return h;
    if (!c) return h + '<p style="margin-top:20px">Patient not found. Search again.</p>';
    if (c.invented === false) { var lg = A.load().access[c.id]; if (!lg || !lg[0] || lg[0][2] !== "Viewed scores in analytics") A.logAccess(c.id, ME, "Viewed scores in analytics"); }
    h += '<section class="card" style="margin-top:20px"><h2 style="margin-top:0">' + esc(c.name) + '</h2><dl class="facts an-facts"><dt>NHS number</dt><dd class="mono">' + esc(c.nhs) + '</dd><dt>Record</dt><dd>' + (c.invented ? "Invented cohort case" : "Demo record") + '</dd><dt>Age at surgery, sex</dt><dd>' + c.age + ', ' + esc(c.sex) + '</dd><dt>Hospital</dt><dd>' + esc(c.hospital) + ', ' + esc(c.surgeon) + '</dd>' +
      (c.surgery ? '<dt>Surgery</dt><dd class="mono">' + fmt(c.surgery.date) + '</dd><dt>Graft</dt><dd>' + esc(c.graft) + '</dd><dt>Fixation</dt><dd>Femoral: ' + esc(c.femFix) + '. Tibial: ' + esc(c.tibFix) + '.</dd><dt>Other procedures</dt><dd>' + esc(otherText(c)) + '</dd>' : '<dt>Surgery</dt><dd>Not yet</dd>') +
      (c.revision ? '<dt>Revision</dt><dd>' + fmt(c.revision.date) + '. Scores stop here.</dd>' : '') + (c.invented ? '' : '<dt>Full record</dt><dd><a href="clinician.html#patient/' + c.id + '">Open in the clinician view</a></dd>') + '</dl></section>';
    h += '<section class="card" style="margin-top:20px"><h2 style="margin-top:0">Each score over time</h2><div class="multiples an-multiples">' + MEAS.map(function (m, i) {
      var pts = TPX.map(function (t) { var s = c.scores[t[0]]; return s && s.v[i] != null ? { mean: s.v[i], n: 1 } : null; });
      var words = TPX.map(function (t, k) { return t[1] + " " + (pts[k] ? pts[k].mean : (c.scores[t[0]] ? "missing" : "none")); }).join(", ");
      return '<figure><h3>' + esc(m.name) + '</h3><p class="small muted" style="margin:0">' + scaleWords(m) + '</p>' + chart([{ name: c.name, pts: pts }], i, "lines", { w: 300, h: 210, labels: true, noHead: true, int: true, title: m.name + " for " + c.name, desc: words + "." }) + '</figure>';
    }).join("") + '</div><p class="small muted">A gap means the score was not returned or is not yet due.</p></section>';
    h += '<section class="card" style="margin-top:20px"><div class="scroll"><table class="ruled"><caption>Scores for ' + esc(c.name) + '</caption><thead><tr><th scope="col">Time point</th><th scope="col">Date</th>' + MEAS.map(function (m) { return '<th scope="col" class="num">' + esc(m.short) + '</th>'; }).join("") + '</tr></thead><tbody>' +
      TPX.map(function (t) { var s = c.scores[t[0]]; return '<tr><th scope="row">' + t[1] + '</th>' + (s ? '<td class="mono" style="white-space:nowrap">' + fmt(s.date) + '</td>' + s.v.map(function (v) { return '<td class="num">' + (v == null ? '<span class="tag due">Missing</span>' : v) + '</td>'; }).join("") : '<td colspan="' + (MEAS.length + 1) + '"><span class="tag na">No scores</span></td>') + '</tr>'; }).join("") + '</tbody></table></div></section>';
    return h;
  }

  // ===== Score trends by group =====
  var DIMS = {
    graft: { label: "Graft type", vals: C.GRAFTS, get: function (c) { return [c.graft]; } },
    femFix: { label: "Femoral fixation", vals: C.FEM, get: function (c) { return [c.femFix]; } },
    tibFix: { label: "Tibial fixation", vals: C.TIB, get: function (c) { return [c.tibFix]; } },
    other: { label: "Other procedure", vals: C.OTHER.concat([C.NONE]), get: function (c) { return c.other; } },
    ageBand: { label: "Age band at surgery", vals: C.AGE_BANDS, get: function (c) { return [c.ageBand]; } },
    sex: { label: "Sex", vals: C.SEXES, get: function (c) { return [c.sex]; } }
  };
  var DIM_KEYS = Object.keys(DIMS);
  function trends() {
    var st = an(), mi = st.trm != null ? +st.trm : 0, by = st.trby || "graft", kind = st.trk || "lines", f = st.trf || {}, m = MEAS[mi];
    var list = operated().filter(function (c) { return DIM_KEYS.every(function (k) { return !f[k] || DIMS[k].get(c).indexOf(f[k]) >= 0; }); });
    var groups = DIMS[by].vals.concat([C.NOT_REC]).map(function (g) {
      var mem = list.filter(function (c) { return DIMS[by].get(c).indexOf(g) >= 0; });
      return { name: g, total: mem.length, cells: TPX.map(function (t) { var v = valuesAt(mem, t[0], mi); return { n: v.length, mean: v.length ? mean(v) : null }; }) };
    }).filter(function (g) { return g.total > 0; }).slice(0, STY.length);
    var series = groups.map(function (g) { return { name: g.name, total: g.total, pts: g.cells.map(function (x) { return x.n >= MIN_N ? { mean: x.mean, n: x.n } : null; }) }; });
    var allCells = TPX.map(function (t) { var v = valuesAt(list, t[0], mi); return { n: v.length, mean: v.length ? mean(v) : null }; });
    var filters = DIM_KEYS.map(function (k) { return sel("f-" + k, DIMS[k].label, [["", "All"]].concat(DIMS[k].vals.map(function (v) { return [v, v]; })), f[k] || ""); }).join("");
    var active = DIM_KEYS.filter(function (k) { return f[k]; }).map(function (k) { return DIMS[k].label + ": " + f[k]; });
    var h = '<div class="view-title"><div><h1>Score trends by group</h1><p class="muted" style="margin:0">Pick a score and a way to split patients. Add filters to narrow the group. Filters combine.</p></div></div>' + FLAG +
      '<div class="card an-controls" id="trform"><div class="an-row">' + sel("trm", "Score", measureOpts(), mi) + sel("trby", "Split patients by", DIM_KEYS.map(function (k) { return [k, DIMS[k].label]; }), by) + sel("trk", "Chart type", [["lines", "Lines"], ["bars", "Grouped bars"]], kind) + '</div>' +
      '<fieldset class="an-filterset"><legend>Filters</legend><div class="an-row">' + filters + '</div><div class="btn-row"><button class="btn btn-secondary btn-small" type="button" id="trclear"' + (active.length ? "" : " disabled") + '>Clear filters</button></div></fieldset></div>' +
      '<p role="status" class="an-status"><strong>' + list.length + '</strong> patients match' + (active.length ? ' (' + esc(active.join("; ")) + ')' : '') + '.</p>';
    if (!list.length) return h + '<p class="card">No patients match these filters. Clear one or more filters.</p>';
    var title = "Mean " + m.name + " by time point, split by " + DIMS[by].label.toLowerCase();
    h += '<section class="card an-fig"><figure><h2 class="an-h">' + esc(m.name) + ' by ' + esc(DIMS[by].label.toLowerCase()) + '</h2>' + chart(series, mi, kind, { title: title, desc: "Invented data. " + describe(series, mi) }) + legend(series, kind) +
      '<figcaption>' + (kind === "lines" ? "Points show the mean for each group." : "Bars show the mean for each group.") + ' Groups with fewer than ' + MIN_N + ' scores at a time point are not drawn. n in the key is the number of patients in each group.' + (by === "other" ? " A patient can have more than one other procedure, so groups overlap." : "") + '</figcaption></figure></section>';
    h += '<section class="card" style="margin-top:20px"><div class="scroll"><table class="ruled"><caption>' + esc(title) + '. Mean (n)</caption><thead><tr><th scope="col">' + esc(DIMS[by].label) + '</th><th scope="col" class="num">Patients</th>' + TPX.map(function (t) { return '<th scope="col" class="num">' + t[1] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      groups.map(function (g) { return '<tr><th scope="row">' + esc(g.name) + '</th><td class="num">' + g.total + '</td>' + g.cells.map(function (x) { return '<td class="num">' + (x.n >= MIN_N ? '<strong>' + r1(x.mean) + '</strong> <span class="muted">(' + x.n + ')</span>' : x.n ? '<span class="muted">Too few (' + x.n + ')</span>' : '-') + '</td>'; }).join("") + '</tr>'; }).join("") +
      '<tr class="an-total"><th scope="row">All matching</th><td class="num">' + list.length + '</td>' + allCells.map(function (x) { return '<td class="num">' + (x.n ? '<strong>' + r1(x.mean) + '</strong> <span class="muted">(' + x.n + ')</span>' : '-') + '</td>'; }).join("") + '</tr></tbody></table></div>' +
      '<p class="small muted" style="margin:12px 0 0">' + esc(m.name) + ' runs ' + scaleWords(m) + '. Means are not adjusted for age, follow-up or anything else. Do not read differences as clinical findings.</p></section>';
    return h;
  }

  function wireAnalytics() {
    document.querySelectorAll("select[data-an]").forEach(function (s) {
      s.addEventListener("change", function () {
        var id = s.id, st = an();
        if (id.indexOf("f-") === 0) { st.trf = st.trf || {}; st.trf[id.slice(2)] = s.value; }
        else if (id === "asrc") { st.src = s.value; st.shown = PAGE; }
        else st[id] = s.value;
        A.save(); rerender();
        var again = document.getElementById(id); if (again) again.focus();
      });
    });
    var clr = document.getElementById("trclear");
    if (clr) clr.addEventListener("click", function () { setAn("trf", {}); rerender(); var f = document.getElementById("f-graft"); if (f) f.focus(); A.toast("Filters cleared."); });
    var as = document.getElementById("asearch");
    if (as) {
      var upd = function () {
        var st = an(); st.q = as.value; st.shown = PAGE; A.save();
        var list = allRows(as.value, st.src || "all"), shown = Math.min(list.length, PAGE);
        document.getElementById("abody").innerHTML = allBody(list, shown);
        document.getElementById("acount").textContent = countText(shown, list.length);
        document.getElementById("amore").hidden = shown >= list.length;
      };
      as.addEventListener("input", upd);
    }
    var more = document.getElementById("amore");
    if (more) more.addEventListener("click", function () {
      var st = an(), list = allRows(st.q, st.src || "all"); st.shown = Math.min(list.length, (st.shown || PAGE) + PAGE); A.save();
      document.getElementById("abody").innerHTML = allBody(list, st.shown);
      document.getElementById("acount").textContent = countText(st.shown, list.length);
      more.hidden = st.shown >= list.length;
      if (more.hidden) document.getElementById("asearch").focus();
    });
    var ps = document.getElementById("psearch");
    if (ps) ps.addEventListener("input", function () {
      setAn("pq", ps.value);
      document.getElementById("presults").innerHTML = ps.value.trim().length >= 2 || /\d/.test(ps.value) ? matchList(ps.value) : matchList("");
    });
  }

  window.afterRender = function (route, args) {
    wireAnalytics();
    var rf = document.getElementById("reg");
    if (rf) rf.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = function (id) { return rf.querySelector("#" + id).value.trim(); }, errs = [];
      if (!v("fname")) errs.push(["fname", "Enter a first name"]);
      if (!v("lname")) errs.push(["lname", "Enter a last name"]);
      var dob = parseDate(v("dob"));
      if (!v("dob")) errs.push(["dob", "Enter a date of birth"]);
      else if (!dob) errs.push(["dob", "Date of birth must be a real date, like 27/03/2004"]);
      else if (A.d(dob) > A.today) errs.push(["dob", "Date of birth must be in the past"]);
      if (!v("sex")) errs.push(["sex", "Choose sex, or Not stated"]);
      var nhs = v("nhs").replace(/\s+/g, "");
      if (!nhs) errs.push(["nhs", "Enter an NHS number"]);
      else if (!/^\d{10}$/.test(nhs)) errs.push(["nhs", "NHS number must be 10 digits"]);
      else if (nhs.indexOf("999") !== 0) errs.push(["nhs", "In this demo the NHS number must start 999. Do not use a real one."]);
      else if (!A.nhsValid(nhs)) errs.push(["nhs", "NHS number is not valid. Check the last digit."]);
      else if (A.patients().some(function (p) { return p.nhs.replace(/\s+/g, "") === nhs; })) errs.push(["nhs", "This NHS number is already registered"]);
      if (v("phone") && !/^0\d{10}$/.test(v("phone").replace(/\s+/g, ""))) errs.push(["phone", "Mobile number must be 11 digits and start with 0"]);
      if (v("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email"))) errs.push(["email", "Enter an email address like name@example.com"]);
      var knee = rf.querySelector('input[name="knee"]:checked');
      if (!knee) errs.push(["knee-0", "Choose which knee"]);
      if (!v("hosp")) errs.push(["hosp", "Choose a hospital"]);
      if (!v("cons")) errs.push(["cons", "Choose a consultant"]);
      if (!A.showErrors(rf, errs)) return;
      var s = A.load(), id = "n" + (s.added.length + 1);
      s.added.push({ id: id, added: true, name: v("fname") + " " + v("lname"), sex: v("sex"), dob: dob, nhs: A.nhsFormat(nhs), phone: v("phone"), hospital: v("hosp"), surgeon: v("cons"), knee: knee.value,
        injury: { date: REG.today, how: "Not yet recorded.", findings: "Awaiting assessment." }, surgery: null, scores: {}, consent: { status: "pending", date: "", research: false },
        scans: [], letters: [], rehab: [], access: [[REG.today, ME, "Registered patient"]] });
      A.save(); A.toast("Patient saved.");
      A.go("register/" + id);
    });
    var tf = document.getElementById("tri");
    if (tf) tf.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var errs = [], dt = tf.querySelector("#tdate").value.trim(), iso = parseDate(dt);
      if (!dt) errs.push(["tdate", "Enter the date of injury"]);
      else if (!iso) errs.push(["tdate", "Date of injury must be a real date, like 02/04/2030"]);
      else if (A.d(iso) > A.today) errs.push(["tdate", "Date of injury must be today or in the past"]);
      if (!tf.querySelector("#thow").value.trim()) errs.push(["thow", "Say how the injury happened"]);
      if (!tf.querySelector("#tsport").value) errs.push(["tsport", "Choose the main sport, or No regular sport"]);
      var g = tf.querySelector('input[name="tgave"]:checked'), pv = tf.querySelector('input[name="tprev"]:checked');
      if (!g) errs.push(["tgave-0", "Say if the knee has given way"]);
      if (!pv) errs.push(["tprev-0", "Say if there was earlier surgery"]);
      if (!A.showErrors(tf, errs)) return;
      var id = args[0], s = A.load();
      s.triage[id] = { saved: true, date: dt, how: tf.querySelector("#thow").value.trim(), sport: tf.querySelector("#tsport").value, gave: g.value, prev: pv.value };
      A.save(); A.logAccess(id, ME, "Took triage history"); A.toast("Triage saved.");
      A.go("triage/" + id);
    });
    var sf = document.getElementById("sfilter");
    if (sf) sf.addEventListener("change", function () { var s = A.load(); s.statusFilter = sf.value; A.save(); rerender(); document.getElementById("sfilter").focus(); });
    var hf = document.getElementById("hfilter");
    if (hf) hf.addEventListener("change", function () { var s = A.load(); s.hospFilter = hf.value; A.save(); rerender(); document.getElementById("hfilter").focus(); });
    var cf = document.getElementById("cfilter");
    if (cf) cf.addEventListener("change", function () { var s = A.load(); s.consentFilter = cf.value; A.save(); rerender(); document.getElementById("cfilter").focus(); });
    document.querySelectorAll("[data-remind]").forEach(function (b) {
      b.addEventListener("click", function () { var id = b.getAttribute("data-remind"); remind([id]); A.toast("Reminder sent to " + A.patient(id).name + ". In this demo nothing is sent."); rerender(); });
    });
    var bf = document.getElementById("bulk");
    if (bf) bf.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ids = Array.prototype.map.call(bf.querySelectorAll(".pick:checked"), function (c) { return c.value; });
      if (!ids.length) { A.toast("Select at least one patient first."); return; }
      remind(ids.filter(function (x, i, a) { return a.indexOf(x) === i; })); A.toast(ids.length + " reminders sent. In this demo nothing is sent."); rerender();
    });
    document.querySelectorAll("[data-consent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-consent"), s = A.load();
        s.consent[id] = { status: "given", date: REG.today }; A.save(); A.logAccess(id, ME, "Recorded consent");
        A.toast("Consent recorded for " + A.patient(id).name + "."); rerender();
      });
    });
  };

  A.router({ today: today, register: register, triage: triage, status: status, overdue: overdue, consent: consent, all: allPatients, timeline: timeline, bypatient: byPatient, trends: trends }, "today");
})();
