/* Patient portal demo. Signed in as the invented patient Megan Sample. */
(function () {
  var A = App, esc = A.esc, fmt = A.fmt;
  var PID = REG.user.patient;
  function me() { return A.patient(PID); }
  function first(p) { return p.name.split(" ")[0]; }
  function formDone() { return !!A.load().answers[PID]; }

  var KOOS_Q = [
    ["q1", "Pain", "How often do you have knee pain?", ["Never", "Monthly", "Weekly", "Daily", "Always"]],
    ["q2", "Symptoms", "How stiff is your knee after you first wake up?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["q3", "Daily living", "How hard is it to go up or down stairs?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["q4", "Sport", "How hard is it to twist or pivot on your injured knee?", ["None", "Mild", "Moderate", "Severe", "Extreme"]],
    ["q5", "Quality of life", "How much has your knee made you change the way you live?", ["Not at all", "Mildly", "Moderately", "Severely", "Totally"]]
  ];
  var MARX_Q = [
    ["m1", "Running: jogging or running while playing a sport."],
    ["m2", "Cutting: changing direction while running."],
    ["m3", "Decelerating: coming to a quick stop while running."],
    ["m4", "Pivoting: turning your body with your foot planted."]
  ];
  var MARX_OPTS = ["Less than once a month", "Once a month", "Once a week", "2 to 3 times a week", "4 or more times a week"];

  function draft() { var s = A.load(); if (!s.draft) s.draft = {}; return s.draft; }

  function reminderCard(p) {
    var st = A.status(p);
    if (formDone()) return '<div class="info"><strong>Thank you, ' + esc(first(p)) + '.</strong> Your 2-year scores are in. Your next form is due in ' + A.fmtMonth(A.addYears(p.surgery.date, 5)) + '.</div>';
    if (!st.dueSoon) return "";
    return '<div class="card" style="border:2px solid var(--c-1y)"><h2>Hi ' + esc(first(p)) + ', one short form is waiting.</h2><p>Your ' + esc(st.dueSoon.label.replace(/^(\d+) years?$/, "$1-year")) + ' scores. It takes about five minutes. Your answers help surgeons learn which repairs last.</p><a class="btn" href="#form">Start the form</a></div>';
  }

  function home() {
    var p = me(), pre = p.scores.pre, y1 = p.scores.y1;
    return '<div class="phone stack"><div class="view-title"><h1>Your knee</h1><span class="tag ok">' + esc(p.knee) + ' knee</span></div>' +
      reminderCard(p) +
      '<section class="card" aria-labelledby="prog"><h2 id="prog">How your knee is doing</h2>' +
      '<p>Your sport score went from <strong>' + pre.v[3] + '</strong> before surgery to <strong>' + y1.v[3] + '</strong> at 1 year. Scores run from 0 to 100. Higher is better.</p>' +
      '<figure>' + A.line(p, 3) + '<figcaption>KOOS Sport and recreation score at each time point.</figcaption></figure>' +
      '<p><a href="#timeline">See your full timeline</a></p></section>' +
      '<div class="grid"><a class="card list-link" href="#files"><span><strong>Scans and letters</strong><br><span class="muted">' + (p.scans.length + p.letters.length) + ' files</span></span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#sharing"><span><strong>Who can see your record</strong><br><span class="muted">Change access</span></span><span aria-hidden="true">&rarr;</span></a></div></div>';
  }

  function timeline() {
    var p = me(), items = [];
    items.push([p.injury.date, "Injury", p.injury.how + " " + p.injury.findings, "done"]);
    p.scans.forEach(function (s, i) { items.push([s[0], s[1], s[2] + ' <a href="#file/scan/' + i + '">Open</a>', "done"]); });
    items.push([p.surgery.date, "Surgery", esc(p.surgery.type) + " with " + esc(p.surgery.surgeon || p.surgeon) + ".", "done"]);
    p.rehab.forEach(function (r) { items.push([r[0], "Rehab", esc(r[1]) + ".", "done"]); });
    A.TPS.forEach(function (t) { var sc = p.scores[t[0]]; if (sc) items.push([sc.date, t[1] + " scores", "You filled in your form. Sport score " + (sc.v[3] == null ? "not given" : sc.v[3]) + ".", "done"]); });
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
    return '<div class="phone"><p class="muted" style="margin:0">Step ' + n + ' of 3</p><div class="progress" aria-hidden="true"><span style="width:' + Math.round(n / 3 * 100) + '%"></span></div>' +
      '<h1>' + title + '</h1><form id="qform" novalidate><div class="error-summary" tabindex="-1" hidden><h2>There is a problem</h2><ul></ul></div>' + inner + '</form></div>';
  }
  function form(step) {
    var p = me();
    if (formDone()) return '<div class="phone"><h1>Form already sent</h1><p>Thank you. Your 2-year scores are in.</p><a class="btn" href="#home">Back to your knee</a></div>';
    var dr = draft();
    if (!step) {
      return '<div class="phone stack"><div><h1>Your 2-year knee form</h1><p class="lead">About five minutes. Ten questions in two parts.</p></div>' +
        '<div class="card"><h2>What we ask</h2><p><strong>Part 1. Your knee.</strong> Five questions about pain, stiffness, daily life, sport and how you live.</p><p><strong>Part 2. Your activity.</strong> Four questions about how often you run, turn and stop quickly.</p><p class="muted small">This is a shortened demo, not the validated KOOS or Marx questionnaire. Nothing you choose is sent anywhere.</p></div>' +
        '<div class="btn-row"><a class="btn" href="#form/1">Start</a><a href="#home">Do it later</a></div></div>';
    }
    if (step === "1") {
      return stepShell(1, "Part 1. Your knee", '<p class="muted">Think about the last week.</p>' + KOOS_Q.map(function (q) {
        return '<fieldset id="' + q[0] + '"><legend>' + esc(q[2]) + ' <span class="muted small">(' + q[1] + ')</span></legend>' + radios(q[0], q[3], dr[q[0]]) + '</fieldset>';
      }).join("") + '<div class="btn-row"><button class="btn" type="submit">Save and continue</button><a href="#form">Back</a></div>');
    }
    if (step === "2") {
      return stepShell(2, "Part 2. Your activity", '<p class="muted">In the past year, at your healthiest, how often did you do each of these?</p>' + MARX_Q.map(function (q) {
        return '<fieldset id="' + q[0] + '"><legend>' + esc(q[1]) + '</legend>' + radios(q[0], MARX_OPTS, dr[q[0]]) + '</fieldset>';
      }).join("") + '<div class="btn-row"><button class="btn" type="submit">Save and continue</button><a href="#form/1">Back</a></div>');
    }
    if (step === "3") {
      var rows = KOOS_Q.map(function (q) { return '<div class="row"><span>' + esc(q[2]) + '</span><strong>' + esc(dr[q[0]] != null ? q[3][dr[q[0]]] : "Not answered") + '</strong></div>'; }).join("") +
        MARX_Q.map(function (q) { return '<div class="row"><span>' + esc(q[1]) + '</span><strong>' + esc(dr[q[0]] != null ? MARX_OPTS[dr[q[0]]] : "Not answered") + '</strong></div>'; }).join("");
      return stepShell(3, "Check your answers", '<div class="card">' + rows + '</div><p style="margin-top:16px"><a href="#form/1">Change part 1</a> or <a href="#form/2">change part 2</a>.</p><div class="btn-row"><button class="btn" type="submit">Send my answers</button></div>');
    }
    return '<div class="phone"><h1>Page not found</h1><a href="#form">Back to the form</a></div>';
  }
  function thanks() {
    var p = me(); var a = A.load().answers[PID];
    return '<div class="phone stack"><div class="card" style="text-align:center"><h1>Thank you, ' + esc(first(p)) + '</h1><p class="lead" style="margin:0 auto 16px">Your 2-year scores are in.</p>' +
      (a ? '<p>Your sport score is now <strong>' + a.v[3] + '</strong>. At 1 year it was ' + p.scores.y1.v[3] + '. Your activity score is <strong>' + a.marx + '</strong> out of 16.</p>' : "") +
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
      var qs = step === "1" ? KOOS_Q : step === "2" ? MARX_Q : [];
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
      else {
        var missing = KOOS_Q.concat(MARX_Q).filter(function (q) { return dr[q[0]] == null; });
        if (missing.length) { A.go("form/1"); return; }
        var v = KOOS_Q.map(function (q) { return 100 - dr[q[0]] * 25; });
        var marx = MARX_Q.reduce(function (s, q) { return s + dr[q[0]]; }, 0);
        v.push(marx);
        var s = A.load(); s.answers[PID] = { tp: "y2", v: v, marx: marx }; delete s.draft; A.save();
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

  A.router({ home: home, timeline: timeline, form: form, thanks: thanks, files: files, file: file, reminders: reminders, sharing: sharing }, "home");
})();
