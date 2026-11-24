/* Clinician workspace demo. Signed in as the invented surgeon Ms Rachel Example. */
(function () {
  var A = App, esc = A.esc, fmt = A.fmt, ME = REG.user.clinician;

  function tags(p) {
    var st = A.status(p), out = [];
    if (p.revision) out.push('<span class="tag err">Revised</span>');
    if (st.opForm === "incomplete") out.push('<span class="tag due">Op form unfinished</span>');
    if (st.overdue.length) out.push('<span class="tag err">' + st.overdue.length + ' overdue</span>');
    if (st.partial.length) out.push('<span class="tag due">Score missing</span>');
    if (st.dueSoon) out.push('<span class="tag due">Due now</span>');
    if (p.consent.status !== "given") out.push('<span class="tag due">Consent ' + esc(p.consent.status) + '</span>');
    if (!p.surgery) out.push('<span class="tag na">Awaiting surgery</span>');
    if (!out.length) out.push('<span class="tag ok">Up to date</span>');
    return out.join(" ");
  }

  // A clinician sees only their own patients. The administrator sees everyone.
  function mine() { return A.patients().filter(function (p) { return p.surgeon === ME; }); }
  function own(id) { var p = A.patient(id); return p && p.surgeon === ME ? p : null; }
  function notYours(id) {
    var p = A.patient(id);
    if (!p) return '<h1>Patient not found</h1><a href="#list">Back to your patients</a>';
    return '<h1>Not one of your patients</h1><p>This record belongs to another surgeon. A clinician sees only their own patients. In the demo, the administrator role can see every patient.</p><a class="btn" href="#list">Back to your patients</a>';
  }

  function list() {
    var q = (A.load().search || "");
    return '<div class="view-title"><div><h1>Your patients: ' + mine().length + '</h1><p class="muted" style="margin:0">Only patients under ' + esc(ME) + '. Other surgeons\' patients are not shown.</p></div><a class="btn btn-secondary btn-small" href="#outcomes">My outcomes</a></div>' +
      '<form id="search" class="filters" role="search"><div class="field"><label for="q">Find a patient</label><span class="hint" id="q-hint">NHS number or name. For example 999 526 0182.</span><input type="search" id="q" data-hint="q-hint" aria-describedby="q-hint" autocomplete="off" value="' + esc(q) + '"></div><button class="btn" type="submit">Search</button></form>' +
      '<p id="count" class="muted" role="status"></p><div class="card" style="padding:8px 16px"><div class="scroll"><table><caption class="visually-hidden">Patient list</caption><thead><tr><th scope="col">Name</th><th scope="col">NHS no.</th><th scope="col">Knee</th><th scope="col">Surgery</th><th scope="col">Status</th></tr></thead><tbody id="rows"></tbody></table></div></div>';
  }
  function fillRows(q) {
    var norm = q.replace(/\s+/g, "").toLowerCase();
    var ps = mine().filter(function (p) { return !norm || p.nhs.replace(/\s+/g, "").indexOf(norm) >= 0 || p.name.toLowerCase().replace(/\s+/g, "").indexOf(norm) >= 0; });
    document.getElementById("rows").innerHTML = ps.map(function (p) {
      return '<tr><td><a href="#patient/' + p.id + '"><strong>' + esc(p.name) + '</strong></a>' + (p.added ? ' <span class="tag ok">New</span>' : '') + '</td><td class="mono">' + esc(p.nhs) + '</td><td>' + esc(p.knee) + '</td><td class="mono">' + (p.surgery ? fmt(p.surgery.date) : "None yet") + '</td><td>' + tags(p) + '</td></tr>';
    }).join("") || '<tr><td colspan="5">No patient matches. Check the NHS number, or <a href="admin.html#register">register a new patient</a>.</td></tr>';
    document.getElementById("count").textContent = ps.length + (ps.length === 1 ? " patient" : " patients") + (norm ? " match in your list" : " in your list") + ".";
    return ps;
  }

  function record(id) {
    if (!id) return '<h1>Record</h1><p>Choose a patient first.</p><a class="btn" href="#list">Go to the patient list</a>';
    var p = own(id);
    if (!p) return notYours(id);
    var s = A.load(); s.viewed = s.viewed || {};
    if (!s.viewed[id]) { s.viewed[id] = 1; A.save(); A.logAccess(id, ME, "Opened record in clinic"); p = A.patient(id); }
    var st = A.status(p);
    function sc(tp) { var x = p.scores[tp]; return x && x.v[A.M.ikdc] != null ? x.v[A.M.ikdc] : null; }
    var next = st.next ? (st.next.date ? A.fmtMonth(st.next.date) : "Before surgery") : "None";
    var summary = '<p class="small muted" style="margin:0 0 4px">IKDC score, 0 to 100. Higher is better.</p><div class="scorerow" aria-label="IKDC by time point"><div><b>' + (sc("pre") == null ? "-" : sc("pre")) + '</b><span>Before</span></div><div><b>' + (sc("y1") == null ? "-" : sc("y1")) + '</b><span>1 year</span></div><div><b>' + (sc("y2") == null ? "-" : sc("y2")) + '</b><span>2 years</span></div><div class="due"><b style="font-size:18px;line-height:34px">' + (st.dueSoon ? "Due now" : "Next") + '</b><span>' + esc(next) + '</span></div></div>';
    var strip = '<div class="strip">' +
      '<div><span class="lbl">Born</span><span class="mono">' + fmt(p.dob) + '</span> (' + A.age(p.dob) + ')</div><div><span class="lbl">Sex</span>' + esc(p.sex) + '</div>' +
      '<div><span class="lbl">NHS no.</span><span class="mono">' + esc(p.nhs) + '</span></div><div><span class="lbl">Knee</span>' + esc(p.knee) + '</div>' +
      '<div><span class="lbl">Surgeon</span>' + esc(p.surgeon) + '</div><div><span class="lbl">Consent</span>' + (p.consent.status === "given" ? '<span class="tag ok">Given</span>' : '<span class="tag due">' + esc(p.consent.status) + '</span>') + '</div>' +
      '<div><span class="lbl">Revision</span>' + (p.revision ? '<span class="tag err">' + fmt(p.revision.date) + '</span>' : "None") + '</div></div>';

    // Data status checklist and the one primary action.
    var checks = [["Consent", p.consent.status === "given"], ["Triage history", !!(A.load().triage[id] || p.surgery)], ["Before-surgery scores", !!p.scores.pre]];
    if (p.surgery) checks.push(["Surgical form", st.opForm === "complete"]);
    A.TPS.slice(1).forEach(function (t) {
      if (!p.surgery) return;
      var x = p.scores[t[0]];
      if (x) checks.push([t[1] + " scores", !x.v.some(function (v) { return v === null; }), x.v.some(function (v) { return v === null; }) ? A.MEASURES.filter(function (m, i) { return x.v[i] === null; }).map(function (m) { return m.short; }).join(", ") + " missing" : null]);
      else if (st.overdue.some(function (o) { return o.tp === t[0]; })) checks.push([t[1] + " scores", false, "Overdue"]);
      else if (st.dueSoon && st.dueSoon.tp === t[0]) checks.push([t[1] + " scores", false, "Due now"]);
    });
    var cl = '<ul class="checklist">' + checks.map(function (c) { return '<li><span>' + c[0] + '</span>' + (c[1] ? '<span class="tag ok">Done</span>' : '<span class="tag ' + (c[2] === "Overdue" ? "err" : "due") + '">' + (c[2] || "Missing") + '</span>') + '</li>'; }).join("") + '</ul>';
    var action;
    if (st.opForm === "incomplete") action = '<a class="btn" href="#opform/' + id + '">Finish surgical form</a>';
    else if (st.overdue.length || st.partial.length || st.dueSoon) action = '<button class="btn" type="button" data-remind="' + id + '">Send a reminder</button>';
    else if (p.consent.status !== "given") action = '<a class="btn" href="admin.html#consent">Ask the clinic team about consent</a>';
    else action = '<p class="muted" style="margin:0">Nothing to chase.</p>';
    var reminded = A.load().reminders[id];

    var tl = [[p.injury.date, "Injury", p.injury.how]];
    if (p.surgery) tl.push([p.surgery.date, p.surgery.type, p.surgery.graft]);
    p.rehab.forEach(function (r) { tl.push([r[0], "Rehab milestone", r[1]]); });
    if (p.revision) tl.push([p.revision.date, "Revision surgery", p.revision.reason]);
    tl.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });

    var surg = p.surgery ? '<dl class="facts"><dt>Date</dt><dd class="mono">' + fmt(p.surgery.date) + '</dd><dt>Graft</dt><dd>' + esc(p.surgery.graft || "Not recorded") + '</dd><dt>Femur</dt><dd>' + esc(p.surgery.femFix || "Not recorded") + '</dd><dt>Tibia</dt><dd>' + esc(p.surgery.tibFix || "Not recorded") + '</dd><dt>Meniscus</dt><dd>' + esc(p.surgery.meniscus || "Not recorded") + '</dd><dt>Cartilage</dt><dd>' + esc(p.surgery.cartilage || "Not recorded") + '</dd><dt>Form</dt><dd>' + (st.opForm === "complete" ? '<span class="tag ok">Signed</span>' : '<a href="#opform/' + id + '">Finish the form</a>') + '</dd></dl>' : '<p>No surgery yet.</p>';

    return '<div class="view-title"><div><p class="muted" style="margin:0"><a href="#list">Patients</a> / Record</p><h1>' + esc(p.name) + '</h1><p class="muted" style="margin:0">' + esc(p.knee) + ' knee. ' + esc(p.surgery ? p.surgery.type : "Awaiting surgery") + '. ' + esc(p.hospital) + '.</p></div><div style="flex:0 1 420px;min-width:min(100%,300px)">' + summary + '</div></div>' +
      strip +
      '<div class="layout" style="margin-top:20px"><aside class="card"><h2>Data status</h2>' + cl + '<div style="margin-top:16px">' + action + '</div>' + (reminded ? '<p class="small muted" style="margin-top:8px">Reminder sent ' + fmt(reminded) + '.</p>' : '') + '</aside>' +
      '<div class="main"><div class="two"><section class="card"><h2>Injury</h2><dl class="facts"><dt>Date</dt><dd class="mono">' + fmt(p.injury.date) + '</dd><dt>How</dt><dd>' + esc(p.injury.how) + '</dd><dt>Findings</dt><dd>' + esc(p.injury.findings) + '</dd></dl></section>' +
      '<section class="card"><h2>Surgery</h2>' + surg + '</section></div>' +
      '<section class="card"><h2>Scores: baseline, 1 year and 2 years</h2>' + A.multiples(p, 1) + A.scoreTable(p) + '</section>' +
      '<div class="two"><section class="card"><h2>Timeline</h2><ol class="timeline">' + tl.map(function (t) { return '<li class="done"><span class="when mono">' + fmt(t[0]) + '</span><br><strong>' + esc(t[1]) + '</strong><br><span class="muted">' + esc(t[2]) + '</span></li>'; }).join("") + '</ol></section>' +
      '<section class="card"><h2>Scans</h2>' + (p.scans.length ? p.scans.map(function (x, i) { return '<a class="list-link" href="#scan/' + id + '/' + i + '"><span><strong>' + esc(x[1]) + '</strong><br><span class="muted"><span class="mono">' + fmt(x[0]) + '</span>. ' + esc(x[2]) + '</span></span><span>Open</span></a>'; }).join("") : '<p class="muted">No scans on file.</p>') +
      '<h2 style="margin-top:20px">Op notes and letters</h2>' + (p.letters.length ? p.letters.map(function (x, i) { return '<a class="list-link" href="#note/' + id + '/' + i + '"><span><strong>' + esc(x[1]) + '</strong><br><span class="muted mono">' + fmt(x[0]) + '</span></span><span>Open</span></a>'; }).join("") : '<p class="muted">No letters on file.</p>') + '</section></div>' +
      '<section class="card"><h2>Access log</h2><div class="scroll"><table><thead><tr><th scope="col">Date</th><th scope="col">Who</th><th scope="col">Why</th></tr></thead><tbody>' + p.access.map(function (a) { return '<tr><td class="mono">' + fmt(a[0]) + '</td><td>' + esc(a[1]) + '</td><td>' + esc(a[2]) + '</td></tr>'; }).join("") + '</tbody></table></div></section></div></div>';
  }

  function doc(kind) {
    return function (id, i) {
      var p = own(id); if (!p) return notYours(id); var f = (kind === "scan" ? p.scans[+i] : p.letters[+i]);
      if (!f) return '<h1>Not found</h1><a href="#list">Back to the patient list</a>';
      return '<p><a href="#patient/' + id + '">Back to ' + esc(p.name) + '</a></p><div class="card" style="max-width:760px"><h1 style="font-size:30px">' + esc(f[1]) + '</h1><p class="muted mono">' + fmt(f[0]) + '</p>' +
        (kind === "scan" ? '<div class="info">The image viewer is not built in this mock-up.</div><h2 style="margin-top:16px">Report</h2><p>' + esc(f[2]) + '</p>' : '<p>Author: ' + esc(f[2]) + '.</p><div class="info">Placeholder text. A real note would appear here.</div>') + '</div>';
    };
  }

  var GRAFTS = ["Hamstring autograft", "Patellar tendon (BTB) autograft", "Quadriceps tendon autograft", "Allograft"];
  var FIX = ["Suspensory button", "Interference screw", "Cross pin", "Other"];
  var MEN = ["No tear", "Medial repair", "Lateral repair", "Medial partial meniscectomy", "Lateral partial meniscectomy", "Tear left alone"];
  var CART = ["No damage above grade 2", "Grade 3", "Grade 4"];
  function radioGroup(name, legend, opts, val) {
    return '<fieldset id="' + name + '-fs"><legend>' + legend + '</legend><div class="choices-inline">' + opts.map(function (o, i) {
      return '<label class="choice"><input type="radio" id="' + name + '-' + i + '" name="' + name + '" value="' + esc(o) + '"' + (val && val.indexOf(o) === 0 ? " checked" : "") + '>' + esc(o) + '</label>';
    }).join("") + '</div></fieldset>';
  }
  function select(id, label, opts, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '"><option value="">Choose</option>' + opts.map(function (o) { return '<option' + (val === o ? " selected" : "") + '>' + esc(o) + '</option>'; }).join("") + '</select></div>';
  }
  function opform(id) {
    var ps = mine().filter(function (p) { return p.surgery; });
    if (!id) {
      var open = ps.filter(function (p) { return A.status(p).opForm === "incomplete"; });
      return '<h1>Surgical form</h1><p>Fill this in at the end of a case. Four questions. Aim for under two minutes.</p><div class="card"><h2>Forms to finish</h2>' +
        (open.length ? open.map(function (p) { return '<a class="list-link" href="#opform/' + p.id + '"><span><strong>' + esc(p.name) + '</strong><br><span class="muted"><span class="mono">' + esc(p.nhs) + '</span>. Surgery <span class="mono">' + fmt(p.surgery.date) + '</span></span></span><span>Open form</span></a>'; }).join("") : '<p class="muted">All surgical forms are complete.</p>') + '</div>';
    }
    var p = own(id);
    if (!p) return notYours(id);
    if (!p.surgery) return '<h1>No surgery to record</h1><a href="#opform">Back to forms</a>';
    var s = p.surgery;
    return '<p class="muted" style="margin:0"><a href="#patient/' + id + '">' + esc(p.name) + '</a> / Surgical form</p><h1>Surgical form</h1><p><span class="mono">' + esc(p.nhs) + '</span>. ' + esc(p.knee) + ' knee. ' + esc(s.type) + ', <span class="mono">' + fmt(s.date) + '</span>.</p>' +
      '<form id="opf" class="card" novalidate style="max-width:860px"><div class="error-summary" tabindex="-1" hidden><h2>There is a problem</h2><ul></ul></div>' +
      radioGroup("graft", "1. Graft", GRAFTS, s.graft) +
      '<fieldset><legend>2. Fixation</legend>' + select("femfix", "Femur", FIX, s.femFix) + select("tibfix", "Tibia", FIX, s.tibFix) + '</fieldset>' +
      '<fieldset><legend>3. Meniscus</legend>' + select("men", "What was done to the meniscus?", MEN, MEN.indexOf(s.meniscus) >= 0 ? s.meniscus : "") + '</fieldset>' +
      '<fieldset><legend>4. Cartilage</legend>' + select("cart", "Worst cartilage damage seen", CART, CART.indexOf(s.cartilage) >= 0 ? s.cartilage : "") + '</fieldset>' +
      '<div class="btn-row"><button class="btn" type="submit">Save and sign form</button><a href="#patient/' + id + '">Cancel</a></div></form>';
  }

  function outcomes() {
    var n = REG.national;
    function pair(title, mine, nat, unit, max, note) {
      var W = 520, a = mine / max * 340, b = nat / max * 340;
      return '<figure class="card"><h2>' + title + '</h2><svg class="chart" viewBox="0 0 ' + W + ' 110" width="100%" role="img" aria-label="' + esc(title + ". You: " + mine + unit + ". National: " + nat + unit + ". Invented figures.") + '">' +
        '<text x="0" y="34">You</text><rect x="110" y="18" width="' + a + '" height="24" rx="3" fill="var(--c-2y)"></rect><text class="val" x="' + (118 + a) + '" y="35">' + mine + unit + '</text>' +
        '<text x="0" y="84">National</text><rect x="110" y="68" width="' + b + '" height="24" rx="3" fill="var(--c-nat)"></rect><text class="val" x="' + (118 + b) + '" y="85">' + nat + unit + '</text></svg><figcaption>' + note + '</figcaption></figure>';
    }
    return '<div class="view-title"><h1>My outcomes</h1></div><p class="note"><strong>All figures on this page are invented.</strong> They do not describe any real surgeon, hospital or registry.</p>' +
      '<div class="two" style="margin-top:20px">' + pair("Revision within 5 years", n.revisionMine, n.revisionNat, "%", 6, "<strong>Figure 2.</strong> Lower is better. You: " + n.casesMine + " cases. National: " + n.casesNat + " cases. Invented.") +
      pair("IKDC at 2 years, median", n.ikdc2yMine, n.ikdc2yNat, "", 100, "<strong>Figure 3.</strong> 0 to 100. Higher is better. Invented.") +
      pair("KOOS Sport at 2 years, median", n.sport2yMine, n.sport2yNat, "", 100, "<strong>Figure 4.</strong> 0 to 100. Higher is better. Invented.") +
      pair(A.PAIN.label + " at 2 years, median", n.pain2yMine, n.pain2yNat, "", A.PAIN.max, "<strong>Figure 5.</strong> " + A.PAIN.min + " to " + A.PAIN.max + ". " + (A.PAIN.lowerBetter ? "Lower" : "Higher") + " is better. Invented.") +
      pair("SANE at 2 years, median", n.sane2yMine, n.sane2yNat, "%", 100, "<strong>Figure 6.</strong> 0 to 100%. Higher is better. Invented.") +
      pair("Back to the same sport by 2 years", n.returnRateMine, n.returnRateNat, "%", 100, "<strong>Figure 7.</strong> Higher is better. Invented.") +
      '<section class="card"><h2>Your cases by year</h2><div class="scroll"><table class="ruled"><thead><tr><th scope="col">Year</th><th scope="col" class="num">Cases</th><th scope="col" class="num">Revision rate</th></tr></thead><tbody>' +
      n.perYear.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="num">' + r[1] + '</td><td class="num">' + r[2] + '%</td></tr>'; }).join("") + '</tbody></table></div><p class="small muted" style="margin-top:8px">Invented figures for the demo year.</p></section></div>';
  }

  window.afterRender = function (route, args) {
    var f = document.getElementById("search");
    if (f) {
      var q = document.getElementById("q");
      fillRows(q.value);
      q.addEventListener("input", function () { var s = A.load(); s.search = q.value; A.save(); fillRows(q.value); });
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var ps = fillRows(q.value);
        if (ps.length === 1) A.go("patient/" + ps[0].id);
      });
    }
    document.querySelectorAll("[data-remind]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-remind"), s = A.load();
        s.reminders[id] = REG.today; A.save(); A.logAccess(id, ME, "Sent a score reminder");
        var p = A.patient(id); A.toast("Reminder sent to " + p.name + ". In this demo nothing is sent.");
        A.go("patient/" + id);
      });
    });
    var of = document.getElementById("opf");
    if (of) of.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var id = args[0], errs = [], g = of.querySelector('input[name="graft"]:checked');
      if (!g) errs.push(["graft-0", "Choose the graft"]);
      [["femfix", "Choose the femoral fixation"], ["tibfix", "Choose the tibial fixation"], ["men", "Say what was done to the meniscus"], ["cart", "Choose the worst cartilage damage seen"]].forEach(function (x) {
        if (!of.querySelector("#" + x[0]).value) errs.push(x);
      });
      if (!A.showErrors(of, errs)) return;
      var p = A.patient(id), keepSize = /,\s*(.+)$/.exec(p.surgery.graft || "");
      var s = A.load();
      s.ops[id] = { graft: g.value + (keepSize && p.surgery.graft.indexOf(g.value) === 0 ? ", " + keepSize[1] : ""), femFix: of.querySelector("#femfix").value, tibFix: of.querySelector("#tibfix").value, meniscus: of.querySelector("#men").value, cartilage: of.querySelector("#cart").value };
      A.save(); A.logAccess(id, ME, "Signed surgical form");
      A.toast("Surgical form saved and signed for " + p.name + ".");
      A.go("patient/" + id);
    });
  };

  A.router({ list: list, patient: record, opform: opform, outcomes: outcomes, scan: doc("scan"), note: doc("note") }, "list");
})();
