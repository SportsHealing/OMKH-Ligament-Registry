// Find a surgeon filter, research page form and toasts. Nothing leaves the page.
document.addEventListener("DOMContentLoaded", function () {
  var q = document.getElementById("s-q"), reg = document.getElementById("s-region");
  if (q && reg) {
    var cards = document.querySelectorAll(".surgeon");
    var run = function () {
      var t = q.value.trim().toLowerCase(), r = reg.value, n = 0;
      cards.forEach(function (c) {
        var ok = (!t || c.dataset.text.indexOf(t) > -1) && (!r || c.dataset.region === r);
        c.hidden = !ok; if (ok) n++;
      });
      document.getElementById("s-count").textContent = n + (n === 1 ? " surgeon" : " surgeons") + " found.";
      document.getElementById("s-none").hidden = n > 0;
    };
    q.addEventListener("input", run); reg.addEventListener("change", run);
  }
  var f = document.getElementById("data-request");
  if (f) f.addEventListener("submit", function () {
    document.getElementById("r-done").hidden = false; f.reset();
  });
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.createElement("p");
      t.className = "toast"; t.setAttribute("role", "status"); t.textContent = b.dataset.toast;
      document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3500);
    });
  });
});
