// nav.js — mobile nav toggle + header shrink-on-scroll.
(function () {
  function initToggle() {
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (!toggle || !navLinks) return;
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  function initShrink() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function initKnotDraw() {
    const knot = document.getElementById("heroKnot");
    if (!knot) return;
    knot.querySelectorAll("path.thread").forEach((path, i) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = `stroke-dashoffset 1.4s cubic-bezier(.4,.1,.2,1) ${i * 0.25 + 0.1}s`;
      requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initToggle();
    initShrink();
    initKnotDraw();
  });
})();
