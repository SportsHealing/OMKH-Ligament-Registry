/* Demo helpers: state, dates, status rules, charts and a small hash router.
   State lives in sessionStorage when the browser allows it, otherwise in memory. Nothing is sent anywhere. */
(function () {
  var KEY = "omkh-demo-v1";
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { mem = null; }
    if (!mem || typeof mem !== "object") mem = {};
    ["added", "ops", "reminders", "consent", "triage", "answers", "prefs", "access"].forEach(function (k) {
      if (!mem[k]) mem[k] = k === "added" ? [] : {};
    });
    return mem;
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* storage blocked: state lasts for this page only */ } }

  var TODAY = new Date(REG.today + "T12:00:00");
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function d(s) { return new Date(s + "T12:00:00"); }
  function fmt(s) { if (!s) return ""; var x = d(s); return x.getDate() + " " + MONTHS[x.getMonth()] + " " + x.getFullYear(); }
  function fmtMonth(s) { var x = d(s); return MONTHS_LONG[x.getMonth()] + " " + x.getFullYear(); }
  function addYears(s, n) { var x = d(s); x.setFullYear(x.getFullYear() + n); return x.toISOString().slice(0, 10); }
  function age(dob) { var b = d(dob); var a = TODAY.getFullYear() - b.getFullYear(); var m = TODAY.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && TODAY.getDate() < b.getDate())) a--; return a; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var TPS = [["pre", "Before surgery", 0], ["y1", "1 year", 1], ["y2", "2 years", 2], ["y5", "5 years", 5], ["y10", "10 years", 10]];
  var MEASURES = REG.measures, M = REG.M, PAIN = REG.painScore;
  function scale(m) { return m.min + " to " + m.max + (m.unit || ""); }
  function missingNames(sc) { return MEASURES.filter(function (m, i) { return sc.v[i] === null; }).map(function (m) { return m.short; }).join(", "); }

  function nhsValid(raw) {
    var n = String(raw || "").replace(/\s+/g, "");
    if (!/^\d{10}$/.test(n)) return false;
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += Number(n[i]) * (10 - i);
    var c = 11 - (sum % 11);
    if (c === 11) c = 0;
    if (c === 10) return false;
    return c === Number(n[9]);
  }
  function nhsFormat(raw) { var n = String(raw).replace(/\s+/g, ""); return n.slice(0, 3) + " " + n.slice(3, 6) + " " + n.slice(6); }

  function patients() {
    var s = load();
    return REG.patients.concat(s.added).map(function (p) {
      var q = JSON.parse(JSON.stringify(p));
      var op = s.ops[p.id];
      if (op && q.surgery) { Object.keys(op).forEach(function (k) { q.surgery[k] = op[k]; }); q.surgery.signed = true; }
      if (s.consent[p.id]) { Object.keys(s.consent[p.id]).forEach(function (k) { q.consent[k] = s.consent[p.id][k]; }); }
      if (s.answers[p.id] && q.surgery) {
        var a = s.answers[p.id];
        if (q.scores[a.tp]) { q.scores[a.tp].v = q.scores[a.tp].v.map(function (x, i) { return x === null ? a.v[i] : x; }); } else { q.scores[a.tp] = { date: REG.today, v: a.v }; }
      }
      if (s.access[p.id]) q.access = s.access[p.id].concat(q.access);
      return q;
    });
  }
  function patient(id) { return patients().filter(function (p) { return p.id === id; })[0] || null; }

  // Status rules for one patient.
  function status(p) {
    var out = { overdue: [], partial: [], dueSoon: null, next: null, opForm: "na", consent: p.consent.status, preopDue: false };
    if (!p.surgery) { out.preopDue = !p.scores.pre; out.next = { label: "Before surgery", date: null }; return out; }
    out.opForm = (p.surgery.signed && p.surgery.femFix && p.surgery.tibFix && p.surgery.meniscus && p.surgery.cartilage) ? "complete" : "incomplete";
    if (p.revision) { out.next = null; return out; }
    TPS.forEach(function (t) {
      if (t[0] === "pre") return;
      var due = addYears(p.surgery.date, t[2]);
      var sc = p.scores[t[0]];
      var grace = d(due); grace.setDate(grace.getDate() + 60);
      if (sc) { if (sc.v.some(function (v) { return v === null; })) out.partial.push({ tp: t[0], label: t[1], missing: missingNames(sc) }); return; }
      if (grace < TODAY) out.overdue.push({ tp: t[0], label: t[1], due: due });
      else if (!out.next) { out.next = { tp: t[0], label: t[1], date: due }; if (d(due) <= TODAY) out.dueSoon = out.next; }
    });
    return out;
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 5000);
  }
  function logAccess(id, who, why) {
    var s = load(); if (!s.access[id]) s.access[id] = [];
    s.access[id].unshift([REG.today, who, why]); save();
  }

  // Grouped bars: before surgery, 1 year, 2 years for one measure. Missing values are drawn as dashed outlines and labelled.
  function bars(p, idx, opts) {
    opts = opts || {};
    var m = MEASURES[idx], max = m.max, W = 240, H = 170, top = 22, base = 132;
    var cols = [["pre", "Before", "var(--c-base)"], ["y1", "1 yr", "var(--c-1y)"], ["y2", "2 yrs", "var(--c-2y)"]];
    var parts = [], words = [];
    cols.forEach(function (c, i) {
      var x = 22 + i * 74, sc = p.scores[c[0]], v = sc ? sc.v[idx] : undefined;
      if (v === null || v === undefined) {
        var txt = v === null ? "Missing" : "Not yet";
        parts.push('<rect x="' + x + '" y="' + (base - 50) + '" width="52" height="50" fill="none" stroke="var(--muted)" stroke-dasharray="5 4" stroke-width="1.5"></rect><text x="' + (x + 26) + '" y="' + (base - 20) + '" text-anchor="middle">' + txt + '</text>');
        words.push(c[1] + ": " + txt.toLowerCase());
      } else {
        var h = Math.max(2, (v / max) * (base - top));
        parts.push('<rect x="' + x + '" y="' + (base - h) + '" width="52" height="' + h + '" rx="3" fill="' + c[2] + '"></rect><text class="val" x="' + (x + 26) + '" y="' + (base - h - 6) + '" text-anchor="middle">' + v + '</text>');
        words.push(c[1] + ": " + v);
      }
      parts.push('<text x="' + (x + 26) + '" y="' + (base + 20) + '" text-anchor="middle">' + c[1] + '</text>');
    });
    var label = m.name + " (" + scale(m) + ", " + (m.lowerBetter ? "lower" : "higher") + " is better). " + words.join(", ") + ".";
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(label) + '"><line class="grid-line" x1="10" y1="' + base + '" x2="' + (W - 10) + '" y2="' + base + '"></line>' + parts.join("") + '</svg>';
  }
  function multiples(p, figNo) {
    var html = '<div class="multiples">';
    MEASURES.forEach(function (m, i) {
      html += '<figure><h3>' + esc(m.name) + '</h3><p class="small muted" style="margin:0">' + scale(m) + '. ' + (m.lowerBetter ? '<strong>Lower is better.</strong>' : 'Higher is better.') + '</p>' + bars(p, i) + '</figure>';
    });
    html += '</div><p class="legend bars-legend"><span><i class="sw" style="background:var(--c-base)"></i>Before surgery</span><span><i class="sw" style="background:var(--c-1y)"></i>1 year</span><span><i class="sw" style="background:var(--c-2y)"></i>2 years</span></p>';
    if (figNo) html += '<p class="small muted"><strong>Figure ' + figNo + '.</strong> Each score at each time point. IKDC, KOOS and SANE run 0 to 100, and higher is better. The ' + esc(PAIN.label.toLowerCase()) + ' runs ' + PAIN.min + ' to ' + PAIN.max + ', and lower is better. A dashed box means the form was not returned or is not yet due.</p>';
    return html;
  }
  // Simple line for one measure over time, used in the patient portal.
  function line(p, idx) {
    var m = MEASURES[idx], k = 150 / m.max;
    var pts = [], W = 600, H = 220;
    [["pre", "Before surgery"], ["y1", "1 year"], ["y2", "2 years"]].forEach(function (t, i) {
      var sc = p.scores[t[0]]; if (!sc || sc.v[idx] == null) return;
      pts.push({ x: 70 + i * 230, y: 180 - sc.v[idx] * k, v: sc.v[idx], l: t[1] });
    });
    if (!pts.length) return '<p class="muted">No scores yet.</p>';
    var s = '<svg class="chart big" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(m.name + " (" + scale(m) + ", " + (m.lowerBetter ? "lower" : "higher") + " is better): " + pts.map(function (q) { return q.l + " " + q.v; }).join(", ")) + '">';
    s += '<line class="grid-line" x1="30" y1="180" x2="570" y2="180"></line><line class="grid-line" x1="30" y1="30" x2="570" y2="30"></line><text x="26" y="34" text-anchor="end">' + m.max + '</text><text x="26" y="184" text-anchor="end">0</text>';
    s += '<polyline points="' + pts.map(function (q) { return q.x + "," + q.y; }).join(" ") + '" fill="none" stroke="var(--c-2y)" stroke-width="4" stroke-linecap="round"></polyline>';
    pts.forEach(function (q) { s += '<circle cx="' + q.x + '" cy="' + q.y + '" r="7" fill="var(--c-2y)"></circle><text class="val" x="' + q.x + '" y="' + (q.y - 14) + '" text-anchor="middle">' + q.v + '</text><text x="' + q.x + '" y="205" text-anchor="middle">' + q.l + '</text>'; });
    return s + '</svg>';
  }
  function scoreTable(p) {
    var h = '<div class="scroll"><table class="ruled"><caption class="visually-hidden">IKDC, KOOS, ' + esc(PAIN.label.toLowerCase()) + ' and SANE by time point</caption><thead><tr><th scope="col">Time point</th><th scope="col">Date</th>';
    MEASURES.forEach(function (m) { h += '<th scope="col" class="num">' + esc(m.short) + '</th>'; });
    h += '</tr></thead><tbody>';
    TPS.forEach(function (t) {
      var sc = p.scores[t[0]];
      if (sc) {
        h += '<tr><th scope="row">' + t[1] + '</th><td class="mono" style="white-space:nowrap">' + fmt(sc.date) + '</td>';
        sc.v.forEach(function (v) { h += '<td class="num">' + (v === null ? '<span class="tag due">Missing</span>' : v) + '</td>'; });
        h += '</tr>';
      } else if (p.surgery && t[0] !== "pre") {
        var due = addYears(p.surgery.date, t[2]);
        var g = d(due); g.setDate(g.getDate() + 60);
        var over = g < TODAY, now = !over && d(due) <= TODAY;
        h += '<tr><th scope="row">' + t[1] + '</th><td class="mono" style="white-space:nowrap">' + (over ? "Was due " : "Due ") + fmt(due) + '</td><td colspan="' + MEASURES.length + '">' + (p.revision ? '<span class="tag na">Stopped after revision</span>' : over ? '<span class="tag err">Overdue</span>' : now ? '<span class="tag due">Due now</span>' : '<span class="tag na">Not yet due</span>') + '</td></tr>';
      }
    });
    return h + '</tbody></table></div>';
  }

  // Hash router. Routes map a first path segment to a render function.
  function router(routes, fallback) {
    var view = document.getElementById("view");
    function run(first) {
      var h = location.hash.replace(/^#/, "");
      if (h === "main") { view.focus(); return; }
      var parts = h.split("/");
      var fn = routes[parts[0]] || routes[fallback];
      view.innerHTML = fn.apply(null, parts.slice(1)) || "";
      document.querySelectorAll("[data-route]").forEach(function (a) {
        var on = a.getAttribute("data-route") === (routes[parts[0]] ? parts[0] : fallback);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      if (window.afterRender) window.afterRender(parts[0] || fallback, parts.slice(1));
      if (!first) {
        var h1 = view.querySelector("h1");
        if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus(); }
        window.scrollTo(0, 0);
      }
      var t = view.querySelector("h1");
      if (t) document.title = t.textContent + " | UK Ligament Registry demo";
    }
    window.addEventListener("hashchange", function () { run(false); });
    run(true);
    return run;
  }

  // Form helpers: show errors in a summary and next to each field.
  function showErrors(form, errors) {
    form.querySelectorAll(".error-msg").forEach(function (e) { e.remove(); });
    form.querySelectorAll(".field-error").forEach(function (e) { e.classList.remove("field-error"); });
    form.querySelectorAll("[aria-invalid]").forEach(function (e) { e.removeAttribute("aria-invalid"); });
    var sum = form.querySelector(".error-summary");
    if (!errors.length) { if (sum) sum.hidden = true; return true; }
    errors.forEach(function (er) {
      var input = form.querySelector("#" + er[0]);
      var wrap = input.closest(".field") || input.closest("fieldset");
      wrap.classList.add("field-error");
      input.setAttribute("aria-invalid", "true");
      var m = document.createElement("span"); m.className = "error-msg"; m.id = er[0] + "-err"; m.textContent = er[1];
      var lab = wrap.querySelector("label, legend"); lab.insertAdjacentElement("afterend", m);
      input.setAttribute("aria-describedby", (input.getAttribute("data-hint") ? input.getAttribute("data-hint") + " " : "") + m.id);
    });
    sum.hidden = false;
    sum.querySelector("ul").innerHTML = errors.map(function (er) { return '<li><a href="#' + er[0] + '" data-focus="' + er[0] + '">' + esc(er[1]) + '</a></li>'; }).join("");
    sum.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function (ev) { ev.preventDefault(); document.getElementById(a.getAttribute("data-focus")).focus(); }); });
    sum.focus();
    return false;
  }

  function go(h) { if (location.hash.replace(/^#/, "") === h) window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash = h; }


  // Demo role bar: label the switch and say what each role can see. Runs on every demo page.
  var SCOPE = { "patient.html": "As a patient you see only your own record.", "clinician.html": "As a clinician you see only your own patients.", "admin.html": "As an administrator you see all patients and all data." };
  (function roleBar() {
    var bar = document.querySelector(".demo-bar"), nav = bar && bar.querySelector(".roles");
    if (!nav || bar.querySelector(".roles-label")) return;
    nav.setAttribute("aria-label", "Demo: switch role");
    var wrap = document.createElement("div"); wrap.className = "role-switch";
    var lab = document.createElement("p"); lab.className = "roles-label"; lab.textContent = "Demo: switch role";
    var note = document.createElement("p"); note.className = "roles-note";
    note.textContent = "In the real system each person sees only their own role.";
    nav.parentNode.insertBefore(wrap, nav); wrap.appendChild(lab); wrap.appendChild(nav); wrap.appendChild(note);
    var cur = nav.querySelector("[aria-current=page]"), who = bar.querySelector(".who");
    var sc = cur && SCOPE[cur.getAttribute("href")];
    if (sc && who) { var b = document.createElement("strong"); b.className = "scope"; b.textContent = sc; who.insertBefore(document.createTextNode(" "), who.firstChild); who.insertBefore(b, who.firstChild); }
  })();

  // Quiet row of honest security points. Each links to the security page.
  var ICON = {
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
    log: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"></path>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path>',
    info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path>'
  };
  function trustRow(href) {
    var items = [["lock", "Encrypted on your device before upload", "Planned. sgit vault design, in beta."], ["eye", "You choose who sees your record", "Shown in this demo."], ["log", "Every access is logged", "Shown in this demo."], ["shield", "UK GDPR and NHS data security standards", "Planned. Not yet assessed."], ["info", "Invented data in this mock-up", "No real login or encryption here."]];
    return '<ul class="trust-row" aria-label="Data security">' + items.map(function (t) {
      return '<li><a href="' + href + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[t[0]] + '</svg><span><strong>' + t[1] + '</strong><br><span class="trust-status">' + t[2] + '</span></span></a></li>';
    }).join("") + '</ul>';
  }

  window.App = { trustRow: trustRow, go: go, load: load, save: save, fmt: fmt, fmtMonth: fmtMonth, addYears: addYears, age: age, esc: esc, TPS: TPS, MEASURES: MEASURES, M: M, PAIN: PAIN, scale: scale,
    nhsValid: nhsValid, nhsFormat: nhsFormat, patients: patients, patient: patient, status: status, toast: toast, logAccess: logAccess,
    bars: bars, multiples: multiples, line: line, scoreTable: scoreTable, router: router, showErrors: showErrors, today: TODAY, d: d };
})();
