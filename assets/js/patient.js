/* Patient portal demo. Signed in as the invented patient Megan Sample. */
(function () {
  var A = App, esc = A.esc, fmt = A.fmt;
  var PID = REG.user.patient;
  function me() { return A.patient(PID); }
  function first(p) { return p.name.split(" ")[0]; }
  function formDone() { return !!A.load().answers[PID]; }

  var M = A.M, PAIN = A.PAIN;
  // Shortened demo items. Not the validated forms. Each item: [id, part, question, options (best first where it matters)].
  var HARD = ["Not hard at all", "A little hard", "Fairly hard", "Very hard", "I cannot do it"];
  var IKDC_Q = [
    ["i1", "IKDC", "What is the hardest activity you can do without bad knee pain?", ["Jumping or pivoting, as in netball", "Heavy work, skiing or tennis", "Running or jogging", "Walking or housework", "None of these"]],
    ["i2", "IKDC", "How hard is it to squat down?", HARD],
    ["i3", "IKDC", "How hard is it to jump and land on your injured leg?", HARD]
  ];
  var KOOS_Q = [
    ["k1", "KOOS Pain", "How often do you have knee pain?", ["Never", "Monthly", "Weekly", "Daily", "Always"]],
    ["k2", "KOOS Symptoms", "How stiff is your knee after you first wake up?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["k3", "KOOS Daily living", "How hard is it to go up or down stairs?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["k4", "KOOS Sport", "How hard is it to twist or pivot on your injured knee?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["k5", "KOOS Quality of life", "How much has your knee made you change the way you live?", ["Not at all", "Mildly", "Moderately", "Severely", "Totally"]]
  ];
  var PAIN_Q = [["ps1", PAIN.label, PAIN.question + " (" + PAIN.anchors.join(", ") + ")", PAIN.options]];
  var SANE_Q = [["s1", "SANE", "How would you rate your knee today, as a percentage of normal?", ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]]];
  var LAST_Q = PAIN_Q.concat(SANE_Q);
  var ALL_Q = IKDC_Q.concat(KOOS_Q, LAST_Q);
  var TP_WORDS = { pre: "before surgery", y1: "at 1 year", y2: "at 2 years" };

  // Your scores over time, in plain words.
  function plain(p) {
    function series(i) {
      return ["pre", "y1", "y2"].filter(function (t) { return p.scores[t] && p.scores[t].v[i] != null; })
        .map(function (t) { return [t, p.scores[t].v[i]]; });
    }
    function said(s, unit) { return s.map(function (x) { return "<strong>" + x[1] + (unit || "") + "</strong> " + TP_WORDS[x[0]]; }).join(", "); }
    function trend(s, lower) {
      if (s.length < 2) return "";
      var a = s[0][1], b = s[s.length - 1][1];
      if (a === b) return " It has stayed the same.";
      return (b > a) !== lower ? " That is better than before." : " That is worse than before. Your team will look at this.";
    }
    var out = [], s;
    s = series(M.ikdc); if (s.length) out.push("<li><strong>IKDC</strong> (0 to 100, higher is better): " + said(s) + "." + trend(s, false) + " Your latest score counts as " + REG.ikdcBand(s[s.length - 1][1]).toLowerCase() + ".</li>");
    s = series(M.koosSport); if (s.length) out.push("<li><strong>KOOS Sport and recreation</strong> (0 to 100, higher is better): " + said(s) + "." + trend(s, false) + " <a href=\"#scores\">See all five KOOS parts</a>.</li>");
    s = series(M.pain); if (s.length) out.push("<li><strong>" + esc(PAIN.label) + "</strong> (" + PAIN.min + " to " + PAIN.max + ", lower is better): " + said(s) + "." + trend(s, PAIN.lowerBetter) + " Your latest score means " + PAIN.words(s[s.length - 1][1]) + ".</li>");
    s = series(M.sane); if (s.length) out.push("<li><strong>SANE</strong> (your knee as a percentage of normal): " + said(s, "%") + "." + trend(s, false) + "</li>");
    return out.length ? '<ul class="stack" style="padding-left:20px">' + out.join("") + "</ul>" : '<p class="muted">No scores yet.</p>';
  }
  function scores() {
    var p = me();
    return '<div class="phone stack"><div class="view-title"><h1>Your scores</h1></div><section class="card"><h2>Over time</h2>' + plain(p) + '</section>' +
      '<section class="card"><h2>All scores</h2>' + A.scoreTable(p) + '<p class="small muted" style="margin-top:8px">IKDC, KOOS and SANE: higher is better. ' + esc(PAIN.label) + ': lower is better. <a href="../patients.html#scores">What your scores mean</a>.</p></section>' +
      '<p><a href="#home">Back to your knee</a></p></div>';
  }

  function draft() { var s = A.load(); if (!s.draft) s.draft = {}; return s.draft; }

  function reminderCard(p) {
    var st = A.status(p);
    if (formDone()) return '<div class="info"><strong>Thank you, ' + esc(first(p)) + '.</strong> Your 2-year scores are in. Your next form is due in ' + A.fmtMonth(A.addYears(p.surgery.date, 5)) + '.</div>';
    if (!st.dueSoon) return "";
    return '<div class="card" style="border:2px solid var(--c-1y)"><h2>Hi ' + esc(first(p)) + ', one short form is waiting.</h2><p>Your ' + esc(st.dueSoon.label.replace(/^(\d+) years?$/, "$1-year")) + ' scores. It takes about five minutes. Your answers help surgeons learn which repairs last.</p><a class="btn" href="#form">Start the form</a></div>';
  }

  function home() {
    var p = me();
    return '<div class="phone stack"><div class="view-title"><h1>Your knee</h1><span class="tag ok">' + esc(p.knee) + ' knee</span></div>' +
      reminderCard(p) +
      '<section class="card" aria-labelledby="prog"><h2 id="prog">How your knee is doing</h2>' +
      plain(p) +
      '<figure>' + A.line(p, M.ikdc) + '<figcaption>IKDC score at each time point. 0 to 100. Higher is better.</figcaption></figure>' +
      '<p><a href="#scores">See all your scores</a> or <a href="#timeline">your full timeline</a>.</p></section>' +
      '<div class="grid"><a class="card list-link" href="#files"><span><strong>Scans and letters</strong><br><span class="muted">' + (p.scans.length + p.letters.length) + ' files</span></span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#sharing"><span><strong>Who can see your record</strong><br><span class="muted">Change access</span></span><span aria-hidden="true">&rarr;</span></a></div></div>';
  }

  function timeline() {
    var p = me(), items = [];
    items.push([p.injury.date, "Injury", p.injury.how + " " + p.injury.findings, "done"]);
    p.scans.forEach(function (s, i) { items.push([s[0], s[1], s[2] + ' <a href="#file/scan/' + i + '">Open</a>', "done"]); });
    items.push([p.surgery.date, "Surgery", esc(p.surgery.type) + " with " + esc(p.surgery.surgeon || p.surgeon) + ".", "done"]);
    p.rehab.forEach(function (r) { items.push([r[0], "Rehab", esc(r[1]) + ".", "done"]); });
    A.TPS.forEach(function (t) { var sc = p.scores[t[0]]; if (sc) items.push([sc.date, t[1] + " scores", "You filled in your form. IKDC " + (sc.v[M.ikdc] == null ? "not given" : sc.v[M.ikdc]) + ". " + PAIN.short + " " + (sc.v[M.pain] == null ? "not given" : sc.v[M.pain] + " out of " + PAIN.max) + ".", "done"]); });
    items.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    var st = A.status(p);
    if (!formDone() && st.dueSoon) items.push([A.today.toISOString().slice(0, 10), "2-year scores due now", '<a href="#form">Fill in the form</a>. About five minutes.', "wait"]);
    items.push([A.addYears(p.surgery.date, 5), "5-year scores", "We will remind you nearer the time.", ""]);
    return '<div class="phone"><div class="view-title"><h1>Your timeline</h1></div><ol class="timeline">' + items.map(function (i) {
      return '<li class="' + i[3] + '"><span class="when mono">' + fmt(i[0]) + '</span><h2 style="font-size:19px;margin:2px 0 4px">' + esc(i[1]) + '</h2><p class="muted" style="margin:0">' + i[2] + '</p></li>';
    }).join("") + '</ol></div>';
  }

  function radios(name, opts, val) {
    return '<div class="scale">' + opts.map(function (o, i) {
      return '<label><input type="radio" id="' + name + '-' + i + '" name="' + name + '" value="' + i + '"' + (String(val) === String(i) ? " checked" : "") + '>' + esc(o) + '</label>';
    }).join("") + '</div>';
  }
  function stepShell(n, title, inner) {
    return '<div class="phone"><p class="muted" style="margin:0">Step ' + n + ' of 4</p><div class="progress" aria-hidden="true"><span style="width:' + Math.round(n / 4 * 100) + '%"></span></div>' +
      '<h1>' + title + '</h1><form id="qform" novalidate><div class="error-summary" tabindex="-1" hidden><h2>There is a problem</h2><ul></ul></div>' + inner + '</form></div>';
  }
  function form(step) {
    var p = me();
    if (formDone()) return '<div class="phone"><h1>Form already sent</h1><p>Thank you. Your 2-year scores are in.</p><a class="btn" href="#home">Back to your knee</a></div>';
    var dr = draft();
    function qs(list) {
      return list.map(function (q) {
        return '<fieldset id="' + q[0] + '"><legend>' + esc(q[2]) + ' <span class="muted small">(' + esc(q[1]) + ')</span></legend>' + radios(q[0], q[3], dr[q[0]]) + '</fieldset>';
      }).join("");
    }
    if (!step) {
      return '<div class="phone stack"><div><h1>Your 2-year knee form</h1><p class="lead">About five minutes. Ten questions in three parts.</p></div>' +
        '<div class="card"><h2>What we ask</h2><p><strong>Part 1. IKDC.</strong> Three questions about what your knee lets you do.</p><p><strong>Part 2. KOOS.</strong> Five questions about pain, stiffness, daily life, sport and how you live.</p><p><strong>Part 3. Pain and overall.</strong> The ' + esc(PAIN.label.toLowerCase()) + ' and one SANE question: your knee as a percentage of normal.</p>' +
        '<p class="muted small">This is a shortened demo, not the validated forms. The full IKDC form has 18 questions and the full KOOS has 42. Nothing you choose is sent anywhere.</p></div>' +
        '<div class="btn-row"><a class="btn" href="#form/1">Start</a><a href="#home">Do it later</a></div></div>';
    }
    if (step === "1") {
      return stepShell(1, "Part 1. IKDC", '<p class="muted">Shortened demo. 3 of the 18 IKDC questions.</p>' + qs(IKDC_Q) +
        '<div class="btn-row"><button class="btn" type="submit">Save and continue</button><a href="#form">Back</a></div>');
    }
    if (step === "2") {
      return stepShell(2, "Part 2. KOOS", '<p class="muted">Shortened demo. 5 of the 42 KOOS questions. Think about the last week.</p>' + qs(KOOS_Q) +
        '<div class="btn-row"><button class="btn" type="submit">Save and continue</button><a href="#form/1">Back</a></div>');
    }
    if (step === "3") {
      return stepShell(3, "Part 3. Pain and overall", '<p class="muted">One pain question and one overall question.</p>' + qs(LAST_Q) +
        '<div class="btn-row"><button class="btn" type="submit">Save and continue</button><a href="#form/2">Back</a></div>');
    }
    if (step === "4") {
      var rows = ALL_Q.map(function (q) { return '<div class="row"><span>' + esc(q[2]) + '</span><strong>' + esc(dr[q[0]] != null ? q[3][dr[q[0]]] : "Not answered") + '</strong></div>'; }).join("");
      return stepShell(4, "Check your answers", '<div class="card">' + rows + '</div><p style="margin-top:16px"><a href="#form/1">Change part 1</a>, <a href="#form/2">change part 2</a> or <a href="#form/3">change part 3</a>.</p><div class="btn-row"><button class="btn" type="submit">Send my answers</button></div>');
    }
    return '<div class="phone"><h1>Page not found</h1><a href="#form">Back to the form</a></div>';
  }
  function thanks() {
    var p = me(); var a = A.load().answers[PID];
    return '<div class="phone stack"><div class="card" style="text-align:center"><h1>Thank you, ' + esc(first(p)) + '</h1><p class="lead" style="margin:0 auto 16px">Your 2-year scores are in.</p>' +
      (a ? '<div style="text-align:left"><h2>Your scores over time</h2>' + plain(p) + '</div><p class="small muted">Worked out from the short demo form, so these numbers are only for show.</p>' : "") +
      '<p class="muted">Your next form is due in ' + A.fmtMonth(A.addYears(p.surgery.date, 5)) + '. We will remind you.</p><div class="btn-row" style="justify-content:center"><a class="btn" href="#home">Back to your knee</a><a href="#timeline">See your timeline</a></div></div></div>';
  }

  function files() {
    var p = me();
    return '<div class="phone stack"><div class="view-title"><h1>Scans and letters</h1></div>' +
      '<section class="card"><h2>Scans</h2>' + p.scans.map(function (s, i) { return '<a class="list-link" href="#file/scan/' + i + '"><span><strong>' + esc(s[1]) + '</strong><br><span class="muted mono">' + fmt(s[0]) + '</span></span><span>Open</span></a>'; }).join("") + '</section>' +
      '<section class="card"><h2>Letters and notes</h2>' + p.letters.map(function (l, i) { return '<a class="list-link" href="#file/letter/' + i + '"><span><strong>' + esc(l[1]) + '</strong><br><span class="muted">From ' + esc(l[2]) + ', <span class="mono">' + fmt(l[0]) + '</span></span></span><span>Open</span></a>'; }).join("") + '</section></div>';
  }
  function file(kind, i) {
    var p = me(), f = kind === "scan" ? p.scans[+i] : p.letters[+i];
    if (!f) return '<div class="phone"><h1>File not found</h1><a href="#files">Back to scans and letters</a></div>';
    var body = kind === "scan"
      ? '<div class="info">The image viewer is not built in this mock-up.</div><h2 style="margin-top:16px">Report</h2><p>' + esc(f[2]) + '</p>'
      : '<p>Dear ' + esc(first(p)) + ',</p><p>This is a placeholder letter in the demo. A real letter from ' + esc(f[2]) + ' would appear here.</p><p class="muted">Invented content.</p>';
    return '<div class="phone stack"><p style="margin:0"><a href="#files">Back to scans and letters</a></p><div class="card"><h1 style="font-size:28px">' + esc(f[1]) + '</h1><p class="muted mono">' + fmt(f[0]) + '</p>' + body + '</div></div>';
  }

  function reminders() {
    var p = me(), pr = A.load().prefs;
    function sw(id, label, on) { return '<div class="switch"><label for="' + id + '">' + label + '</label><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + '></div>'; }
    var due = formDone() ? '<li><span>2-year form</span><span class="tag ok">Sent</span></li>' : '<li><span>2-year form. <a href="#form">Fill it in</a></span><span class="tag due">Due now</span></li>';
    return '<div class="phone stack"><div class="view-title"><h1>Reminders</h1></div><section class="card"><h2>Coming up</h2><ul class="checklist">' + due +
      '<li><span>5-year form</span><span class="mono">' + A.fmtMonth(A.addYears(p.surgery.date, 5)) + '</span></li><li><span>10-year form</span><span class="mono">' + A.fmtMonth(A.addYears(p.surgery.date, 10)) + '</span></li></ul></section>' +
      '<section class="card"><h2>How we remind you</h2><form id="prefs">' + sw("pref-text", "Text message", pr.text !== false) + sw("pref-email", "Email", !!pr.email) + sw("pref-app", "Notice in this portal", pr.app !== false) +
      '<p class="muted small" style="margin-top:12px">In this demo nothing is sent.</p><button class="btn" type="submit">Save reminder settings</button></form></section></div>';
  }

  var SHARE = [["surgeon", "Your surgical team", "Ms Rachel Example and her team at Northfield Demo Hospital"], ["physio", "Your physio", "Test Physio C"], ["gp", "Your GP practice", "Invented practice"], ["research", "Research use", "Your scores, with your name removed, in registry reports"]];
  function sharing() {
    var p = me(), c = p.consent;
    var rows = SHARE.map(function (s) {
      var on = s[0] === "research" ? c.research : c[s[0]] !== false;
      return '<div class="switch"><label for="share-' + s[0] + '"><strong>' + s[1] + '</strong><br><span class="muted small">' + esc(s[2]) + '</span></label><input type="checkbox" id="share-' + s[0] + '"' + (on ? " checked" : "") + '></div>';
    }).join("");
    return '<div class="phone stack"><div class="view-title"><h1>Who can see your record</h1></div>' +
      '<section class="card"><h2>Access</h2><form id="share">' + rows + '<button class="btn" type="submit" style="margin-top:12px">Save access</button></form></section>' +
      '<section class="card"><h2>Who opened your record</h2><div class="scroll"><table><thead><tr><th scope="col">Date</th><th scope="col">Who</th><th scope="col">Why</th></tr></thead><tbody>' +
      p.access.map(function (a) { return '<tr><td class="mono">' + fmt(a[0]) + '</td><td>' + esc(a[1]) + '</td><td>' + esc(a[2]) + '</td></tr>'; }).join("") + '</tbody></table></div></section>' +
      '<section class="note"><h2 style="font-size:19px">About your vault key</h2><p>In the planned design your record is locked with a key that only you hold. If that key is lost, the record cannot be opened. How keys are recovered is not solved yet. This demo has no real key and no encryption. <a href="../security.html">Read more about security</a>.</p></section></div>';
  }

  window.afterRender = function (route) {
    var f = document.getElementById("qform");
    if (f) f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var step = location.hash.split("/")[1];
      var dr = draft(), errs = [];
      var qs = step === "1" ? IKDC_Q : step === "2" ? KOOS_Q : step === "3" ? LAST_Q : [];
      qs.forEach(function (q) {
        var c = f.querySelector('input[name="' + q[0] + '"]:checked');
        if (c) dr[q[0]] = +c.value; else errs.push([q[0] + "-0", "Choose an answer: " + (q[2] || q[1])]);
      });
      if (errs.length) {
        A.save(); A.showErrors(f, errs); return;
      }
      A.save();
      if (step === "1") A.go("form/2");
      else if (step === "2") A.go("form/3");
      else if (step === "3") A.go("form/4");
      else {
        var missing = ALL_Q.filter(function (q) { return dr[q[0]] == null; });
        if (missing.length) { A.go("form/1"); return; }
        // Demo scoring only. Real forms have their own scoring rules.
        var v = [];
        v[M.ikdc] = Math.round(IKDC_Q.reduce(function (t, q) { return t + (4 - dr[q[0]]) * 25; }, 0) / IKDC_Q.length);
        KOOS_Q.forEach(function (q, i) { v[M.koosPain + i] = 100 - dr[q[0]] * 25; });
        v[M.pain] = PAIN.score(dr[PAIN_Q[0][0]]);
        v[M.sane] = dr[SANE_Q[0][0]] * 10;
        var s = A.load(); s.answers[PID] = { tp: "y2", v: v }; delete s.draft; A.save();
        A.logAccess(PID, "Megan Sample", "Filled in 2-year scores");
        A.go("thanks");
      }
    });
    var pf = document.getElementById("prefs");
    if (pf) pf.addEventListener("submit", function (ev) {
      ev.preventDefault(); var s = A.load();
      s.prefs = { text: pf.querySelector("#pref-text").checked, email: pf.querySelector("#pref-email").checked, app: pf.querySelector("#pref-app").checked };
      A.save(); A.toast("Reminder settings saved.");
    });
    var sf = document.getElementById("share");
    if (sf) sf.addEventListener("submit", function (ev) {
      ev.preventDefault(); var s = A.load(), c = {};
      SHARE.forEach(function (x) { c[x[0]] = sf.querySelector("#share-" + x[0]).checked; });
      s.consent[PID] = c; A.save(); A.logAccess(PID, "Megan Sample", "Changed who can see the record");
      A.toast("Access saved. " + SHARE.filter(function (x) { return !c[x[0]]; }).length + " turned off.");
    });
  };

  A.router({ home: home, scores: scores, timeline: timeline, form: form, thanks: thanks, files: files, file: file, reminders: reminders, sharing: sharing }, "home");
})();
