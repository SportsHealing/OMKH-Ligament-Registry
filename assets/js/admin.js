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
      st.partial.forEach(function (o) { items.push([p, o + " Marx score", "Not returned", "due"]); });
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

  window.afterRender = function (route, args) {
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
        injury: { date: REG.today, how: "Not yet recorded.", findings: "Awaiting assessment.", marxBefore: 0 }, surgery: null, scores: {}, consent: { status: "pending", date: "", research: false },
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

  A.router({ today: today, register: register, triage: triage, status: status, overdue: overdue, consent: consent }, "today");
})();
