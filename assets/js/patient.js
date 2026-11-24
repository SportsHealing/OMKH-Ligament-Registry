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

  function trust() {
    return '<section class="trust" aria-labelledby="trust-h"><h2 id="trust-h">Keeping your data safe</h2>' + A.trustRow("../security.html") + '</section>';
  }

  function home() {
    var p = me(), st = A.status(p), done = formDone();
    var due = !done && st.dueSoon ? '<p class="info" style="margin:0"><span class="tag due">Due now</span> Hi ' + esc(first(p)) + '. Your ' + esc(st.dueSoon.label.replace(/^(\d+) years?$/, "$1-year")) + ' scores are waiting. About three minutes.</p>' : "";
    var score = done
      ? '<a class="cta-tile go" href="#results"><span class="t">See your latest results</span><span class="s">Your 2-year scores are in. Thank you, ' + esc(first(p)) + '.</span></a>'
      : '<a class="cta-tile go" href="#form"><span class="t">Score your knee</span><span class="s">' + ALL_Q.length + ' short questions, one at a time. See your results straight away.</span></a>';
    return '<div class="phone stack"><div class="view-title"><h1>Your knee</h1><span class="tag ok">' + esc(p.knee) + ' knee</span></div>' + due +
      '<div class="cta-pair">' + score +
      '<a class="cta-tile alt" href="#trends"><span class="t">See your trends</span><span class="s">Each score over time, from before surgery to now.</span></a></div>' +
      '<div class="grid"><a class="card list-link" href="#files"><span><strong>Scans and letters</strong><br><span class="muted">' + (p.scans.length + p.letters.length) + ' files</span></span><span aria-hidden="true">&rarr;</span></a>' +
      '<a class="card list-link" href="#sharing"><span><strong>Who can see your record</strong><br><span class="muted">Change access</span></span><span aria-hidden="true">&rarr;</span></a></div>' + trust() + '</div>';
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

  // The four scores a patient sees. KOOS is shown as the average of its five parts (demo only).
  var FOUR = [
    { name: "IKDC", what: "What your knee lets you do.", max: 100, idx: [M.ikdc] },
    { name: "KOOS", what: "Pain, stiffness, daily life, sport and how you live. Average of the five parts.", max: 100, idx: [M.koosPain, M.koosSym, M.koosAdl, M.koosSport, M.koosQol] },
    { name: PAIN.label, short: PAIN.short, what: "How bad your knee pain has been.", max: PAIN.max, lower: PAIN.lowerBetter, idx: [M.pain] },
    { name: "SANE", what: "Your knee as a percentage of normal.", max: 100, idx: [M.sane] }
  ];
  var SHORT = { pre: "Before", y1: "1 yr", y2: "2 yrs", y5: "5 yrs", y10: "10 yrs" };
  function val(sc, f) {
    if (!sc) return null;
    var xs = f.idx.map(function (i) { return sc.v[i]; }).filter(function (x) { return x != null; });
    return xs.length ? Math.round(xs.reduce(function (a, b) { return a + b; }, 0) / xs.length) : null;
  }
  function series(p, f) {
    return A.TPS.filter(function (t) { return val(p.scores[t[0]], f) != null; }).map(function (t) { return { tp: t[0], l: SHORT[t[0]], long: t[1], v: val(p.scores[t[0]], f) }; });
  }
  function shown(f, v) { return f.lower ? v + " out of " + f.max : v + "%"; }
  function better(f) { return f.lower ? "Lower is better." : "Higher is better."; }
  function aria(f, s) { return f.name + " (0 to " + f.max + ", " + (f.lower ? "lower" : "higher") + " is better). " + s.map(function (x) { return x.long + ": " + x.v; }).join(", ") + "."; }
  function barChart(f, s) {
    var W = 280, H = 170, top = 22, base = 132, n = s.length, slot = (W - 20) / n, bw = Math.min(56, slot - 16), parts = [];
    s.forEach(function (x, i) {
      var cx = 10 + slot * i + slot / 2, h = Math.max(2, x.v / f.max * (base - top));
      var col = i === n - 1 ? "var(--c-2y)" : i === 0 ? "var(--c-base)" : "var(--c-1y)";
      parts.push('<rect x="' + (cx - bw / 2) + '" y="' + (base - h) + '" width="' + bw + '" height="' + h + '" rx="3" fill="' + col + '"></rect><text class="val" x="' + cx + '" y="' + (base - h - 6) + '" text-anchor="middle">' + x.v + '</text><text x="' + cx + '" y="' + (base + 20) + '" text-anchor="middle">' + (i === n - 1 ? "Now" : x.l) + '</text>');
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(aria(f, s)) + '"><line class="grid-line" x1="6" y1="' + base + '" x2="' + (W - 6) + '" y2="' + base + '"></line>' + parts.join("") + '</svg>';
  }
  function lineChart(f, s) {
    var W = 600, H = 220, k = 150 / f.max, n = s.length;
    var pts = s.map(function (x, i) { return { x: n === 1 ? 310 : 90 + i * (440 / (n - 1)), y: 180 - x.v * k, v: x.v, l: x.l }; });
    var out = '<svg class="chart big" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(aria(f, s)) + '">';
    out += '<line class="grid-line" x1="50" y1="180" x2="570" y2="180"></line><line class="grid-line" x1="50" y1="30" x2="570" y2="30"></line><text x="44" y="36" text-anchor="end">' + f.max + '</text><text x="44" y="186" text-anchor="end">0</text>';
    out += '<polyline points="' + pts.map(function (q) { return q.x + "," + q.y; }).join(" ") + '" fill="none" stroke="var(--c-2y)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>';
    pts.forEach(function (q) { out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="7" fill="var(--c-2y)"></circle><text class="val" x="' + q.x + '" y="' + (q.y - 14) + '" text-anchor="middle">' + q.v + '</text><text x="' + q.x + '" y="205" text-anchor="middle">' + q.l + '</text>'; });
    return out + '</svg>';
  }
  var DISCLAIMER = '<p class="disclaimer" role="note">This is for guidance only. Your clinician will need to interpret these scores.</p>';

  function draft() { var s = A.load(); if (!s.draft) s.draft = {}; return s.draft; }

  function form(step) {
    var p = me(), n = ALL_Q.length;
    if (formDone()) return '<div class="phone stack"><h1>Your 2-year scores are in</h1><p>Thank you. You can look at your results again, or see how they compare over time.</p><div class="btn-row"><a class="btn" href="#results">See your results</a><a class="btn btn-secondary" href="#trends">See your trends over time</a></div><p class="small muted">Demo only: <button type="button" class="linkish" id="restart">clear my answers and start again</button>.</p></div>';
    if (!step) {
      return '<div class="phone stack"><div><h1>Score your knee</h1><p class="lead">' + n + ' short questions. One at a time. About three minutes.</p></div>' +
        '<div class="card"><p>Tap an answer and the next question appears. You can go back at any time. When you finish, you see your scores straight away.</p>' +
        '<p class="muted small">The questions come from IKDC, KOOS, the ' + esc(PAIN.label.toLowerCase()) + ' and SANE. This is a shortened demo, not the validated forms. Nothing you choose is sent anywhere.</p></div>' +
        '<div class="btn-row"><a class="btn btn-big" href="#form/1">Start</a><a href="#home">Do it later</a></div></div>';
    }
    var i = parseInt(step, 10);
    if (!(i >= 1 && i <= n)) return '<div class="phone"><h1>Page not found</h1><a href="#form">Back to the start</a></div>';
    var q = ALL_Q[i - 1], dr = draft(), cur = dr[q[0]], isNum = q[3].length > 6;
    var hint = q[0] === PAIN_Q[0][0] ? PAIN.anchors.join(". ") + "." : q[0] === SANE_Q[0][0] ? "100% means your knee feels completely normal." : "";
    var title = q[0] === PAIN_Q[0][0] ? PAIN.question : q[2];
    var answers = q[3].map(function (o, k) {
      return '<button type="button" class="answer" data-q="' + q[0] + '" data-v="' + k + '" aria-pressed="' + (String(cur) === String(k)) + '">' + esc(o) + '</button>';
    }).join("");
    var fwd = cur != null ? (i === n ? '<button type="button" class="btn" id="q-fwd">See my results</button>' : '<a class="btn btn-secondary" id="q-fwd" href="#form/' + (i + 1) + '">Forward</a>') : "";
    return '<div class="phone"><p class="q-count">Question ' + i + ' of ' + n + ' <span class="muted">(' + esc(q[1]) + ')</span></p>' +
      '<div class="progress" aria-hidden="true"><span style="width:' + Math.round((i - 1) / n * 100) + '%"></span></div>' +
      '<h1 class="q-title" id="q-h">' + esc(title) + '</h1>' + (hint ? '<p class="muted" id="q-hint" style="margin:0">' + esc(hint) + '</p>' : "") +
      '<div class="answers' + (isNum ? " num" : "") + '" role="group" aria-labelledby="q-h"' + (hint ? ' aria-describedby="q-hint"' : "") + '>' + answers + '</div>' +
      '<div class="q-nav"><a class="btn btn-secondary" href="#form' + (i > 1 ? "/" + (i - 1) : "") + '">Back</a>' + fwd + '</div>' +
      '<p class="small muted" style="margin-top:20px">Your answers are kept as you go. <a href="#home">Finish later</a>.</p></div>';
  }

  // Demo scoring only. Real forms have their own scoring rules.
  function finish() {
    var dr = draft(), v = [];
    var missing = ALL_Q.map(function (q, i) { return dr[q[0]] == null ? i + 1 : 0; }).filter(Boolean);
    if (missing.length) { A.go("form/" + missing[0]); return; }
    v[M.ikdc] = Math.round(IKDC_Q.reduce(function (t, q) { return t + (4 - dr[q[0]]) * 25; }, 0) / IKDC_Q.length);
    KOOS_Q.forEach(function (q, i) { v[M.koosPain + i] = 100 - dr[q[0]] * 25; });
    v[M.pain] = PAIN.score(dr[PAIN_Q[0][0]]);
    v[M.sane] = dr[SANE_Q[0][0]] * 10;
    var s = A.load(); s.answers[PID] = { tp: "y2", v: v }; delete s.draft; A.save();
    A.logAccess(PID, "Megan Sample", "Filled in 2-year scores");
    A.go("results");
  }

  function results() {
    var p = me();
    if (!formDone()) return '<div class="phone stack"><h1>No new results yet</h1><p>Score your knee to see your results.</p><a class="btn" href="#form">Score your knee</a></div>';
    var rows = "", figs = "";
    FOUR.forEach(function (f) {
      var s = series(p, f), now = s[s.length - 1], prev = s.length > 1 ? s[s.length - 2] : null, ch = "";
      if (prev) { var d = now.v - prev.v; ch = d === 0 ? "Same" : ((d > 0) !== !!f.lower ? "Better by " : "Worse by ") + Math.abs(d); }
      rows += '<tr><th scope="row">' + esc(f.short || f.name) + '</th><td class="num"><strong style="white-space:nowrap">' + shown(f, now.v) + '</strong><br><span class="small muted">' + (ch || "First score") + '</span></td><td class="num" style="white-space:nowrap">' + (prev ? shown(f, prev.v) : "None") + '</td></tr>';
      figs += '<figure class="card"><h2 style="font-size:21px;margin:0">' + esc(f.name) + '</h2><p class="big-num">' + (f.lower ? now.v + ' <small>out of ' + f.max + '</small>' : now.v + '%') + '</p><p class="small muted" style="margin:0">' + esc(f.what) + ' ' + (f.lower ? "<strong>Lower is better.</strong>" : better(f)) + '</p>' + barChart(f, s) + '</figure>';
    });
    return '<div class="phone stack"><div><h1>Your results</h1><p class="lead">Thank you, ' + esc(first(p)) + '. Here is how your knee scores today, next to your earlier scores.</p></div>' +
      '<section class="card" aria-labelledby="res-t"><h2 id="res-t">Your four scores</h2><div class="scroll"><table class="ruled"><thead><tr><th scope="col">Score</th><th scope="col" class="num">Today</th><th scope="col" class="num">Last time</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:8px">IKDC, KOOS and SANE run 0 to 100%. Higher is better. The ' + esc(PAIN.label.toLowerCase()) + ' runs ' + PAIN.min + ' to ' + PAIN.max + '. Lower is better. Worked out from the short demo form, so the numbers are only for show.</p></section>' +
      '<div class="result-grid">' + figs + '</div>' +
      '<p class="legend bars-legend"><span><i class="sw" style="background:var(--c-base)"></i>Before surgery</span><span><i class="sw" style="background:var(--c-1y)"></i>Earlier</span><span><i class="sw" style="background:var(--c-2y)"></i>Now</span></p>' +
      DISCLAIMER +
      '<div class="btn-row"><a class="btn btn-big" href="#trends">See your trends over time</a><a href="#home">Back to your knee</a></div></div>';
  }

  function trends() {
    var p = me(), figs = FOUR.map(function (f) {
      var s = series(p, f);
      return '<figure class="card"><h2 style="font-size:21px;margin:0">' + esc(f.name) + '</h2><p class="small muted" style="margin:0 0 8px">' + esc(f.what) + ' 0 to ' + f.max + '. ' + (f.lower ? "<strong>Lower is better.</strong>" : better(f)) + '</p>' + (s.length ? lineChart(f, s) : '<p class="muted">No scores yet.</p>') + '</figure>';
    }).join("");
    return '<div class="phone stack"><div class="view-title"><h1>Your trends</h1></div><p class="lead" style="margin:0">Each score at every time point, from before surgery to now.</p>' +
      (formDone() ? "" : '<p class="info" style="margin:0">Your 2-year scores are not in yet. <a href="#form">Score your knee</a> to add today to these charts.</p>') +
      figs + '<section class="card"><h2>In words</h2>' + plain(p) + '<p class="small"><a href="#scores">See every score in a table</a>.</p></section>' + DISCLAIMER + '</div>';
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
    var busy = false;
    document.querySelectorAll(".answer").forEach(function (b) {
      b.addEventListener("click", function () {
        if (busy) return; busy = true;
        draft()[b.getAttribute("data-q")] = +b.getAttribute("data-v"); A.save();
        document.querySelectorAll(".answer").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var i = parseInt(location.hash.split("/")[1], 10);
        setTimeout(function () { if (i >= ALL_Q.length) finish(); else A.go("form/" + (i + 1)); }, 250);
      });
    });
    var fw = document.getElementById("q-fwd");
    if (fw && fw.tagName === "BUTTON") fw.addEventListener("click", finish);
    var rs = document.getElementById("restart");
    if (rs) rs.addEventListener("click", function () { var s = A.load(); delete s.answers[PID]; delete s.draft; A.save(); A.go("form/1"); });
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

  A.router({ home: home, scores: scores, timeline: timeline, form: form, results: results, trends: trends, thanks: results, files: files, file: file, reminders: reminders, sharing: sharing }, "home");
})();
