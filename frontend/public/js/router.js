// router.js — single-file SPA-style page switching (no separate HTML files, no broken relative paths).
(function () {
  const PAGES = ["home","about","brands","creators","platform","results","contact"];

  function showPage(key, opts) {
    opts = opts || {};
    if (!PAGES.includes(key)) key = "home";
    PAGES.forEach((p) => {
      const el = document.getElementById("page-" + p);
      if (el) el.style.display = (p === key) ? "block" : "none";
    });
    document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
      a.classList.toggle("active", a.dataset.page === key);
    });
    if (!opts.silent) window.scrollTo({ top: 0, behavior: "auto" });
    // reveal all scroll-reveal items in the newly shown page immediately
    const active = document.getElementById("page-" + key);
    if (active) active.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  function currentKeyFromHash() {
    const h = window.location.hash.replace("#", "");
    return PAGES.includes(h) ? h : "home";
  }

  function initRouter() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const key = a.getAttribute("href").replace("#", "");
      if (PAGES.includes(key)) {
        a.dataset.page = key;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.hash = key;
          showPage(key);
          const navLinks = document.getElementById("navLinks");
          const toggle = document.getElementById("navToggle");
          if (navLinks) navLinks.classList.remove("open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        });
      }
    });
    window.addEventListener("hashchange", () => showPage(currentKeyFromHash()));
    showPage(currentKeyFromHash(), { silent: true });
  }

  document.addEventListener("DOMContentLoaded", initRouter);
})();
