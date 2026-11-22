/* Shared page behaviour: mobile menu and light or dark theme. No network calls. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function readTheme() { try { return localStorage.getItem("omkh-theme"); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem("omkh-theme", v); } catch (e) { /* storage blocked: theme lasts for this page only */ } }
  var saved = readTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.getElementById("site-nav");
    var menu = document.getElementById("menu-btn");
    if (nav && menu) {
      nav.classList.add("closed");
      menu.hidden = false;
      menu.addEventListener("click", function () {
        var open = menu.getAttribute("aria-expanded") === "true";
        menu.setAttribute("aria-expanded", open ? "false" : "true");
        nav.classList.toggle("closed", open);
        menu.querySelector("span").textContent = open ? "Menu" : "Close";
      });
    }
    var tbtn = document.getElementById("theme-btn");
    if (tbtn) {
      var label = function () {
        var dark = currentTheme() === "dark";
        tbtn.setAttribute("aria-pressed", dark ? "true" : "false");
        tbtn.querySelector("span").textContent = dark ? "Light mode" : "Dark mode";
      };
      label();
      tbtn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        saveTheme(next);
        label();
      });
    }
  });
})();
